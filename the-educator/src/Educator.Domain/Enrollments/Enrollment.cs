using Educator.Domain.Common;

namespace Educator.Domain.Enrollments;

public sealed class Enrollment : Entity
{
    public Guid CourseId { get; private set; }
    public Guid StudentId { get; private set; }
    public EnrollmentStatus Status { get; private set; }
    public string? Section { get; private set; }

    private Enrollment()
    {
    }

    public Enrollment(
        Guid courseId,
        Guid studentId,
        string? section = null,
        EnrollmentStatus status = EnrollmentStatus.Pending)
    {
        CourseId = courseId;
        StudentId = studentId;
        Section = section;
        Status = status;
    }
}
