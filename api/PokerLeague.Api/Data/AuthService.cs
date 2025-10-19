using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using Dapper;
using PokerLeague.Api.Models;

namespace PokerLeague.Api.Data;

public class AuthService
{
    private readonly string _connectionString;
    private const int SessionExpirationMinutes = 480; // 8 hours
    private const int MaxLoginAttempts = 5;

    public AuthService(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// Authenticate user and create session
    /// </summary>
    public async Task<LoginResponse> LoginAsync(string username, string password, string? ipAddress = null, string? userAgent = null)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        // Check rate limiting
        var isAllowed = await CheckRateLimitAsync(connection, username, ipAddress);
        if (!isAllowed)
        {
            await LogLoginAttemptAsync(connection, username, false, ipAddress, "Rate limit exceeded");
            return new LoginResponse(false, null, null, "???? ??? ???????? ???????. ??? ??? ????? ????.");
        }

        // Get user with password hash and salt
        var userRecord = await connection.QueryFirstOrDefaultAsync<UserRecord>(
            @"SELECT u.UserId, u.Username, u.PasswordHash, u.Salt, u.Role, u.PlayerId, u.IsActive, p.FullName
              FROM Users u
              LEFT JOIN Players p ON u.PlayerId = p.PlayerId
              WHERE u.Username = @Username",
            new { Username = username }
        );

        if (userRecord == null)
        {
            await LogLoginAttemptAsync(connection, username, false, ipAddress, "User not found");
            return new LoginResponse(false, null, null, "?? ????? ?? ????? ??????");
        }

        if (!userRecord.IsActive)
        {
            await LogLoginAttemptAsync(connection, username, false, ipAddress, "User inactive");
            return new LoginResponse(false, null, null, "????? ?? ????");
        }

        // Verify password
        var isValid = VerifyPassword(password, userRecord.PasswordHash, userRecord.Salt);
        if (!isValid)
        {
            await LogLoginAttemptAsync(connection, username, false, ipAddress, "Invalid password");
            return new LoginResponse(false, null, null, "?? ????? ?? ????? ??????");
        }

        // Create session
        var sessionToken = Guid.NewGuid();
        var refreshToken = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddMinutes(SessionExpirationMinutes);

        await connection.ExecuteAsync(
            @"INSERT INTO UserSessions (UserId, SessionToken, RefreshToken, ExpiresAt, IpAddress, UserAgent)
              VALUES (@UserId, @SessionToken, @RefreshToken, @ExpiresAt, @IpAddress, @UserAgent)",
            new
            {
                userRecord.UserId,
                SessionToken = sessionToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                IpAddress = ipAddress,
                UserAgent = userAgent
            }
        );

        // Update last login
        await connection.ExecuteAsync(
            "UPDATE Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserId = @UserId",
            new { userRecord.UserId }
        );

        // Log successful login
        await LogLoginAttemptAsync(connection, username, true, ipAddress, null);
        await LogAuditAsync(connection, userRecord.UserId, "Login", "User", userRecord.UserId, null, ipAddress);

        var userInfo = new UserInfo(
            userRecord.UserId,
            userRecord.Username,
            userRecord.Role,
            userRecord.PlayerId,
            userRecord.FullName
        );

        return new LoginResponse(true, sessionToken.ToString(), userInfo, "?????? ??????");
    }

    /// <summary>
    /// Validate session token and return user info
    /// </summary>
    public async Task<SessionValidationResult> ValidateSessionAsync(string sessionToken)
    {
        if (!Guid.TryParse(sessionToken, out var token))
        {
            return new SessionValidationResult(false, null);
        }

        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var result = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "EXEC sp_ValidateSession @SessionToken, @ExtendMinutes",
            new { SessionToken = token, ExtendMinutes = 30 }
        );

        if (result?.IsValid != 1)
        {
            return new SessionValidationResult(false, null);
        }

        var userInfo = new UserInfo(
            result.UserId,
            result.Username,
            result.Role,
            result.PlayerId,
            null // FullName not returned by SP, can add if needed
        );

