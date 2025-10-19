using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;
using PokerLeague.Api.Data;
using PokerLeague.Api.Models;

namespace PokerLeague.Api.Functions;

public class EventsFunctions
{
    private readonly SqlRepository _repo;
    public EventsFunctions(SqlRepository repo) => _repo = repo;

    [Function("CreateEvent")]
    public async Task<HttpResponseData> CreateEvent(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "events/create")] HttpRequestData req)
    {
        try
        {
            var body = await JsonSerializer.DeserializeAsync<CreateEventRequest>(req.Body, new JsonSerializerOptions{PropertyNameCaseInsensitive=true});
            if (body == null) 
            {
                var badReq = req.CreateResponse(HttpStatusCode.BadRequest);
                await badReq.WriteStringAsync("Request body is null");
                return badReq;
            }

            var eventDate = body.EventDate ?? GetNextThursday(DateOnly.FromDateTime(DateTime.UtcNow.AddHours(2))); // Israel TZ approx
            var id = await _repo.CreateEventAsync(body.SeasonId, eventDate, body.HostPlayerId, body.TournamentTypeId, body.BuyInAmount, body.RebuyLimit, body.LeagueKeeperPlayerId, body.Notes);

            var resp = req.CreateResponse(HttpStatusCode.OK);
            await resp.WriteAsJsonAsync(new { EventId = id, EventDate = eventDate });
            return resp;
        }
        catch (Exception ex)
        {
            var errorResp = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResp.WriteStringAsync($"Error: {ex.Message}\nStack: {ex.StackTrace}");
            return errorResp;
        }
    }

    [Function("GetEvent")]
    public async Task<HttpResponseData> GetEvent(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "events/{eventId:int}")] HttpRequestData req, int eventId)
    {
        var data = await _repo.GetEventAsync(eventId);
        if (data == null) return req.CreateResponse(HttpStatusCode.NotFound);
        var resp = req.CreateResponse(HttpStatusCode.OK);
        resp.Headers.Add("Content-Type", "application/json");
        var json = JsonSerializer.Serialize(data);
        using var writer = new StreamWriter(resp.Body);
        await writer.WriteAsync(json);
        return resp;
    }

    [Function("Rsvp")]
    public async Task<HttpResponseData> Rsvp(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "events/{eventId:int}/rsvp")] HttpRequestData req, int eventId)
    {
        var body = await JsonSerializer.DeserializeAsync<RsvpRequest>(req.Body, new JsonSerializerOptions{PropertyNameCaseInsensitive=true});
        if (body == null) return req.CreateResponse(HttpStatusCode.BadRequest);
        var ok = await _repo.RsvpAsync(eventId, body.PlayerId, body.Response);
        var resp = req.CreateResponse(ok>0 ? HttpStatusCode.OK : HttpStatusCode.NotFound);
        return resp;
    }

    [Function("Attendance")]
    public async Task<HttpResponseData> Attendance(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "events/{eventId:int}/attendance")] HttpRequestData req, int eventId)
    {
        var items = await JsonSerializer.DeserializeAsync<List<AttendanceDto>>(req.Body, new JsonSerializerOptions{PropertyNameCaseInsensitive=true}) ?? new();
        var cnt = await _repo.UpsertAttendanceAsync(eventId, items);
        var resp = req.CreateResponse(HttpStatusCode.OK);
        await resp.WriteAsJsonAsync(new { Updated = cnt });
        return resp;
    }

    [Function("Results")]
    public async Task<HttpResponseData> Results(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "events/{eventId:int}/results")] HttpRequestData req, int eventId)
    {
        var items = await JsonSerializer.DeserializeAsync<List<ResultDto>>(req.Body, new JsonSerializerOptions{PropertyNameCaseInsensitive=true}) ?? new();
        var ok = await _repo.SaveResultsAsync(eventId, items);
        var resp = req.CreateResponse(HttpStatusCode.OK);
        await resp.WriteAsJsonAsync(new { Saved = ok==1 });
        return resp;
    }

    private static DateOnly GetNextThursday(DateOnly from)
    {
        int offset = ((int)DayOfWeek.Thursday - (int)from.DayOfWeek + 7) % 7;
        return offset==0 ? from : from.AddDays(offset);
    }
}
