using Educator.Application.Courses;
using Educator.Domain.Courses;
using Educator.Domain.Enrollments;
using Microsoft.EntityFrameworkCore;

namespace Educator.Infrastructure.Persistence.Repositories;

public sealed class EfCourseRepository(EducatorDbContext dbContext) : ICourseRepository
{
    public async ValueTask<IReadOnlyList<CourseListItem>> ListAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Courses
            .AsNoTracking()
            .OrderBy(course => course.CourseCode)
            .ThenBy(course => course.Section)
            .Select(course => ToListItem(course))
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<IReadOnlyList<CourseListItem>> ListForInstructorAsync(
        Guid instructorId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Courses
            .AsNoTracking()
            .Where(course => course.InstructorId == instructorId)
            .OrderBy(course => course.CourseCode)
            .ThenBy(course => course.Section)
            .Select(course => ToListItem(course))
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<IReadOnlyList<CourseListItem>> ListForStudentAsync(
        Guid studentId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Enrollments
            .AsNoTracking()
            .Where(enrollment =>
                enrollment.StudentId == studentId &&
                enrollment.Status == EnrollmentStatus.Active)
            .Join(
                dbContext.Courses.AsNoTracking().Where(course => course.Visibility == CourseVisibility.Published),
                enrollment => enrollment.CourseId,
                course => course.Id,
                (_, course) => course)
            .OrderBy(course => course.CourseCode)
            .ThenBy(course => course.Section)
            .Select(course => ToListItem(course))
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<Course?> FindByIdAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(course => course.Id == courseId, cancellationToken);
    }

    private static CourseListItem ToListItem(Course course)
    {
        return new CourseListItem(
            course.Id,
            course.CourseCode,
            course.Title,
            course.Semester,
            course.Section,
            course.InstructorId,
            course.Visibility);
    }
}
