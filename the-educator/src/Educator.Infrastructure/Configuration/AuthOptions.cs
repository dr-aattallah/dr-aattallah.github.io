namespace Educator.Infrastructure.Configuration;

public sealed class AuthOptions
{
    public const string SectionName = "Authentication";

    public string Authority { get; init; } = string.Empty;
    public string Audience { get; init; } = "authenticated";
}
