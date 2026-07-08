using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Educator.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddEducatorInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        _ = configuration;
        return services;
    }
}
