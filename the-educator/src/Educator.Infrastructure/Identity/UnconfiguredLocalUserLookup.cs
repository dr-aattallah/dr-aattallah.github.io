using Educator.Application.Users;

namespace Educator.Infrastructure.Identity;

public sealed class UnconfiguredLocalUserLookup : ILocalUserLookup
{
    public ValueTask<LocalUser?> FindByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return ValueTask.FromResult<LocalUser?>(null);
    }

    public ValueTask<LocalUser?> FindByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return ValueTask.FromResult<LocalUser?>(null);
    }
}
