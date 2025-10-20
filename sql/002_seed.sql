-- 002_seed.sql
-- Poker League MVP - Seed Data
-- Includes: Players with nicknames, Season, Tournament types, Auth users
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================
-- PLAYERS WITH NICKNAMES, USER TYPES, AND AUTHENTICATION
-- ============================================

-- Create salts and hashes for authentication
DECLARE @AdminSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @AdminPassword NVARCHAR(50) = 'PokerLeague2024!';
DECLARE @AdminHash NVARCHAR(255) = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @AdminPassword + @AdminSalt), 2);

DECLARE @DefaultSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @DefaultPassword NVARCHAR(50) = 'Poker123!';
DECLARE @DefaultHash NVARCHAR(255) = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @DefaultPassword + @DefaultSalt), 2);

-- Simple test credentials for development
DECLARE @TestSalt NVARCHAR(255) = CONVERT(NVARCHAR(255), NEWID());
DECLARE @TestPassword NVARCHAR(50) = 'a!';
DECLARE @TestHash NVARCHAR(255) = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_512', @TestPassword + @TestSalt), 2);

-- Insert all players with authentication data where applicable
INSERT INTO Players (FullName, NickName, HebrewNickName, Phone, LanguagePreference, UserType, Username, PasswordHash, Salt, Email) VALUES
(N'Avi Strul', 'Strul', N'סטרול', N'+972-50-0000000', 'he', 'Admin', 'admin', @AdminHash, @AdminSalt, 'admin@jitonclub.com'),
(N'Test User', 'Test', N'טסט', N'+972-50-9999999', 'en', 'Admin', 'a', @TestHash, @TestSalt, 'test@jitonclub.com'),
(N'Tomer Lidor', 'Lidor', N'לידור', N'+972-50-0000001', 'he', 'LeaguePlayer', 'lidor', @DefaultHash, @DefaultSalt, NULL),
(N'Lior Shmuli', 'Shmueli', N'שמואלי', N'+972-50-0000002', 'he', 'LeaguePlayer', 'shmueli', @DefaultHash, @DefaultSalt, NULL),
(N'Eran Shuster', 'Shuster', N'שוסטר', N'+972-50-0000003', 'he', 'LeaguePlayer', 'shuster', @DefaultHash, @DefaultSalt, NULL),
(N'Nati Merfish', 'Merfish', N'מרפיש', N'+972-50-0000004', 'he', 'LeaguePlayer', 'merfish', @DefaultHash, @DefaultSalt, NULL),
(N'Lior Goldberg', 'Goldi', N'גולדי', N'+972-50-0000005', 'he', 'LeaguePlayer', 'goldi', @DefaultHash, @DefaultSalt, NULL),
(N'Doron Lida', 'Doroni', N'דורוני', N'+972-50-0000006', 'he', 'LeaguePlayer', 'doroni', @DefaultHash, @DefaultSalt, NULL),
(N'Ovi Hamama', 'Ovi', N'עובי', N'+972-50-0000007', 'he', 'LeaguePlayer', 'ovi', @DefaultHash, @DefaultSalt, NULL),
(N'Oded Fisher', 'Shoded', N'שודד', N'+972-50-0000008', 'he', 'LeaguePlayer', 'shoded', @DefaultHash, @DefaultSalt, NULL),
(N'Arik Fridman', 'ArikSun', N'אריקסאן', N'+972-50-0000009', 'he', 'LeaguePlayer', 'ariksun', @DefaultHash, @DefaultSalt, NULL),
(N'Nir Perach', 'Perach', N'פרח', N'+972-50-0000010', 'he', 'LeaguePlayer', 'perach', @DefaultHash, @DefaultSalt, NULL),
(N'Ex-pres&Frenkl', 'Frenkul', N'פרנקול', N'+972-50-0000011', 'he', 'LeaguePlayer', 'frenkul', @DefaultHash, @DefaultSalt, NULL),
(N'Moshe Nachman', 'Moshon', N'מושון', N'+972-50-0000012', 'he', 'LeaguePlayer', 'moshon', @DefaultHash, @DefaultSalt, NULL),
(N'Danny Silberstein', 'Dannino', N'דנינו', N'+972-50-0000013', 'he', 'LeaguePlayer', 'dannino', @DefaultHash, @DefaultSalt, NULL),
(N'Rami Bareli', 'Rambo', N'רמבו', N'+972-50-0000014', 'he', 'LeaguePlayer', 'rambo', @DefaultHash, @DefaultSalt, NULL),
(N'Sharon Cohen', 'Kob', N'קוב', N'+972-50-0000015', 'he', 'LeaguePlayer', 'kob', @DefaultHash, @DefaultSalt, NULL),
(N'Zohar Alon', 'Zoharinio', N'זוהריניו', N'+972-50-0000016', 'he', 'LeaguePlayer', 'zoharinio', @DefaultHash, @DefaultSalt, NULL),
(N'Ran Shacham', 'Shacham', N'שחם', N'+972-50-0000017', 'he', 'LeaguePlayer', 'shacham', @DefaultHash, @DefaultSalt, NULL),
(N'Dotan Gad', 'Dotke', N'דותקה', N'+972-50-0000018', 'he', 'LeaguePlayer', 'dotke', @DefaultHash, @DefaultSalt, NULL),
(N'Udi Levkovich', 'Udinka', N'אודינקה', N'+972-50-0000019', 'he', 'LeaguePlayer', 'udinka', @DefaultHash, @DefaultSalt, NULL);

PRINT 'Players with authentication created:';
PRINT 'Admin user: admin / PokerLeague2024!';
PRINT 'Test user: a / a!';
PRINT 'Player users: [nickname] / Poker123!';

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
-- SUMMARY
-- ============================================

PRINT '';
PRINT '================================================';
PRINT 'Seed data created successfully!';
PRINT 'Key login credentials:';
PRINT '  Admin: admin / PokerLeague2024!';
PRINT '  Test: a / a!';
PRINT '  Players: [nickname] / Poker123!';
PRINT '  Example: lidor / Poker123!';
PRINT '================================================';
GO
