using Educator.Application.Enrollments;
using Educator.Domain.Enrollments;
using Microsoft.EntityFrameworkCore;

namespace Educator.Infrastructure.Persistence.Repositories;

public sealed class EfEnrollmentRepository(EducatorDbContext dbContext) : IEnrollmentRepository
{
    public async ValueTask<IReadOnlyList<Enrollment>> ListActiveForStudentAsync(
        Guid studentId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Enrollments
            .AsNoTracking()
            .Where(enrollment =>
                enrollment.StudentId == studentId &&
                enrollment.Status == EnrollmentStatus.Active)
            .ToListAsync(cancellationToken);
    }

    public async ValueTask<bool> IsStudentEnrolledAsync(
        Guid courseId,
        Guid studentId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Enrollments
            .AsNoTracking()
            .AnyAsync(enrollment =>
                enrollment.CourseId == courseId &&
                enrollment.StudentId == studentId &&
                enrollment.Status == EnrollmentStatus.Active,
                cancellationToken);
    }
}
