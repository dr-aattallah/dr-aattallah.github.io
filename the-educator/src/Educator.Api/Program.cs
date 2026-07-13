using Educator.Api.Authentication;
using Educator.Api.Endpoints;
using Educator.Application;
using Educator.Infrastructure;
using Educator.Infrastructure.Persistence;

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

app.MapHealthChecks("/health/live");
app.MapIdentityEndpoints();
app.MapCourseEndpoints();

app.Run();
