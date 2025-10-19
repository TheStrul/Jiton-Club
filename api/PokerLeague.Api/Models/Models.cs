
namespace PokerLeague.Api.Models;

public record CreateEventRequest(
    int SeasonId,
    DateOnly? EventDate,
    int? HostPlayerId,
    int? TournamentTypeId,
    decimal? BuyInAmount,
    int RebuyLimit,
    int? LeagueKeeperPlayerId,
    string? Notes
);

public record RsvpRequest(int PlayerId, string Response);
