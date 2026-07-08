using Educator.Domain.Courses;
using Educator.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Educator.Infrastructure.Persistence.Configurations;

public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses");
        builder.HasKey(course => course.Id);

        builder.Property(course => course.Id).HasColumnName("id");
        builder.Property(course => course.CourseCode).HasColumnName("course_code").HasMaxLength(50).IsRequired();
        builder.Property(course => course.Title).HasColumnName("title").HasMaxLength(250).IsRequired();
        builder.Property(course => course.Description).HasColumnName("description").HasMaxLength(2000);
        builder.Property(course => course.Semester).HasColumnName("semester").HasMaxLength(100).IsRequired();
        builder.Property(course => course.Section).HasColumnName("section").HasMaxLength(100);
        builder.Property(course => course.InstructorId).HasColumnName("instructor_id").IsRequired();
        builder.Property(course => course.Visibility).HasColumnName("visibility").HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(course => course.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(course => course.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne<PlatformUser>()
            .WithMany()
            .HasForeignKey(course => course.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(course => course.InstructorId);
        builder.HasIndex(course => new { course.CourseCode, course.Semester, course.Section });
    }
}
