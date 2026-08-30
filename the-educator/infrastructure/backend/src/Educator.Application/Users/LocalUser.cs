namespace Educator.Application.Users;

public sealed record LocalUser(
    Guid Id,
    string Name,
    string Email,
    string Role,
    string Status,
    string? UniversityId,
    string? ProfileImagePath);
