using SecretSantaServer.Enums;

namespace SecretSantaServer.Providers;

public interface IOAuthClient
{
    OAuthProvider Provider { get; }
    Task<OAuthUserInfo> GetUserInfoAsync(string code, string redirectUri);
}

public record OAuthUserInfo(OAuthProvider Provider, string ProviderId, string? Email, string? Name);