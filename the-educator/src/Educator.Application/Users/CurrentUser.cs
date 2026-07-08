namespace Educator.Application.Users;

public sealed record CurrentUser(
    Guid? Id,
    string? Email,
    string? Role,
    bool IsAuthenticated);
