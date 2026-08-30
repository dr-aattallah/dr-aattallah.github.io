using Educator.Application.Courses;
using Microsoft.Extensions.DependencyInjection;

namespace Educator.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddEducatorApplication(this IServiceCollection services)
    {
        services.AddScoped<IGetCurrentUserCourses, UnconfiguredGetCurrentUserCourses>();

        return services;
    }
}
