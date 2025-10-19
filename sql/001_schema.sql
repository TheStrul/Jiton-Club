-- 001_schema.sql
-- Poker League MVP - Complete Database Schema
-- Includes: League tables + Authentication system
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
GO

-- ============================================
-- CORE LEAGUE TABLES
-- ============================================

-- Players table with nickname support and user type
CREATE TABLE Players (
    PlayerId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    NickName NVARCHAR(50) NULL,
    HebrewNickName NVARCHAR(50) NULL,
    Phone NVARCHAR(50) NULL,
    UserType NVARCHAR(20) NOT NULL DEFAULT 'ClubMember', -- Admin, LeaguePlayer, ClubMember, Guest
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE INDEX IX_Players_NickName ON Players(NickName);
CREATE INDEX IX_Players_UserType ON Players(UserType);
GO

-- Seasons
CREATE TABLE Seasons (
    SeasonId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NULL,
    Weeks INT NULL,
    HasPlayoff BIT NOT NULL DEFAULT 1
);
GO

-- Tournament types and structures
CREATE TABLE TournamentTypes (
    TournamentTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    DefaultBuyIn DECIMAL(10,2) NOT NULL DEFAULT 100,
    DefaultRebuy DECIMAL(10,2) NOT NULL DEFAULT 100,
    StructureJson NVARCHAR(MAX) NULL
);
GO

-- Events
CREATE TABLE Events (
    EventId INT IDENTITY(1,1) PRIMARY KEY,
    SeasonId INT NOT NULL FOREIGN KEY REFERENCES Seasons(SeasonId),
    EventDate DATE NOT NULL,
    HostPlayerId INT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    TournamentTypeId INT NULL FOREIGN KEY REFERENCES TournamentTypes(TournamentTypeId),
    BuyInAmount DECIMAL(10,2) NOT NULL DEFAULT 100,
    RebuyLimit INT NOT NULL DEFAULT 2,
    LeagueKeeperPlayerId INT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    Notes NVARCHAR(500) NULL
);

CREATE UNIQUE INDEX IX_Events_SeasonDate ON Events(SeasonId, EventDate);
GO

-- Event invites (RSVP)
CREATE TABLE EventInvites (
    InviteId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL FOREIGN KEY REFERENCES Events(EventId),
    PlayerId INT NOT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    RsvpToken UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    SentAt DATETIME2 NULL
);

CREATE INDEX IX_EventInvites_Event ON EventInvites(EventId);
CREATE INDEX IX_EventInvites_Player ON EventInvites(PlayerId);
GO

-- RSVP responses (versioned)
CREATE TABLE EventResponses (
    ResponseId INT IDENTITY(1,1) PRIMARY KEY,
    InviteId INT NOT NULL FOREIGN KEY REFERENCES EventInvites(InviteId),
    Response NVARCHAR(20) NOT NULL, -- Yes/Late/No/Maybe
    RespondedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Source NVARCHAR(20) NOT NULL DEFAULT 'Web'
);

CREATE INDEX IX_EventResponses_Invite ON EventResponses(InviteId, RespondedAt);
GO

-- Event attendance and results
CREATE TABLE EventPlayers (
    EventPlayerId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL FOREIGN KEY REFERENCES Events(EventId),
    PlayerId INT NOT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    BuyIns INT NOT NULL DEFAULT 1,
    Rebuys INT NOT NULL DEFAULT 0,
    TotalPaid DECIMAL(10,2) NULL,
    FinishPlace INT NULL,
    PrizeWon DECIMAL(10,2) NULL,
    Knockouts INT NULL
);

CREATE INDEX IX_EventPlayers_Event ON EventPlayers(EventId);
CREATE INDEX IX_EventPlayers_Player ON EventPlayers(PlayerId);
GO

-- League financial tracking
CREATE TABLE LeagueLedger (
    LedgerId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL FOREIGN KEY REFERENCES Events(EventId),
    AmountIn DECIMAL(10,2) NOT NULL DEFAULT 0,
    AmountOut DECIMAL(10,2) NOT NULL DEFAULT 0,
    KeeperPlayerId INT NULL FOREIGN KEY REFERENCES Players(PlayerId),
    Note NVARCHAR(200) NULL
);

CREATE INDEX IX_LeagueLedger_Event ON LeagueLedger(EventId);
GO

-- Payout and scoring rules
CREATE TABLE PayoutRules (
    RuleId INT IDENTITY(1,1) PRIMARY KEY,
    SeasonId INT NOT NULL FOREIGN KEY REFERENCES Seasons(SeasonId),
    RuleType NVARCHAR(20) NOT NULL, -- 'Payout' | 'Points'
    RuleJson NVARCHAR(MAX) NOT NULL
);

CREATE INDEX IX_PayoutRules_Season ON PayoutRules(SeasonId);
GO

-- Google Sheets sync log
CREATE TABLE SheetsSyncLog (
    SyncId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL FOREIGN KEY REFERENCES Events(EventId),
    Status NVARCHAR(20) NOT NULL,
    Details NVARCHAR(MAX) NULL,
    SyncedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_SheetsSyncLog_Event ON SheetsSyncLog(EventId);
GO

-- ============================================
-- AUTHENTICATION TABLES
-- ============================================

-- Users for authentication
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

-- User sessions
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

-- Login attempts (rate limiting)
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

-- Audit log
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

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Validate and extend session
CREATE PROCEDURE sp_ValidateSession
    @SessionToken UNIQUEIDENTIFIER,
    @ExtendMinutes INT = 480
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Now DATETIME2 = SYSUTCDATETIME();
    DECLARE @UserId INT;
    DECLARE @PlayerId INT;
    DECLARE @Username NVARCHAR(50);
    DECLARE @Role NVARCHAR(20);
    
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
        UPDATE UserSessions
        SET LastActivityAt = @Now,
            ExpiresAt = DATEADD(MINUTE, @ExtendMinutes, @Now)
        WHERE SessionToken = @SessionToken;
        
        UPDATE Users
        SET LastLoginAt = @Now
        WHERE UserId = @UserId;
        
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

-- Cleanup expired sessions
CREATE PROCEDURE sp_CleanupExpiredSessions
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE UserSessions
    SET IsActive = 0
    WHERE ExpiresAt < SYSUTCDATETIME()
        AND IsActive = 1;
    
    DELETE FROM LoginAttempts
    WHERE AttemptedAt < DATEADD(DAY, -30, SYSUTCDATETIME());
    
    DELETE FROM PasswordResetTokens
    WHERE IsUsed = 1 
        AND UsedAt < DATEADD(DAY, -7, SYSUTCDATETIME());
END
GO

-- Rate limiting function
CREATE FUNCTION fn_CheckLoginRateLimit(@Username NVARCHAR(50), @IpAddress NVARCHAR(50))
RETURNS BIT
AS
BEGIN
    DECLARE @IsAllowed BIT = 1;
    DECLARE @FailedAttempts INT;
    DECLARE @LastHour DATETIME2 = DATEADD(HOUR, -1, SYSUTCDATETIME());
    
    SELECT @FailedAttempts = COUNT(*)
    FROM LoginAttempts
    WHERE Username = @Username
        AND Success = 0
        AND AttemptedAt > @LastHour;
    
    IF @FailedAttempts >= 5
        SET @IsAllowed = 0;
    
    RETURN @IsAllowed;
END
GO

PRINT 'Schema created successfully - League tables + Authentication system';
PRINT '';
PRINT 'Tables created:';
PRINT '  - 9 League tables (Players, Events, etc.)';
PRINT '  - 6 Authentication tables (Users, Sessions, etc.)';
PRINT '  - 2 Stored procedures';
PRINT '  - 1 Function';
