using Educator.Application.Users;

namespace Educator.Api.Endpoints;

public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/me", () =>
            Results.Problem(
                title: "Authentication is not implemented yet.",
                detail: "This endpoint is reserved for the future authenticated user profile contract.",
                statusCode: StatusCodes.Status501NotImplemented))
            .WithName("GetCurrentUser")
            .WithSummary("Returns the authenticated user's profile once authentication is implemented.")
            .Produces<CurrentUserResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

        return endpoints;
    }
}
