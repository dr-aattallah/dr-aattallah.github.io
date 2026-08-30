using Educator.Domain.Courses;
using Educator.Domain.Enrollments;
using Educator.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Educator.Infrastructure.Persistence.Configurations;

public sealed class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollments");
        builder.HasKey(enrollment => enrollment.Id);

        builder.Property(enrollment => enrollment.Id).HasColumnName("id");
        builder.Property(enrollment => enrollment.CourseId).HasColumnName("course_id").IsRequired();
        builder.Property(enrollment => enrollment.StudentId).HasColumnName("student_id").IsRequired();
        builder.Property(enrollment => enrollment.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(enrollment => enrollment.Section).HasColumnName("section").HasMaxLength(100);
        builder.Property(enrollment => enrollment.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(enrollment => enrollment.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne<Course>()
            .WithMany()
            .HasForeignKey(enrollment => enrollment.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<PlatformUser>()
            .WithMany()
            .HasForeignKey(enrollment => enrollment.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(enrollment => enrollment.CourseId);
        builder.HasIndex(enrollment => enrollment.StudentId);
        builder.HasIndex(enrollment => new { enrollment.CourseId, enrollment.StudentId }).IsUnique();
    }
}
