using Educator.Domain.Common;

namespace Educator.Domain.Courses;

public sealed class Course : Entity
{
    public string CourseCode { get; private set; }
    public string Title { get; private set; }
    public Guid InstructorId { get; private set; }

    public Course(string courseCode, string title, Guid instructorId)
    {
        CourseCode = courseCode;
        Title = title;
        InstructorId = instructorId;
    }
}
