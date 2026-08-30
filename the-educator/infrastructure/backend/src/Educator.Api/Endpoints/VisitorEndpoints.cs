using System.Security.Cryptography;
using System.Text;
using Educator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Educator.Api.Endpoints;

public static class VisitorEndpoints
{
    private static readonly HashSet<string> AllowedSites = new(StringComparer.Ordinal)
    {
        "academic-portfolio",
        "the-educator"
    };

    public static IEndpointRouteBuilder MapVisitorEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/visitors/{siteKey}", async (
            string siteKey,
            VisitorRequest request,
            EducatorDbContext dbContext,
            CancellationToken cancellationToken) =>
        {
            if (!AllowedSites.Contains(siteKey) ||
                !Guid.TryParse(request.VisitorId, out var visitorId))
            {
                return Results.BadRequest(new { error = "invalid_visitor_request" });
            }

            var visitorHash = Convert.ToHexStringLower(
                SHA256.HashData(Encoding.UTF8.GetBytes(visitorId.ToString("D"))));

            await dbContext.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS public_site_visitors (
                    site_key varchar(64) NOT NULL,
                    visitor_hash char(64) NOT NULL,
                    first_seen_at timestamptz NOT NULL DEFAULT now(),
                    last_seen_at timestamptz NOT NULL DEFAULT now(),
                    PRIMARY KEY (site_key, visitor_hash)
                )
                """,
                cancellationToken);

            await dbContext.Database.ExecuteSqlInterpolatedAsync(
                $"""
                INSERT INTO public_site_visitors (site_key, visitor_hash)
                VALUES ({siteKey}, {visitorHash})
                ON CONFLICT (site_key, visitor_hash)
                DO UPDATE SET last_seen_at = now()
                """,
                cancellationToken);

            var total = await dbContext.Database
                .SqlQuery<long>($"SELECT count(*)::bigint AS \"Value\" FROM public_site_visitors WHERE site_key = {siteKey}")
                .SingleAsync(cancellationToken);

            return Results.Ok(new { siteKey, total });
        })
        .AllowAnonymous();

        return endpoints;
    }

    public sealed record VisitorRequest(string? VisitorId);
}
