using Educator.Application.Users;
using Microsoft.EntityFrameworkCore;

namespace Educator.Infrastructure.Persistence.Repositories;

public sealed class EfLocalUserLookup(EducatorDbContext dbContext) : ILocalUserLookup
{
    public async ValueTask<LocalUser?> FindByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new LocalUser(
                user.Id,
                user.Name,
                user.Email,
                user.Role.ToString(),
                user.Status.ToString(),
                user.UniversityId,
                user.ProfileImagePath))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async ValueTask<LocalUser?> FindByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Email.ToLower() == normalizedEmail)
            .Select(user => new LocalUser(
                user.Id,
                user.Name,
                user.Email,
                user.Role.ToString(),
                user.Status.ToString(),
                user.UniversityId,
                user.ProfileImagePath))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
