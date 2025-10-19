-- 004_auth_seed.sql
-- Seed data for authentication system
SET NOCOUNT ON;
GO

-- Create default admin user
-- Username: admin
-- Password: PokerLeague2024! 
-- (Hash generated with SHA256 + salt - you should change this in production)
DECLARE @AdminSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @AdminPassword NVARCHAR(50) = 'PokerLeague2024!';
DECLARE @AdminHash NVARCHAR(255);

-- Simple hash (in production, use proper password hashing in C#)
SET @AdminHash = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @AdminPassword + @AdminSalt), 2);

-- Insert admin user (not linked to player)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Salt, Role, IsActive, Email)
    VALUES ('admin', @AdminHash, @AdminSalt, 'Admin', 1, 'admin@jitonclub.com');
    
    PRINT 'Admin user created: admin / PokerLeague2024!';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

-- Create user accounts for existing players
-- Default password for all: Poker123!
-- Uses NickName column for username (must exist in Players table)
DECLARE @DefaultSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @DefaultPassword NVARCHAR(50) = 'Poker123!';
DECLARE @DefaultHash NVARCHAR(255);

SET @DefaultHash = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @DefaultPassword + @DefaultSalt), 2);

-- Create player accounts (username = NickName)
-- Handle duplicates by appending PlayerId if NickName already exists
INSERT INTO Users (Username, PasswordHash, Salt, PlayerId, Role, IsActive, PhoneNumber)
SELECT 
    -- Use NickName, or append PlayerId if it would create a duplicate
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM Users u2 
            WHERE u2.Username = LOWER(COALESCE(p.NickName, LEFT(p.FullName, CHARINDEX(' ', p.FullName + ' ') - 1)))
            AND u2.PlayerId != p.PlayerId
        )
        THEN LOWER(COALESCE(p.NickName, LEFT(p.FullName, CHARINDEX(' ', p.FullName + ' ') - 1))) + CAST(p.PlayerId AS NVARCHAR(10))
        ELSE LOWER(COALESCE(p.NickName, LEFT(p.FullName, CHARINDEX(' ', p.FullName + ' ') - 1)))
    END AS Username,
    @DefaultHash AS PasswordHash,
    @DefaultSalt AS Salt,
    p.PlayerId,
    'Player' AS Role,
    p.IsActive,
    p.Phone AS PhoneNumber
FROM Players p
WHERE p.IsActive = 1
    AND NOT EXISTS (
        SELECT 1 FROM Users u 
        WHERE u.PlayerId = p.PlayerId
    )
    -- Only create if NickName exists or we can derive from FullName
    AND (p.NickName IS NOT NULL OR p.FullName LIKE '% %');

PRINT 'Player accounts created with default password: Poker123!';
PRINT 'NOTE: Usernames are based on NickName column';
PRINT 'If NickName is NULL, first name from FullName is used';
PRINT 'Duplicate nicknames get PlayerId appended (e.g., lior10, lior13)';
GO

-- Give host privileges to specific players (update as needed)
-- Update usernames to match your actual player nicknames
UPDATE Users
SET Role = 'Host'
WHERE PlayerId IN (
    SELECT PlayerId FROM Players WHERE NickName IN ('tomer', 'lidor', 'strul')
    OR FullName IN ('Tomer Lidor', 'Avi Strul')
);

PRINT 'Host privileges assigned';
GO

-- Create a job to clean up expired sessions (manual for now)
-- In production, you'd schedule this with SQL Agent or Azure Function
PRINT 'Run sp_CleanupExpiredSessions regularly to maintain sessions';
GO

-- Show created users
SELECT 
    u.Username,
    p.FullName AS PlayerName,
    p.NickName AS PlayerNickName,
    u.Role,
    CASE WHEN u.PlayerId IS NOT NULL THEN 'Yes' ELSE 'No' END AS LinkedToPlayer,
    u.IsActive,
    u.CreatedAt
FROM Users u
LEFT JOIN Players p ON u.PlayerId = p.PlayerId
ORDER BY u.Role, u.Username;

PRINT '';
PRINT '================================================';
PRINT 'Authentication system seeded successfully!';
PRINT '';
PRINT 'Default Credentials:';
PRINT '  Admin: admin / PokerLeague2024!';
PRINT '  Players: [nickname] / Poker123!';
PRINT '';
PRINT 'If two players have same nickname, PlayerId is appended';
PRINT 'Example: lior10, lior13 for two players named Lior';
PRINT '';
PRINT '??  IMPORTANT: ';
PRINT '   1. Make sure Players.NickName column is populated!';
PRINT '   2. Change default passwords before production!';
PRINT '================================================';
