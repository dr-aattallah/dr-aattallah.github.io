using Educator.Domain.Courses;

namespace Educator.Application.Courses;

public interface ICourseRepository
{
    ValueTask<IReadOnlyList<CourseListItem>> ListForInstructorAsync(
        Guid instructorId,
        CancellationToken cancellationToken = default);

    ValueTask<IReadOnlyList<CourseListItem>> ListForStudentAsync(
        Guid studentId,
        CancellationToken cancellationToken = default);

    ValueTask<Course?> FindByIdAsync(
        Guid courseId,
        CancellationToken cancellationToken = default);
}
