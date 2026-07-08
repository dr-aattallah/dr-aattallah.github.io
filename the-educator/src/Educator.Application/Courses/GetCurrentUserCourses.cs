using Educator.Application.Users;

namespace Educator.Application.Courses;

public sealed class GetCurrentUserCourses(
    ICurrentUserContext currentUserContext,
    ILocalUserLookup localUserLookup,
    ICourseRepository courseRepository) : IGetCurrentUserCourses
{
    public async ValueTask<IReadOnlyList<CourseListItem>> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        var currentUser = currentUserContext.User;

        if (!currentUser.IsAuthenticated || currentUser.Id is not { } userId)
        {
            return [];
        }

        var localUser = await localUserLookup.FindByIdAsync(userId, cancellationToken);

        return localUser?.Role.ToLowerInvariant() switch
        {
            "admin" => await courseRepository.ListAllAsync(cancellationToken),
            "instructor" => await courseRepository.ListForInstructorAsync(userId, cancellationToken),
            "student" => await courseRepository.ListForStudentAsync(userId, cancellationToken),
            _ => []
        };
    }
}
