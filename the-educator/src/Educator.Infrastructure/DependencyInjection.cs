using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Educator.Infrastructure.Configuration;

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

        return services;
    }
}
