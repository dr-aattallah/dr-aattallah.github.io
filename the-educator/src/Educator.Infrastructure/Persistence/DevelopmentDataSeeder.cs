using Educator.Domain.Courses;
using Educator.Domain.Enrollments;
using Educator.Domain.Resources;
using Educator.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Educator.Infrastructure.Persistence;

public static class DevelopmentDataSeeder
{
    private static readonly Guid InstructorId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    private static readonly Guid StudentId =
        Guid.Parse("22222222-2222-2222-2222-222222222222");

    public static async Task SeedAsync(
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<EducatorDbContext>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        var instructor = await EnsureUserAsync(
            dbContext,
            InstructorId,
            "Dr. Abdulaziz Attaallah",
            "aattallah@kau.edu.sa",
            UserRole.Instructor,
            "KAU-FCIT-INSTRUCTOR",
            cancellationToken);

        var student = await EnsureUserAsync(
            dbContext,
            StudentId,
            "Demo Student",
            "student.demo@the-educator.local",
            UserRole.Student,
            "DEMO-STUDENT-001",
            cancellationToken);

        var course = await EnsureCourseAsync(
            dbContext,
            "CPCS-351",
            "Software Engineering I",
            "Spring 2026",
            "Section A",
            instructor.Id,
            cancellationToken);

        await EnsureEnrollmentAsync(
            dbContext,
            course.Id,
            student.Id,
            "Section A",
            cancellationToken);

        await EnsureResourceAsync(
            dbContext,
            course.Id,
            instructor.Id,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task<PlatformUser> EnsureUserAsync(
        EducatorDbContext dbContext,
        Guid id,
        string name,
        string email,
        UserRole role,
        string universityId,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .FirstOrDefaultAsync(existing => existing.Email == email, cancellationToken);

        if (user is not null)
        {
            return user;
        }

        user = new PlatformUser(
            id,
            name,
            email,
            role,
            universityId);

        dbContext.Users.Add(user);
        return user;
    }

    private static async Task<Course> EnsureCourseAsync(
        EducatorDbContext dbContext,
        string courseCode,
        string title,
        string semester,
        string section,
        Guid instructorId,
        CancellationToken cancellationToken)
    {
        var course = await dbContext.Courses
            .FirstOrDefaultAsync(existing =>
                existing.CourseCode == courseCode &&
                existing.Semester == semester &&
                existing.Section == section,
                cancellationToken);

        if (course is not null)
        {
            return course;
        }

        course = new Course(
            courseCode,
            title,
            semester,
            instructorId,
            "A foundational software engineering course space for syllabus, lectures, assignments, and course resources.",
            section,
            CourseVisibility.Published);

        dbContext.Courses.Add(course);
        return course;
    }

    private static async Task EnsureEnrollmentAsync(
        EducatorDbContext dbContext,
        Guid courseId,
        Guid studentId,
        string section,
        CancellationToken cancellationToken)
    {
        var exists = await dbContext.Enrollments
            .AnyAsync(enrollment =>
                enrollment.CourseId == courseId &&
                enrollment.StudentId == studentId,
                cancellationToken);

        if (exists)
        {
            return;
        }

        dbContext.Enrollments.Add(new Enrollment(
            courseId,
            studentId,
            section,
            EnrollmentStatus.Active));
    }

    private static async Task EnsureResourceAsync(
        EducatorDbContext dbContext,
        Guid courseId,
        Guid instructorId,
        CancellationToken cancellationToken)
    {
        var exists = await dbContext.Resources
            .AnyAsync(resource =>
                resource.CourseId == courseId &&
                resource.Title == "Course Syllabus",
                cancellationToken);

        if (exists)
        {
            return;
        }

        dbContext.Resources.Add(new CourseResource(
            courseId,
            "Course Syllabus",
            ResourceType.Pdf,
            "Course Overview",
            instructorId,
            "Initial syllabus placeholder for the prototype course workspace.",
            visibility: ResourceVisibility.Visible));
    }
}
