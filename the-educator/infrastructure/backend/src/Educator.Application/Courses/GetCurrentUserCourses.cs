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

        if (!currentUser.IsAuthenticated)
        {
            return [];
        }

        var localUser = currentUser.Id is { } userId
            ? await localUserLookup.FindByIdAsync(userId, cancellationToken)
            : null;

        if (localUser is null && !string.IsNullOrWhiteSpace(currentUser.Email))
        {
            localUser = await localUserLookup.FindByEmailAsync(
                currentUser.Email,
                cancellationToken);
        }

        return localUser?.Role.ToLowerInvariant() switch
        {
            "admin" => await courseRepository.ListAllAsync(cancellationToken),
            "instructor" => await courseRepository.ListForInstructorAsync(localUser.Id, cancellationToken),
            "student" => await courseRepository.ListForStudentAsync(localUser.Id, cancellationToken),
            _ => []
        };
    }
}
