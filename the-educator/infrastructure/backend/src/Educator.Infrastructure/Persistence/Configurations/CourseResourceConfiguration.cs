using Educator.Domain.Courses;
using Educator.Domain.Resources;
using Educator.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Educator.Infrastructure.Persistence.Configurations;

public sealed class CourseResourceConfiguration : IEntityTypeConfiguration<CourseResource>
{
    public void Configure(EntityTypeBuilder<CourseResource> builder)
    {
        builder.ToTable("resources");
        builder.HasKey(resource => resource.Id);

        builder.Property(resource => resource.Id).HasColumnName("id");
        builder.Property(resource => resource.CourseId).HasColumnName("course_id").IsRequired();
        builder.Property(resource => resource.Title).HasColumnName("title").HasMaxLength(250).IsRequired();
        builder.Property(resource => resource.Description).HasColumnName("description").HasMaxLength(2000);
        builder.Property(resource => resource.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(resource => resource.Section).HasColumnName("section").HasMaxLength(100).IsRequired();
        builder.Property(resource => resource.Url).HasColumnName("url").HasMaxLength(2000);
        builder.Property(resource => resource.FileObjectId).HasColumnName("file_object_id");
        builder.Property(resource => resource.Visibility).HasColumnName("visibility").HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(resource => resource.CreatedBy).HasColumnName("created_by").IsRequired();
        builder.Property(resource => resource.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(resource => resource.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne<Course>()
            .WithMany()
            .HasForeignKey(resource => resource.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<PlatformUser>()
            .WithMany()
            .HasForeignKey(resource => resource.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(resource => resource.CourseId);
        builder.HasIndex(resource => resource.CreatedBy);
        builder.HasIndex(resource => new { resource.CourseId, resource.Visibility });
    }
}
