using Educator.Application.Courses;
using Educator.Application.Enrollments;
using Educator.Application.Resources;
using Educator.Application.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Educator.Infrastructure.Configuration;
using Educator.Infrastructure.Identity;
using Educator.Infrastructure.Persistence;
using Educator.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

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

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserContext, HttpContextCurrentUserContext>();
        services.AddScoped<ILocalUserLookup, UnconfiguredLocalUserLookup>();

        var supabaseOptions = configuration
            .GetSection(SupabaseOptions.SectionName)
            .Get<SupabaseOptions>() ?? new SupabaseOptions();

        if (!string.IsNullOrWhiteSpace(supabaseOptions.DatabaseConnectionString))
        {
            services.AddDbContext<EducatorDbContext>(options =>
                options.UseNpgsql(supabaseOptions.DatabaseConnectionString));

            services.AddScoped<IGetCurrentUserCourses, GetCurrentUserCourses>();
            services.AddScoped<ICourseRepository, EfCourseRepository>();
            services.AddScoped<IEnrollmentRepository, EfEnrollmentRepository>();
            services.AddScoped<IResourceRepository, EfResourceRepository>();
            services.AddScoped<ILocalUserLookup, EfLocalUserLookup>();
        }

        return services;
    }
}
