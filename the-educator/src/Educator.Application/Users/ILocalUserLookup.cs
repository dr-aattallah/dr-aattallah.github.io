namespace Educator.Application.Users;

public interface ILocalUserLookup
{
    ValueTask<LocalUser?> FindByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
