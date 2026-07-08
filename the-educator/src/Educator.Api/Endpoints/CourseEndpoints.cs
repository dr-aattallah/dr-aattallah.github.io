using Educator.Application.Courses;

namespace Educator.Api.Endpoints;

public static class CourseEndpoints
{
    public static IEndpointRouteBuilder MapCourseEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/courses", async (
            IGetCurrentUserCourses getCurrentUserCourses,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var courses = await getCurrentUserCourses.ExecuteAsync(cancellationToken);
                return Results.Ok(courses);
            }
            catch (NotImplementedException exception)
            {
                return Results.Problem(
                    title: "Course listing is not implemented yet.",
                    detail: exception.Message,
                    statusCode: StatusCodes.Status501NotImplemented);
            }
        })
            .WithName("ListCurrentUserCourses")
            .WithSummary("Returns the authenticated user's courses once persistence is implemented.")
            .RequireAuthorization()
            .Produces<IReadOnlyList<CourseListItem>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

        return endpoints;
    }
}
