using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;
using PokerLeague.Api.Data;

namespace PokerLeague.Api.Functions;

public class LeagueFunctions
{
    private readonly SqlRepository _repo;
    public LeagueFunctions(SqlRepository repo) => _repo = repo;

    [Function("Standings")]
    public async Task<HttpResponseData> Standings(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "league/{seasonId:int}/standings")] HttpRequestData req, int seasonId)
    {
        var list = await _repo.GetStandingsAsync(seasonId);
        var resp = req.CreateResponse(HttpStatusCode.OK);
        resp.Headers.Add("Content-Type", "application/json");
        var json = JsonSerializer.Serialize(list);
        using var writer = new StreamWriter(resp.Body);
        await writer.WriteAsync(json);
        return resp;
    }

    [Function("GetActivePlayers")]
    public async Task<HttpResponseData> GetActivePlayers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "players/active")] HttpRequestData req)
    {
        var players = await _repo.GetActivePlayersAsync();
        var resp = req.CreateResponse(HttpStatusCode.OK);
        await resp.WriteAsJsonAsync(players);
        return resp;
    }
}
