using Educator.Application.Users;

namespace Educator.Api.Endpoints;

public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/me", async (
            ICurrentUserContext currentUserContext,
            ILocalUserLookup localUserLookup,
            CancellationToken cancellationToken) =>
        {
            if (!currentUserContext.User.IsAuthenticated)
            {
                return Results.Problem(
                    title: "Authentication is not implemented yet.",
                    detail: "This endpoint is wired to the current user contract, but JWT validation is not implemented yet.",
                    statusCode: StatusCodes.Status501NotImplemented);
            }

            if (currentUserContext.User.Id is not { } currentUserId)
            {
                return Results.Problem(
                    title: "Authenticated user id is unavailable.",
                    detail: "JWT validation must provide a local user id before the current profile can be resolved.",
                    statusCode: StatusCodes.Status501NotImplemented);
            }

            var localUser = await localUserLookup.FindByIdAsync(
                currentUserId,
                cancellationToken);

            if (localUser is null)
            {
                return Results.Problem(
                    title: "Local user profile was not found.",
                    detail: "The authenticated identity exists, but no matching local Educator user profile was found.",
                    statusCode: StatusCodes.Status404NotFound);
            }

            return Results.Ok(new CurrentUserResponse(
                localUser.Id,
                localUser.Name,
                localUser.Email,
                localUser.Role,
                localUser.Status));
        })
            .WithName("GetCurrentUser")
            .WithSummary("Returns the authenticated user's profile once authentication is implemented.")
            .RequireAuthorization()
            .Produces<CurrentUserResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status501NotImplemented);

        return endpoints;
    }
}
