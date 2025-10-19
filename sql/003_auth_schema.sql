-- 003_auth_schema.sql
-- Authentication and Authorization Schema
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
GO

-- Users table for authentication
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(255) NOT NULL,
    PlayerId INT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    Role NVARCHAR(20) NOT NULL DEFAULT 'Player', -- Player, Host, Admin
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastLoginAt DATETIME2 NULL,
    Email NVARCHAR(100) NULL,
    PhoneNumber NVARCHAR(20) NULL
);

CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_PlayerId ON Users(PlayerId);
GO

-- Sessions table for token management
CREATE TABLE UserSessions (
    SessionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    SessionToken UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() UNIQUE,
    RefreshToken UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() UNIQUE,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,
    LastActivityAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE INDEX IX_UserSessions_SessionToken ON UserSessions(SessionToken) WHERE IsActive = 1;
CREATE INDEX IX_UserSessions_UserId ON UserSessions(UserId);
GO

-- Login attempts tracking (security)
CREATE TABLE LoginAttempts (
    AttemptId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL,
    AttemptedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Success BIT NOT NULL,
    IpAddress NVARCHAR(50) NULL,
    FailureReason NVARCHAR(100) NULL
);

CREATE INDEX IX_LoginAttempts_Username ON LoginAttempts(Username, AttemptedAt);
GO

-- Password reset tokens
CREATE TABLE PasswordResetTokens (
    TokenId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    ResetToken UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() UNIQUE,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    UsedAt DATETIME2 NULL
);

CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(ResetToken) WHERE IsUsed = 0;
GO

-- Audit log for sensitive operations
CREATE TABLE AuditLog (
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL FOREIGN KEY REFERENCES Users(UserId),
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(50) NULL,
    EntityId INT NULL,
    Details NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_AuditLog_UserId ON AuditLog(UserId, Timestamp);
CREATE INDEX IX_AuditLog_Action ON AuditLog(Action, Timestamp);
GO

-- Stored procedures for auth operations

-- Validate session and extend if valid
CREATE PROCEDURE sp_ValidateSession
    @SessionToken UNIQUEIDENTIFIER,
    @ExtendMinutes INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Now DATETIME2 = SYSUTCDATETIME();
    DECLARE @UserId INT;
    DECLARE @PlayerId INT;
    DECLARE @Username NVARCHAR(50);
    DECLARE @Role NVARCHAR(20);
    
    -- Check session validity
    SELECT 
        @UserId = u.UserId,
        @PlayerId = u.PlayerId,
        @Username = u.Username,
        @Role = u.Role
    FROM UserSessions s
    INNER JOIN Users u ON s.UserId = u.UserId
    WHERE s.SessionToken = @SessionToken
        AND s.IsActive = 1
        AND s.ExpiresAt > @Now
        AND u.IsActive = 1;
    
    IF @UserId IS NOT NULL
    BEGIN
        -- Extend session and update last activity
        UPDATE UserSessions
        SET LastActivityAt = @Now,
            ExpiresAt = DATEADD(MINUTE, @ExtendMinutes, @Now)
        WHERE SessionToken = @SessionToken;
        
        -- Update last login
        UPDATE Users
        SET LastLoginAt = @Now
        WHERE UserId = @UserId;
        
        -- Return user info
        SELECT 
            @UserId AS UserId,
            @Username AS Username,
            @Role AS Role,
            @PlayerId AS PlayerId,
            1 AS IsValid;
    END
    ELSE
    BEGIN
        SELECT 0 AS IsValid;
    END
END
GO

-- Clean up expired sessions
CREATE PROCEDURE sp_CleanupExpiredSessions
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE UserSessions
    SET IsActive = 0
    WHERE ExpiresAt < SYSUTCDATETIME()
        AND IsActive = 1;
    
    -- Also clean up old login attempts (keep last 30 days)
    DELETE FROM LoginAttempts
    WHERE AttemptedAt < DATEADD(DAY, -30, SYSUTCDATETIME());
    
    -- Clean up old used password reset tokens (keep last 7 days)
    DELETE FROM PasswordResetTokens
    WHERE IsUsed = 1 
        AND UsedAt < DATEADD(DAY, -7, SYSUTCDATETIME());
END
GO

-- Check for rate limiting (prevent brute force)
CREATE FUNCTION fn_CheckLoginRateLimit(@Username NVARCHAR(50), @IpAddress NVARCHAR(50))
RETURNS BIT
AS
BEGIN
    DECLARE @IsAllowed BIT = 1;
    DECLARE @FailedAttempts INT;
    DECLARE @LastHour DATETIME2 = DATEADD(HOUR, -1, SYSUTCDATETIME());
    
    -- Count failed attempts in last hour
    SELECT @FailedAttempts = COUNT(*)
    FROM LoginAttempts
    WHERE Username = @Username
        AND Success = 0
        AND AttemptedAt > @LastHour;
    
    -- Block after 5 failed attempts
    IF @FailedAttempts >= 5
        SET @IsAllowed = 0;
    
    RETURN @IsAllowed;
END
GO

PRINT 'Authentication schema created successfully';
