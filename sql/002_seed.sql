
-- 002_seed.sql
INSERT INTO Players (FullName, Phone) VALUES
(N'Tomer Lidor', N'+972-50-0000001'),
(N'Lior Shmuli', N'+972-50-0000002'),
(N'Eran Shuster', N'+972-50-0000003'),
(N'Nati Merfish', N'+972-50-0000004'),
(N'Lior Goldberg', N'+972-50-0000005'),
(N'Doron Lida', N'+972-50-0000006'),
(N'Ovi Hamama', N'+972-50-0000007'),
(N'Oded Fisher', N'+972-50-0000008'),
(N'Arik Fridman', N'+972-50-0000009'),
(N'Nir Perach', N'+972-50-0000010'),
(N'Ex-pres&Frenkl', N'+972-50-0000011'),
(N'Avi Strul', N'+972-50-0000000'),
(N'Moshe Nachman', N'+972-50-0000012'),
(N'Danny Silberstein', N'+972-50-0000013'),
(N'Rami Bareli', N'+972-50-0000014'),
(N'Sharon Cohen', N'+972-50-0000015'),
(N'Zohar Alon', N'+972-50-0000016'),
(N'Ran Shacham', N'+972-50-0000017'),
(N'Dotan Gad', N'+972-50-0000018');

INSERT INTO Seasons (Name, StartDate, EndDate, Weeks, HasPlayoff)
VALUES (N'League Table Season 31', '2025-03-13', NULL, 30, 1);

INSERT INTO TournamentTypes (Name, DefaultBuyIn, DefaultRebuy, StructureJson)
VALUES
(N'Hold''em', 200, 100, NULL),
(N'Omaha', 200, 100, NULL),
(N'Stud', 200, 100, NULL),
(N'Special (400 Buy-in)', 400, 100, NULL);

-- Simple default rules (can be edited later)
-- Payouts: Top 3: 50%, 30%, 20% of prize pool
INSERT INTO PayoutRules (SeasonId, RuleType, RuleJson)
SELECT SeasonId, 'Payout', N'{"topN":3,"shares":[0.5,0.3,0.2],"leagueCut":0.1}'
FROM Seasons WHERE Name = N'League Table Season 31';

-- Points: complex scoring system based on real league data (position-based points)
INSERT INTO PayoutRules (SeasonId, RuleType, RuleJson)
SELECT SeasonId, 'Points', N'{"presence":0,"byPlace":[106,104,103,101,100,98,97,95,94,92,90,89,87,85,84,82,80,78,77,75,73,71,69,67,65,62,60,58,56,53,51,48,45,42,39]}'
FROM Seasons WHERE Name = N'League Table Season 31';
