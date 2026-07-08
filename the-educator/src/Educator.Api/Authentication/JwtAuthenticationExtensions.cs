using Educator.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Educator.Api.Authentication;

public static class JwtAuthenticationExtensions
{
    public static IServiceCollection AddEducatorJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var authOptions = configuration
            .GetSection(AuthOptions.SectionName)
            .Get<AuthOptions>() ?? new AuthOptions();

        var authority = NormalizeAuthority(authOptions.Authority);

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                if (!string.IsNullOrWhiteSpace(authority))
                {
                    options.Authority = authority;
                    options.MetadataAddress = $"{authority}/.well-known/openid-configuration";
                }

                options.Audience = authOptions.Audience;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateAudience = true,
                    ValidAudience = authOptions.Audience,
                    ValidateIssuer = !string.IsNullOrWhiteSpace(authority),
                    ValidIssuer = authority,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    NameClaimType = "email",
                    RoleClaimType = "role"
                };
            });

        services.AddAuthorization();

        return services;
    }

    private static string NormalizeAuthority(string authority)
    {
        return authority.Trim().TrimEnd('/');
    }
}
