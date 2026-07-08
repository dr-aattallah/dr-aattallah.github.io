using Educator.Application.Users;

namespace Educator.Infrastructure.Identity;

public sealed class UnauthenticatedCurrentUserContext : ICurrentUserContext
{
    public CurrentUser User { get; } = new(
        Id: null,
        Email: null,
        Role: null,
        IsAuthenticated: false);
}
