namespace Educator.Application.Courses;

public interface IGetCurrentUserCourses
{
    ValueTask<IReadOnlyList<CourseListItem>> ExecuteAsync(
        CancellationToken cancellationToken = default);
}
