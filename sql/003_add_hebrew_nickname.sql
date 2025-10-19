-- Add HebrewNickName and UserType columns to Players table
-- This allows Hebrew nicknames separate from full names
-- UserType: 'Tournament' | 'Casual' | 'Guest' | 'Inactive'

USE PokerLeague;
GO

-- Add the HebrewNickName column
ALTER TABLE Players
ADD HebrewNickName NVARCHAR(50) NULL;
GO

-- Add the UserType column
ALTER TABLE Players
ADD UserType NVARCHAR(20) NOT NULL DEFAULT 'Tournament';
GO

-- Optionally populate HebrewNickName from existing FullName (extract first name as default)
UPDATE Players
SET HebrewNickName = SUBSTRING(FullName, 1, CHARINDEX(' ', FullName + ' ') - 1)
WHERE HebrewNickName IS NULL;
GO

-- View results
SELECT PlayerId, FullName, HebrewNickName, UserType, Phone, IsActive
FROM Players
WHERE IsActive = 1
ORDER BY PlayerId;
GO
