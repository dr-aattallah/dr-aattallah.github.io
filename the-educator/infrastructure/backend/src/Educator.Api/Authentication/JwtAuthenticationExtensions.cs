using System.Collections.Concurrent;
using Educator.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
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
                    var metadataAddress = $"{authority}/.well-known/openid-configuration";

                    options.Authority = authority;
                    options.MetadataAddress = metadataAddress;
                    options.ConfigurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                        metadataAddress,
                        new OpenIdConnectConfigurationRetriever());
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
                    IssuerSigningKeyResolver = (_, _, keyId, _) =>
                        ResolveSigningKeys(authority, keyId),
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

    private static IEnumerable<SecurityKey> ResolveSigningKeys(
        string authority,
        string keyId)
    {
        if (string.IsNullOrWhiteSpace(authority))
        {
            return [];
        }

        var jwks = SigningKeyCache.GetOrAdd(
            $"{authority}/.well-known/jwks.json",
            static jwksUri => new Lazy<JsonWebKeySet>(() =>
                new JsonWebKeySet(HttpClient.GetStringAsync(jwksUri).GetAwaiter().GetResult())));

        return jwks.Value
            .GetSigningKeys()
            .Where(key => string.IsNullOrWhiteSpace(keyId) || key.KeyId == keyId);
    }

    private static readonly HttpClient HttpClient = new();

    private static readonly ConcurrentDictionary<string, Lazy<JsonWebKeySet>> SigningKeyCache = new();
}
