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

// Authentication Models
public record LoginRequest(string Username, string Password);

public record LoginResponse(
    bool Success,
    string? SessionToken,
    UserInfo? User,
    string? Message
);

public record UserInfo(
    int UserId,
    string Username,
    string Role,
    int? PlayerId,
    string? FullName
);

public record SessionValidationResult(
    bool IsValid,
    UserInfo? User
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record CreateUserRequest(
    string Username,
    string Password,
    string Role,
    int? PlayerId,
    string? Email,
    string? PhoneNumber
);
