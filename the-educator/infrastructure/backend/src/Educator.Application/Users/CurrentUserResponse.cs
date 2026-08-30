namespace Educator.Application.Users;

public sealed record CurrentUserResponse(
    Guid Id,
    string Name,
    string Email,
    string Role,
    string Status);
