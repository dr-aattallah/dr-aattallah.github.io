namespace Educator.Application.Courses;

public sealed class UnconfiguredGetCurrentUserCourses : IGetCurrentUserCourses
{
    public ValueTask<IReadOnlyList<CourseListItem>> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException(
            "Course listing is not connected to persistence yet.");
    }
}
