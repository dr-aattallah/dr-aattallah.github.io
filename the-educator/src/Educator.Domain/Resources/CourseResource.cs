using Educator.Domain.Common;

namespace Educator.Domain.Resources;

public sealed class CourseResource : Entity
{
    public Guid CourseId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public ResourceType Type { get; private set; }
    public string Section { get; private set; }
    public string? Url { get; private set; }
    public Guid? FileObjectId { get; private set; }
    public ResourceVisibility Visibility { get; private set; }
    public Guid CreatedBy { get; private set; }

    public CourseResource(
        Guid courseId,
        string title,
        ResourceType type,
        string section,
        Guid createdBy,
        string? description = null,
        string? url = null,
        Guid? fileObjectId = null,
        ResourceVisibility visibility = ResourceVisibility.Draft)
    {
        CourseId = courseId;
        Title = title;
        Type = type;
        Section = section;
        CreatedBy = createdBy;
        Description = description;
        Url = url;
        FileObjectId = fileObjectId;
        Visibility = visibility;
    }
}
