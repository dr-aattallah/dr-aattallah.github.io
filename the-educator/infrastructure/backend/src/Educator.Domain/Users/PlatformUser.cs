using Educator.Domain.Common;

namespace Educator.Domain.Users;

public sealed class PlatformUser : Entity
{
    public string Name { get; private set; }
    public string Email { get; private set; }
    public UserRole Role { get; private set; }
    public string? UniversityId { get; private set; }
    public string? ProfileImagePath { get; private set; }
    public UserStatus Status { get; private set; }

    private PlatformUser()
    {
        Name = string.Empty;
        Email = string.Empty;
    }

    public PlatformUser(
        Guid id,
        string name,
        string email,
        UserRole role,
        string? universityId = null,
        string? profileImagePath = null,
        UserStatus status = UserStatus.Active)
    {
        Id = id;
        Name = name;
        Email = email;
        Role = role;
        UniversityId = universityId;
        ProfileImagePath = profileImagePath;
        Status = status;
    }
}
