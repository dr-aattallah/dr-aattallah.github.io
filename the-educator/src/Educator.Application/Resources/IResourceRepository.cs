using Educator.Domain.Resources;

namespace Educator.Application.Resources;

public interface IResourceRepository
{
    ValueTask<IReadOnlyList<CourseResource>> ListVisibleForCourseAsync(
        Guid courseId,
        CancellationToken cancellationToken = default);

    ValueTask<IReadOnlyList<CourseResource>> ListForInstructorCourseAsync(
        Guid courseId,
        Guid instructorId,
        CancellationToken cancellationToken = default);

    ValueTask<CourseResource?> FindByIdAsync(
        Guid resourceId,
        CancellationToken cancellationToken = default);
}
