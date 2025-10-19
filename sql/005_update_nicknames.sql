-- Update Player Nicknames
-- Use this script to set proper NickName and HebrewNickName for each player

-- First, let's see current players
SELECT 
    PlayerId,
    FullName,
    NickName,
    HebrewNickName,
    Phone
FROM Players
WHERE IsActive = 1
ORDER BY FullName;
GO

-- Example: Update nicknames for your players
-- Modify these based on your actual club members

-- Update individually (recommended for accuracy)
UPDATE Players SET NickName = 'arik', HebrewNickName = N'????' WHERE PlayerId = 17;
UPDATE Players SET NickName = 'avi', HebrewNickName = N'???' WHERE PlayerId = 20;
UPDATE Players SET NickName = 'danny', HebrewNickName = N'???' WHERE PlayerId = 22;
UPDATE Players SET NickName = 'doron', HebrewNickName = N'?????' WHERE PlayerId = 14;
UPDATE Players SET NickName = 'dotan', HebrewNickName = N'????' WHERE PlayerId = 27;
UPDATE Players SET NickName = 'eran', HebrewNickName = N'???' WHERE PlayerId = 11;
UPDATE Players SET NickName = 'frenkl', HebrewNickName = N'?????' WHERE PlayerId = 19;

-- For the two Liors - give them unique nicknames
UPDATE Players SET NickName = 'liorg', HebrewNickName = N'????? ??' WHERE PlayerId = 13; -- Lior Goldberg
UPDATE Players SET NickName = 'liors', HebrewNickName = N'????? ??' WHERE PlayerId = 10; -- Lior Shmuli

UPDATE Players SET NickName = 'moshe', HebrewNickName = N'???' WHERE PlayerId = 21;
UPDATE Players SET NickName = 'nati', HebrewNickName = N'???' WHERE PlayerId = 12;
UPDATE Players SET NickName = 'nir', HebrewNickName = N'???' WHERE PlayerId = 18;
UPDATE Players SET NickName = 'oded', HebrewNickName = N'????' WHERE PlayerId = 16;
UPDATE Players SET NickName = 'ovi', HebrewNickName = N'????' WHERE PlayerId = 15;
UPDATE Players SET NickName = 'rami', HebrewNickName = N'???' WHERE PlayerId = 23;
UPDATE Players SET NickName = 'ran', HebrewNickName = N'??' WHERE PlayerId = 26;
UPDATE Players SET NickName = 'sharon', HebrewNickName = N'????' WHERE PlayerId = 24;
UPDATE Players SET NickName = 'tomer', HebrewNickName = N'????' WHERE PlayerId = 9;
UPDATE Players SET NickName = 'zohar', HebrewNickName = N'????' WHERE PlayerId = 25;

PRINT 'Player nicknames updated!';
GO

-- Verify the updates
SELECT 
    PlayerId,
    FullName,
    NickName + ' (' + HebrewNickName + ')' AS Nickname,
    Phone
FROM Players
WHERE IsActive = 1
ORDER BY NickName;
GO

PRINT '';
PRINT '================================================';
PRINT 'Player nicknames configured!';
PRINT '';
PRINT 'Next step: Run 004_auth_seed.sql to create user accounts';
PRINT 'Usernames will be based on NickName column';
PRINT '';
PRINT 'Example logins:';
PRINT '  Username: tomer    Password: Poker123!';
PRINT '  Username: liorg    Password: Poker123!';
PRINT '  Username: liors    Password: Poker123!';
PRINT '================================================';
