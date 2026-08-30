using Educator.Api.Authentication;
using Educator.Api.Endpoints;
using Educator.Application;
using Educator.Infrastructure;
using Educator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEducatorApplication();
builder.Services.AddEducatorInfrastructure(builder.Configuration);
builder.Services.AddEducatorJwtAuthentication(builder.Configuration);
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddPolicy("EducatorFrontend", policy =>
    {
        policy
            .WithOrigins(
                "https://dr-aattallah.github.io",
                "http://127.0.0.1:8765",
                "http://localhost:8765")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();
var allowedCorsOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "https://dr-aattallah.github.io",
    "http://127.0.0.1:8765",
    "http://localhost:8765"
};

if (args.Contains("--seed-dev-data", StringComparer.OrdinalIgnoreCase))
{
    await DevelopmentDataSeeder.SeedAsync(app.Services);
    Console.WriteLine("Development seed data has been applied.");
    return;
}

app.MapGet("/", () => Results.Redirect("/health"));

app.UseCors("EducatorFrontend");
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Unhandled Educator API request failure.");

        if (context.Response.HasStarted)
        {
            throw;
        }

        var origin = context.Request.Headers.Origin.ToString();
        if (allowedCorsOrigins.Contains(origin))
        {
            context.Response.Headers["Access-Control-Allow-Origin"] = origin;
            context.Response.Headers["Vary"] = "Origin";
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://httpstatuses.com/500",
            title = "The Educator API could not complete the request.",
            status = StatusCodes.Status500InternalServerError,
            detail = app.Environment.IsDevelopment()
                ? exception.Message
                : "A server-side error occurred while processing the request.",
            traceId = context.TraceIdentifier
        });
    }
});
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "The Educator API",
    timestampUtc = DateTimeOffset.UtcNow
}));

app.MapGet("/health/database", async (
    IConfiguration configuration,
    IServiceProvider serviceProvider,
    CancellationToken cancellationToken) =>
{
    var connectionString = configuration["Supabase:DatabaseConnectionString"];
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return Results.Json(
            new
            {
                status = "unavailable",
                database = "not_configured"
            },
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }

    try
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<EducatorDbContext>();
        await dbContext.Database.OpenConnectionAsync(cancellationToken);
        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
        await dbContext.Database.CloseConnectionAsync();

        return Results.Ok(new
        {
            status = "ok",
            database = "reachable"
        });
    }
    catch (Exception exception)
    {
        app.Logger.LogError(exception, "Database health check failed.");

        return Results.Json(
            new
            {
                status = "unavailable",
                database = "error",
                detail = SanitizeDatabaseError(exception.Message),
                errorType = exception.GetType().Name
            },
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

app.MapHealthChecks("/health/live");
app.MapIdentityEndpoints();
app.MapCourseEndpoints();
app.MapVisitorEndpoints();

app.Run();

static string SanitizeDatabaseError(string message)
{
    if (string.IsNullOrWhiteSpace(message))
    {
        return "database_connection_failed";
    }

    var normalized = message.ToLowerInvariant();

    if (normalized.Contains("password authentication failed", StringComparison.Ordinal))
    {
        return "authentication_failed";
    }

    if (normalized.Contains("timeout", StringComparison.Ordinal) ||
        normalized.Contains("timed out", StringComparison.Ordinal))
    {
        return "network_timeout";
    }

    if (normalized.Contains("name or service not known", StringComparison.Ordinal) ||
        normalized.Contains("nodename nor servname provided", StringComparison.Ordinal) ||
        normalized.Contains("could not translate host name", StringComparison.Ordinal))
    {
        return "host_not_found";
    }

    if (normalized.Contains("ssl", StringComparison.Ordinal) ||
        normalized.Contains("certificate", StringComparison.Ordinal))
    {
        return "ssl_error";
    }

    if (normalized.Contains("connection refused", StringComparison.Ordinal))
    {
        return "connection_refused";
    }

    return "database_connection_failed";
}
