using Educator.Domain.Courses;

namespace Educator.Application.Courses;

public sealed record CourseListItem(
    Guid Id,
    string CourseCode,
    string Title,
    string Semester,
    string? Section,
    Guid InstructorId,
    CourseVisibility Visibility);
