namespace Educator.Infrastructure.Configuration;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string ProjectUrl { get; init; } = string.Empty;
    public string AnonKey { get; init; } = string.Empty;
    public string ServiceRoleKey { get; init; } = string.Empty;
    public string DatabaseConnectionString { get; init; } = string.Empty;
}
