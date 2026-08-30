namespace Educator.Application.Users;

public interface ILocalUserLookup
{
    ValueTask<LocalUser?> FindByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    ValueTask<LocalUser?> FindByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);
}
