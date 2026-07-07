var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapGet("/", () => Results.Redirect("/health"));

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "The Educator API",
    timestampUtc = DateTimeOffset.UtcNow
}));

app.MapHealthChecks("/health/live");

app.Run();
