using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using PokerLeague.Api.Data;
using PokerLeague.Api.Models;
using System.Net;

namespace PokerLeague.Api.Functions;

public class AuthFunctions
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthFunctions> _logger;

    public AuthFunctions(AuthService authService, ILogger<AuthFunctions> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/auth/login
    /// Login with username and password
    /// </summary>
    [Function("Login")]
    public async Task<HttpResponseData> Login(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/login")] HttpRequestData req)
    {
        try
        {
            var loginRequest = await req.ReadFromJsonAsync<LoginRequest>();
            if (loginRequest == null || string.IsNullOrWhiteSpace(loginRequest.Username) || string.IsNullOrWhiteSpace(loginRequest.Password))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { message = "?? ????? ?????? ??????" });
                return badRequest;
            }

            var ipAddress = GetClientIpAddress(req);
            var userAgent = req.Headers.TryGetValues("User-Agent", out var ua) ? ua.FirstOrDefault() : null;

            var result = await _authService.LoginAsync(loginRequest.Username, loginRequest.Password, ipAddress, userAgent);

            if (!result.Success)
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(result);
                return unauthorized;
            }

            // Set session cookie (HttpOnly for security)
            var response = req.CreateResponse(HttpStatusCode.OK);
            
            // Set cookie with session token
            response.Headers.Add("Set-Cookie", 
                $"poker_session={result.SessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800"); // 8 hours

            await response.WriteAsJsonAsync(result);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { message = "????? ???" });
            return errorResponse;
        }
    }

    /// <summary>
    /// GET /api/auth/validate
    /// Validate current session
    /// </summary>
    [Function("ValidateSession")]
    public async Task<HttpResponseData> ValidateSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/validate")] HttpRequestData req)
    {
        try
        {
            var sessionToken = GetSessionTokenFromRequest(req);
            if (string.IsNullOrEmpty(sessionToken))
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { isValid = false, message = "?? ???? token" });
                return unauthorized;
            }

            var result = await _authService.ValidateSessionAsync(sessionToken);

            var response = req.CreateResponse(result.IsValid ? HttpStatusCode.OK : HttpStatusCode.Unauthorized);
            await response.WriteAsJsonAsync(result);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Session validation failed");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { isValid = false, message = "????? ?????? session" });
            return errorResponse;
        }
    }

    /// <summary>
    /// POST /api/auth/logout
    /// Logout and invalidate session
    /// </summary>
    [Function("Logout")]
    public async Task<HttpResponseData> Logout(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/logout")] HttpRequestData req)
    {
        try
        {
            var sessionToken = GetSessionTokenFromRequest(req);
            if (!string.IsNullOrEmpty(sessionToken))
            {
                await _authService.LogoutAsync(sessionToken);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            
            // Clear session cookie
            response.Headers.Add("Set-Cookie", 
                "poker_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");

            await response.WriteAsJsonAsync(new { success = true, message = "?????? ??????" });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, message = "????? ????????" });
            return errorResponse;
        }
    }

    /// <summary>
    /// POST /api/auth/change-password
    /// Change user password (requires authentication)
    /// </summary>
    [Function("ChangePassword")]
    public async Task<HttpResponseData> ChangePassword(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/change-password")] HttpRequestData req)
    {
        try
        {
            // Validate session first
            var sessionToken = GetSessionTokenFromRequest(req);
            if (string.IsNullOrEmpty(sessionToken))
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { success = false, message = "????? ???????" });
                return unauthorized;
            }

            var sessionResult = await _authService.ValidateSessionAsync(sessionToken);
            if (!sessionResult.IsValid || sessionResult.User == null)
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { success = false, message = "session ?? ???" });
                return unauthorized;
            }

            var changeRequest = await req.ReadFromJsonAsync<ChangePasswordRequest>();
            if (changeRequest == null || 
                string.IsNullOrWhiteSpace(changeRequest.CurrentPassword) || 
                string.IsNullOrWhiteSpace(changeRequest.NewPassword))
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { success = false, message = "????? ?????? ?????? ???? ??????" });
                return badRequest;
            }

            var (success, message) = await _authService.ChangePasswordAsync(
                sessionResult.User.UserId, 
                changeRequest.CurrentPassword, 
                changeRequest.NewPassword);

            var response = req.CreateResponse(success ? HttpStatusCode.OK : HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { success, message });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password change failed");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, message = "????? ?????? ?????" });
            return errorResponse;
        }
    }

    /// <summary>
    /// GET /api/auth/me
    /// Get current user info
    /// </summary>
    [Function("GetCurrentUser")]
    public async Task<HttpResponseData> GetCurrentUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/me")] HttpRequestData req)
    {
        try
        {
            var sessionToken = GetSessionTokenFromRequest(req);
            if (string.IsNullOrEmpty(sessionToken))
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { message = "?? ?????" });
                return unauthorized;
            }

            var result = await _authService.ValidateSessionAsync(sessionToken);
            if (!result.IsValid || result.User == null)
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { message = "session ?? ???" });
                return unauthorized;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result.User);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get current user failed");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { message = "????? ???" });
            return errorResponse;
        }
    }

    // Helper methods

    private string? GetSessionTokenFromRequest(HttpRequestData req)
    {
        // Try cookie first
        if (req.Headers.TryGetValues("Cookie", out var cookies))
        {
            var cookieHeader = cookies.FirstOrDefault();
            if (!string.IsNullOrEmpty(cookieHeader))
            {
                var sessionCookie = cookieHeader.Split(';')
                    .Select(c => c.Trim())
                    .FirstOrDefault(c => c.StartsWith("poker_session="));

                if (sessionCookie != null)
                {
                    return sessionCookie.Substring("poker_session=".Length);
                }
            }
        }

        // Fallback to Authorization header (Bearer token)
        if (req.Headers.TryGetValues("Authorization", out var authHeaders))
        {
            var authHeader = authHeaders.FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length);
            }
        }

        return null;
    }

    private string? GetClientIpAddress(HttpRequestData req)
    {
        // Try X-Forwarded-For first (Azure Front Door / Proxy)
        if (req.Headers.TryGetValues("X-Forwarded-For", out var forwardedFor))
        {
            return forwardedFor.FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
        }

        // Fallback to X-Real-IP
        if (req.Headers.TryGetValues("X-Real-IP", out var realIp))
        {
            return realIp.FirstOrDefault();
        }

        return null;
    }
}
