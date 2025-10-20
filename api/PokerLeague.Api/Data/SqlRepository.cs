using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

namespace PokerLeague.Api.Data;

public class SqlRepository
{
    private readonly string _connStr;
    public SqlRepository(string? connStr)
        => _connStr = string.IsNullOrWhiteSpace(connStr)
            ? throw new InvalidOperationException("Missing SqlConnection")
            : connStr;

    private async Task<SqlConnection> OpenAsync()
    {
        var con = new SqlConnection(_connStr);
        await con.OpenAsync();
        return con;
    }

    public async Task<int> CreateEventAsync(int seasonId, DateOnly eventDate, int? hostPlayerId, int? tournamentTypeId, decimal? buyIn, int rebuyLimit, int? leagueKeeperId, string? notes)
    {
        using var con = await OpenAsync();
        var id = await con.ExecuteScalarAsync<int>(@"
IF NOT EXISTS (SELECT 1 FROM Events WHERE SeasonId=@seasonId AND EventDate=@eventDate)
BEGIN
    INSERT INTO Events(SeasonId, EventDate, HostPlayerId, TournamentTypeId, BuyInAmount, RebuyLimit, LeagueKeeperPlayerId, Notes)
    VALUES(@seasonId, @eventDate, @hostPlayerId, @tournamentTypeId, ISNULL(@buyIn, (SELECT DefaultBuyIn FROM TournamentTypes WHERE TournamentTypeId=@tournamentTypeId)), @rebuyLimit, @leagueKeeperId, @notes);
END
SELECT EventId FROM Events WHERE SeasonId=@seasonId AND EventDate=@eventDate;
", new { seasonId, eventDate, hostPlayerId, tournamentTypeId, buyIn, rebuyLimit, leagueKeeperId, notes });
        // seed invites for active players
        await con.ExecuteAsync(@"
INSERT INTO EventInvites(EventId, PlayerId)
SELECT @id, p.PlayerId FROM Players p WHERE p.IsActive=1
AND NOT EXISTS(SELECT 1 FROM EventInvites i WHERE i.EventId=@id AND i.PlayerId=p.PlayerId);
", new { id });
        return id;
    }

    public async Task<dynamic?> GetEventAsync(int eventId)
    {
        using var con = await OpenAsync();
        var evt = await con.QueryFirstOrDefaultAsync(@"
SELECT e.*, t.Name as TournamentTypeName, p.FullName as HostName, k.FullName as KeeperName
FROM Events e
LEFT JOIN TournamentTypes t ON e.TournamentTypeId=t.TournamentTypeId
LEFT JOIN Players p ON e.HostPlayerId=p.PlayerId
LEFT JOIN Players k ON e.LeagueKeeperPlayerId=k.PlayerId
WHERE e.EventId=@eventId", new { eventId });

        var players = await con.QueryAsync(@"
SELECT ep.EventPlayerId, ep.PlayerId, pl.FullName, ep.BuyIns, ep.Rebuys, ep.FinishPlace, ep.PrizeWon
FROM EventPlayers ep
JOIN Players pl ON ep.PlayerId=pl.PlayerId
WHERE ep.EventId=@eventId
ORDER BY pl.FullName", new { eventId });

        var invites = await con.QueryAsync(@"
SELECT i.InviteId, i.PlayerId, pl.FullName, r.Response, r.RespondedAt
FROM EventInvites i
JOIN Players pl ON i.PlayerId=pl.PlayerId
LEFT JOIN (
    SELECT ri.InviteId, ri.Response, ri.RespondedAt,
           ROW_NUMBER() OVER (PARTITION BY ri.InviteId ORDER BY ri.RespondedAt DESC) rn
    FROM EventResponses ri
) r1 ON r1.InviteId=i.InviteId AND r1.rn=1
LEFT JOIN EventResponses r ON r.ResponseId = (
    SELECT TOP 1 rr.ResponseId FROM EventResponses rr WHERE rr.InviteId=i.InviteId ORDER BY rr.RespondedAt DESC
)
WHERE i.EventId=@eventId
ORDER BY pl.FullName", new { eventId });

        return new { evt, players, invites };
    }

    public async Task<int> RsvpAsync(int eventId, int playerId, string response)
    {
        using var con = await OpenAsync();
        var inviteId = await con.ExecuteScalarAsync<int?>(@"SELECT InviteId FROM EventInvites WHERE EventId=@eventId AND PlayerId=@playerId",
            new { eventId, playerId });
        if (inviteId == null) return 0;
        var rows = await con.ExecuteAsync(@"INSERT INTO EventResponses(InviteId, Response, Source) VALUES(@inviteId, @response, 'Web')",
            new { inviteId, response });
        return rows;
    }

    public async Task<int> UpsertAttendanceAsync(int eventId, IEnumerable<AttendanceDto> items)
    {
        using var con = await OpenAsync();
        using var tr = con.BeginTransaction();
        int total = 0;
        foreach (var it in items)
        {
            var affected = await con.ExecuteAsync(@"
IF NOT EXISTS (SELECT 1 FROM EventPlayers WHERE EventId=@eventId AND PlayerId=@playerId)
    INSERT INTO EventPlayers(EventId, PlayerId, BuyIns, Rebuys) VALUES(@eventId, @playerId, @buyIns, @rebuys);
ELSE
    UPDATE EventPlayers SET BuyIns=@buyIns, Rebuys=@rebuys WHERE EventId=@eventId AND PlayerId=@playerId;",
            new { eventId, playerId = it.PlayerId, buyIns = it.BuyIns, rebuys = it.Rebuys }, tr);
            total += affected;
        }
        tr.Commit();
        return total;
    }

    public async Task<int> SaveResultsAsync(int eventId, IEnumerable<ResultDto> results)
    {
        using var con = await OpenAsync();
        using var tr = con.BeginTransaction();
        foreach (var r in results)
        {
            await con.ExecuteAsync(@"UPDATE EventPlayers SET FinishPlace=@finish WHERE EventId=@eventId AND PlayerId=@playerId",
                new { eventId, playerId = r.PlayerId, finish = r.FinishPlace }, tr);
        }

        // Compute payouts & league cut (simple rule: 10% to league, top3 50/30/20)
        var pool = await con.ExecuteScalarAsync<decimal>(@"
SELECT SUM(BuyIns + Rebuys) * e.BuyInAmount FROM EventPlayers ep
JOIN Events e ON e.EventId=ep.EventId
WHERE ep.EventId=@eventId", new { eventId }, tr);
        var leagueCut = pool * 0.10m;
        var distributable = pool - leagueCut;
        var shares = new[] {0.5m, 0.3m, 0.2m};

        // pay top 3
        var winners = (await con.QueryAsync<(int PlayerId, int Place)>(@"
SELECT PlayerId, FinishPlace FROM EventPlayers WHERE EventId=@eventId AND FinishPlace IS NOT NULL AND FinishPlace BETWEEN 1 AND 3",
            new { eventId }, tr)).ToList();
        foreach (var (pid, place) in winners)
        {
            var amt = distributable * shares[place-1];
            await con.ExecuteAsync(@"UPDATE EventPlayers SET PrizeWon=@amt WHERE EventId=@eventId AND PlayerId=@pid",
                new { eventId, pid, amt }, tr);
        }

        // ledger
        await con.ExecuteAsync(@"INSERT INTO LeagueLedger(EventId, AmountIn, AmountOut, KeeperPlayerId, Note)
VALUES(@eventId, @in, 0, (SELECT LeagueKeeperPlayerId FROM Events WHERE EventId=@eventId), N'10% from prize pool')",
            new { eventId, _in = leagueCut, @in = leagueCut }, tr);

        tr.Commit();
        return 1;
    }

    public async Task<IEnumerable<dynamic>> GetStandingsAsync(int seasonId)
    {
        using var con = await OpenAsync();
        // Simple points: presence=5, descending points by finish (1..10)
        return await con.QueryAsync(@"
WITH Points AS (
  SELECT ep.PlayerId,
         SUM(CASE WHEN ep.FinishPlace IS NULL THEN 0 ELSE
           CASE ep.FinishPlace
               WHEN 1 THEN 25 WHEN 2 THEN 18 WHEN 3 THEN 15 WHEN 4 THEN 12 WHEN 5 THEN 10
               WHEN 6 THEN 8 WHEN 7 THEN 6 WHEN 8 THEN 4 WHEN 9 THEN 3 WHEN 10 THEN 2 ELSE 1 END END) +
         SUM(5) AS TotalPoints
  FROM EventPlayers ep
  JOIN Events e ON e.EventId=ep.EventId
  WHERE e.SeasonId=@seasonId
  GROUP BY ep.PlayerId
)
SELECT p.PlayerId, pl.FullName, p.TotalPoints
FROM Points p
JOIN Players pl ON pl.PlayerId=p.PlayerId
ORDER BY p.TotalPoints DESC, pl.FullName ASC;", new { seasonId });
    }

    public async Task<IEnumerable<dynamic>> GetActivePlayersAsync()
    {
        using var con = await OpenAsync();
        return await con.QueryAsync(@"
SELECT PlayerId, FullName, NickName, HebrewNickName, Phone, LanguagePreference, UserType, IsActive
FROM Players
WHERE IsActive = 1
ORDER BY FullName");
    }
}

public record AttendanceDto(int PlayerId, int BuyIns, int Rebuys);
public record ResultDto(int PlayerId, int FinishPlace);