        return new SessionValidationResult(true, userInfo);
    }

    /// <summary>
    /// Logout user by invalidating session
    /// </summary>
    public async Task<bool> LogoutAsync(string sessionToken)
    {
        if (!Guid.TryParse(sessionToken, out var token))
        {
            return false;
        }

        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var rows = await connection.ExecuteAsync(
            @"UPDATE UserSessions 
              SET IsActive = 0 
              WHERE SessionToken = @SessionToken",
            new { SessionToken = token }
        );

        return rows > 0;
    }

    /// <summary>
    /// Change user password
    /// </summary>
    public async Task<(bool Success, string Message)> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var user = await connection.QueryFirstOrDefaultAsync<UserRecord>(
            "SELECT UserId, Username, PasswordHash, Salt FROM Users WHERE UserId = @UserId",
            new { UserId = userId }
        );

        if (user == null)
        {
            return (false, "????? ?? ????");
        }

        // Verify current password
        if (!VerifyPassword(currentPassword, user.PasswordHash, user.Salt))
        {
            return (false, "?????? ??????? ?????");
        }

        // Generate new hash
        var (hash, salt) = HashPassword(newPassword);

        // Update password
        await connection.ExecuteAsync(
            @"UPDATE Users 
              SET PasswordHash = @Hash, Salt = @Salt 
              WHERE UserId = @UserId",
            new { Hash = hash, Salt = salt, UserId = userId }
        );

        // Invalidate all existing sessions for security
        await connection.ExecuteAsync(
            "UPDATE UserSessions SET IsActive = 0 WHERE UserId = @UserId",
            new { UserId = userId }
        );

        await LogAuditAsync(connection, userId, "PasswordChanged", "User", userId, null, null);

        return (true, "?????? ????? ??????");
    }

    /// <summary>
    /// Create new user (admin only)
    /// </summary>
    public async Task<(bool Success, string Message, int? UserId)> CreateUserAsync(CreateUserRequest request)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        // Check if username already exists
        var exists = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Users WHERE Username = @Username",
            new { request.Username }
        );

        if (exists > 0)
        {
            return (false, "?? ????? ???? ??????", null);
        }

        // Hash password
        var (hash, salt) = HashPassword(request.Password);

        // Insert user
        var userId = await connection.ExecuteScalarAsync<int>(
            @"INSERT INTO Users (Username, PasswordHash, Salt, Role, PlayerId, Email, PhoneNumber)
              OUTPUT INSERTED.UserId
              VALUES (@Username, @Hash, @Salt, @Role, @PlayerId, @Email, @PhoneNumber)",
            new
            {
                request.Username,
                Hash = hash,
                Salt = salt,
                request.Role,
                request.PlayerId,
                request.Email,
                request.PhoneNumber
            }
        );

        return (true, "????? ???? ??????", userId);
    }

    // Helper methods

    private (string Hash, string Salt) HashPassword(string password)
    {
        var salt = Guid.NewGuid().ToString();
        var hash = ComputeHash(password, salt);
        return (hash, salt);
    }

    private bool VerifyPassword(string password, string storedHash, string salt)
    {
        var hash = ComputeHash(password, salt);
        return hash == storedHash;
    }

    private string ComputeHash(string password, string salt)
    {
        using var sha512 = SHA512.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha512.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    private async Task<bool> CheckRateLimitAsync(SqlConnection connection, string username, string? ipAddress)
    {
        var lastHour = DateTime.UtcNow.AddHours(-1);

        var failedAttempts = await connection.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) 
              FROM LoginAttempts 
              WHERE Username = @Username 
                AND Success = 0 
                AND AttemptedAt > @LastHour",
            new { Username = username, LastHour = lastHour }
        );

        return failedAttempts < MaxLoginAttempts;
    }

    private async Task LogLoginAttemptAsync(SqlConnection connection, string username, bool success, string? ipAddress, string? failureReason)
    {
        await connection.ExecuteAsync(
            @"INSERT INTO LoginAttempts (Username, Success, IpAddress, FailureReason)
              VALUES (@Username, @Success, @IpAddress, @FailureReason)",
            new { Username = username, Success = success, IpAddress = ipAddress, FailureReason = failureReason }
        );
    }

    private async Task LogAuditAsync(SqlConnection connection, int userId, string action, string? entityType, int? entityId, string? details, string? ipAddress)
    {
        await connection.ExecuteAsync(
            @"INSERT INTO AuditLog (UserId, Action, EntityType, EntityId, Details, IpAddress)
              VALUES (@UserId, @Action, @EntityType, @EntityId, @Details, @IpAddress)",
            new { UserId = userId, Action = action, EntityType = entityType, EntityId = entityId, Details = details, IpAddress = ipAddress }
        );
    }

    // Internal record for database mapping
    private record UserRecord(
        int UserId,
        string Username,
        string PasswordHash,
        string Salt,
        string Role,
        int? PlayerId,
        bool IsActive,
        string? FullName
    );
}
