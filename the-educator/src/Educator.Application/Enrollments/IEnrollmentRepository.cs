using Educator.Domain.Enrollments;

namespace Educator.Application.Enrollments;

public interface IEnrollmentRepository
{
    ValueTask<IReadOnlyList<Enrollment>> ListActiveForStudentAsync(
        Guid studentId,
        CancellationToken cancellationToken = default);

    ValueTask<bool> IsStudentEnrolledAsync(
        Guid courseId,
        Guid studentId,
        CancellationToken cancellationToken = default);
}
