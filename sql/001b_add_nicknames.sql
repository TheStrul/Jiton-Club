-- 001b_add_nicknames.sql
-- Add NickName and HebrewNickName columns to Players table

SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
GO

-- Check if columns already exist before adding
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'NickName')
BEGIN
    ALTER TABLE Players
    ADD NickName NVARCHAR(50) NULL;
    
    PRINT 'Added NickName column to Players table';
END
ELSE
BEGIN
    PRINT 'NickName column already exists';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Players') AND name = 'HebrewNickName')
BEGIN
    ALTER TABLE Players
    ADD HebrewNickName NVARCHAR(50) NULL;
    
    PRINT 'Added HebrewNickName column to Players table';
END
ELSE
BEGIN
    PRINT 'HebrewNickName column already exists';
END
GO

-- Update existing players with temporary nicknames (you should update these manually)
-- This extracts first name from FullName as temporary NickName
UPDATE Players
SET NickName = LOWER(LEFT(FullName, CHARINDEX(' ', FullName + ' ') - 1)),
    HebrewNickName = LEFT(FullName, CHARINDEX(' ', FullName + ' ') - 1)
WHERE NickName IS NULL;

PRINT 'Updated existing players with temporary nicknames';
PRINT 'IMPORTANT: Please update NickName and HebrewNickName manually for each player!';
GO

-- Show current player nicknames
SELECT 
    PlayerId,
    FullName,
    NickName,
    HebrewNickName,
    Phone,
    IsActive
FROM Players
ORDER BY FullName;
GO
