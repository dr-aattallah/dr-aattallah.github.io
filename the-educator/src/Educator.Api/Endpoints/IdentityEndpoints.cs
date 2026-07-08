using Educator.Application.Users;

namespace Educator.Api.Endpoints;

public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/me", (ICurrentUserContext currentUserContext) =>
            currentUserContext.User.IsAuthenticated
                ? Results.Ok(currentUserContext.User)
                : Results.Problem(
                    title: "Authentication is not implemented yet.",
                    detail: "This endpoint is wired to the current user contract, but JWT validation is not implemented yet.",
                    statusCode: StatusCodes.Status501NotImplemented))
            .WithName("GetCurrentUser")
            .WithSummary("Returns the authenticated user's profile once authentication is implemented.")
            .Produces<CurrentUserResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

        return endpoints;
    }
}
