using System.Security.Claims;
using Educator.Application.Users;
using Microsoft.AspNetCore.Http;

namespace Educator.Infrastructure.Identity;

public sealed class HttpContextCurrentUserContext(
    IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public CurrentUser User
    {
        get
        {
            var principal = httpContextAccessor.HttpContext?.User;

            if (principal?.Identity?.IsAuthenticated != true)
            {
                return new CurrentUser(
                    Id: null,
                    Email: null,
                    Role: null,
                    IsAuthenticated: false);
            }

            return new CurrentUser(
                Id: ReadUserId(principal),
                Email: principal.FindFirstValue(ClaimTypes.Email)
                    ?? principal.FindFirstValue("email"),
                Role: principal.FindFirstValue(ClaimTypes.Role)
                    ?? principal.FindFirstValue("role"),
                IsAuthenticated: true);
        }
    }

    private static Guid? ReadUserId(ClaimsPrincipal principal)
    {
        var rawUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        return Guid.TryParse(rawUserId, out var userId)
            ? userId
            : null;
    }
}
