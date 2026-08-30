using Educator.Domain.Courses;
using Educator.Domain.Enrollments;
using Educator.Domain.Resources;
using Educator.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace Educator.Infrastructure.Persistence;

public sealed class EducatorDbContext(DbContextOptions<EducatorDbContext> options)
    : DbContext(options)
{
    public DbSet<PlatformUser> Users => Set<PlatformUser>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<CourseResource> Resources => Set<CourseResource>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EducatorDbContext).Assembly);
    }
}
