using Educator.Api.Authentication;
using Educator.Api.Endpoints;
using Educator.Application;
using Educator.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEducatorApplication();
builder.Services.AddEducatorInfrastructure(builder.Configuration);
builder.Services.AddEducatorJwtAuthentication(builder.Configuration);
builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapGet("/", () => Results.Redirect("/health"));

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

app.Run();
