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

if (args.Contains("--seed-dev-data", StringComparer.OrdinalIgnoreCase))
{
    await DevelopmentDataSeeder.SeedAsync(app.Services);
    Console.WriteLine("Development seed data has been applied.");
    return;
}

app.MapGet("/", () => Results.Redirect("/health"));

app.UseCors("EducatorFrontend");
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
