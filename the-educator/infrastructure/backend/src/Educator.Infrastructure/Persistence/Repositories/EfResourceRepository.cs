using Educator.Application.Resources;
using Educator.Domain.Resources;
using Microsoft.EntityFrameworkCore;

namespace Educator.Infrastructure.Persistence.Repositories;

public sealed class EfResourceRepository(EducatorDbContext dbContext) : IResourceRepository
{
    public async ValueTask<IReadOnlyList<CourseResource>> ListVisibleForCourseAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Resources
            .AsNoTracking()
            .Where(resource =>
                resource.CourseId == courseId &&
                resource.Visibility == ResourceVisibility.Visible)
            .OrderBy(resource => resource.Section)
            .ThenBy(resource => resource.Title)
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<IReadOnlyList<CourseResource>> ListForInstructorCourseAsync(
        Guid courseId,
        Guid instructorId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Resources
            .AsNoTracking()
            .Where(resource =>
                resource.CourseId == courseId &&
                resource.CreatedBy == instructorId)
            .OrderBy(resource => resource.Section)
            .ThenBy(resource => resource.Title)
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<CourseResource?> FindByIdAsync(
        Guid resourceId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(resource => resource.Id == resourceId, cancellationToken);
    }
}
