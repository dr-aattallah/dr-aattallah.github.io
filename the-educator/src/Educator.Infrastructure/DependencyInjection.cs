using Educator.Application.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Educator.Infrastructure.Configuration;
using Educator.Infrastructure.Identity;

namespace Educator.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddEducatorInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<SupabaseOptions>(
            configuration.GetSection(SupabaseOptions.SectionName));

        services.Configure<AuthOptions>(
            configuration.GetSection(AuthOptions.SectionName));

        services.AddScoped<ICurrentUserContext, UnauthenticatedCurrentUserContext>();

        return services;
    }
}
