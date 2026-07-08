using Educator.Domain.Common;

namespace Educator.Domain.Courses;

public sealed class Course : Entity
{
    public string CourseCode { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string Semester { get; private set; }
    public string? Section { get; private set; }
    public Guid InstructorId { get; private set; }
    public CourseVisibility Visibility { get; private set; }

    public Course(
        string courseCode,
        string title,
        string semester,
        Guid instructorId,
        string? description = null,
        string? section = null,
        CourseVisibility visibility = CourseVisibility.Draft)
    {
        CourseCode = courseCode;
        Title = title;
        Semester = semester;
        InstructorId = instructorId;
        Description = description;
        Section = section;
        Visibility = visibility;
    }
}
