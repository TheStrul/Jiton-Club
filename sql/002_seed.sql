-- 002_seed.sql
-- Poker League MVP - Seed Data
-- Includes: Players with nicknames, Season, Tournament types, Auth users
SET NOCOUNT ON;
GO

-- ============================================
-- PLAYERS WITH NICKNAMES AND USER TYPES
-- ============================================

INSERT INTO Players (FullName, NickName, HebrewNickName, Phone, UserType) VALUES
(N'Tomer Lidor', 'Lidor', N'לידור', N'+972-50-0000001', 'LeaguePlayer'),
(N'Lior Shmuli', 'Shmueli', N'שמואלי', N'+972-50-0000002', 'LeaguePlayer'),
(N'Eran Shuster', 'Shuster', N'שוסטר', N'+972-50-0000003', 'LeaguePlayer'),
(N'Nati Merfish', 'Merfish', N'מרפיש', N'+972-50-0000004', 'LeaguePlayer'),
(N'Lior Goldberg', 'Goldi', N'גולדי', N'+972-50-0000005', 'LeaguePlayer'),
(N'Doron Lida', 'Doroni', N'דורוני', N'+972-50-0000006', 'LeaguePlayer'),
(N'Ovi Hamama', 'Ovi', N'עובי', N'+972-50-0000007', 'LeaguePlayer'),
(N'Oded Fisher', 'Shoded', N'שודד', N'+972-50-0000008', 'LeaguePlayer'),
(N'Arik Fridman', 'ArikSun', N'אריקסאן', N'+972-50-0000009', 'LeaguePlayer'),
(N'Nir Perach', 'Perach', N'פרח', N'+972-50-0000010', 'LeaguePlayer'),
(N'Ex-pres&Frenkl', 'Frenkul', N'פרנקול', N'+972-50-0000011', 'LeaguePlayer'),
(N'Avi Strul', 'Strul', N'סטרול', N'+972-50-0000000', 'Admin'),
(N'Moshe Nachman', 'Moshon', N'מושון', N'+972-50-0000012', 'LeaguePlayer'),
(N'Danny Silberstein', 'Dannino', N'דנינו', N'+972-50-0000013', 'LeaguePlayer'),
(N'Rami Bareli', 'Rambo', N'רמבו', N'+972-50-0000014', 'LeaguePlayer'),
(N'Sharon Cohen', 'Kob', N'קוב', N'+972-50-0000015', 'LeaguePlayer'),
(N'Zohar Alon', 'Zoharinio', N'זוהריניו', N'+972-50-0000016', 'LeaguePlayer'),
(N'Ran Shacham', 'Shacham', N'שחם', N'+972-50-0000017', 'LeaguePlayer'),
(N'Dotan Gad', 'Dotke', N'דותקה', N'+972-50-0000018', 'LeaguePlayer'),
(N'Udi Levkovich', 'Udinka', N'אודינקה', N'+972-50-0000019', 'LeaguePlayer');

GO

-- ============================================
-- SEASON & TOURNAMENT TYPES
-- ============================================

INSERT INTO Seasons (Name, StartDate, EndDate, Weeks, HasPlayoff)
VALUES (N'League Table Season 31', '2025-03-13', NULL, 30, 1);

PRINT 'Season created';
GO

INSERT INTO TournamentTypes (Name, DefaultBuyIn, DefaultRebuy, StructureJson)
VALUES
(N'Hold''em', 200, 100, NULL),
(N'Omaha', 200, 100, NULL),
(N'Stud', 200, 100, NULL),
(N'Special (400 Buy-in)', 400, 100, NULL);

PRINT 'Tournament types created';
GO

-- ============================================
-- PAYOUT & SCORING RULES
-- ============================================

-- Payouts: Top 3: 50%, 30%, 20% of prize pool (10% league cut)
INSERT INTO PayoutRules (SeasonId, RuleType, RuleJson)
SELECT SeasonId, 'Payout', N'{"topN":3,"shares":[0.5,0.3,0.2],"leagueCut":0.1}'
FROM Seasons WHERE Name = N'League Table Season 31';

-- Points: Position-based points (place 1-35)
INSERT INTO PayoutRules (SeasonId, RuleType, RuleJson)
SELECT SeasonId, 'Points', N'{"presence":0,"byPlace":[106,104,103,101,100,98,97,95,94,92,90,89,87,85,84,82,80,78,77,75,73,71,69,67,65,62,60,58,56,53,51,48,45,42,39]}'
FROM Seasons WHERE Name = N'League Table Season 31';

PRINT 'Payout rules configured';
GO

-- ============================================
-- AUTHENTICATION USERS
-- ============================================

-- Admin user
DECLARE @AdminSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @AdminPassword NVARCHAR(50) = 'PokerLeague2024!';
DECLARE @AdminHash NVARCHAR(255);

SET @AdminHash = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @AdminPassword + @AdminSalt), 2);

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

-- Player users (based on NickName)
DECLARE @DefaultSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @DefaultPassword NVARCHAR(50) = 'Poker123!';
DECLARE @DefaultHash NVARCHAR(255);

SET @DefaultHash = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @DefaultPassword + @DefaultSalt), 2);

INSERT INTO Users (Username, PasswordHash, Salt, PlayerId, Role, IsActive, PhoneNumber)
SELECT 
    LOWER(p.NickName) AS Username,
    @DefaultHash AS PasswordHash,
    @DefaultSalt AS Salt,
    p.PlayerId,
    'Player' AS Role,
    p.IsActive,
    p.Phone AS PhoneNumber
FROM Players p
WHERE p.IsActive = 1
    AND p.NickName IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM Users u 
        WHERE u.PlayerId = p.PlayerId
    );

PRINT 'Player accounts created with default password: Poker123!';
GO

-- Assign host privileges
UPDATE Users
SET Role = 'Host'
WHERE PlayerId IN (
    SELECT PlayerId FROM Players 
    WHERE NickName IN ('tomer', 'avi', 'liors')
);

PRINT 'Host privileges assigned to: tomer, avi, liors';
GO

-- ============================================
-- SUMMARY
-- ============================================

PRINT '';
PRINT '================================================';
PRINT 'Seed data created successfully!';
PRINT '================================================';
GO
