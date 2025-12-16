using SecretSantaServer.Enums;

namespace SecretSantaServer.Providers;

public interface IOAuthClient
{
    Task<OAuthUserInfo> GetUserInfoAsync(string code, string redirectUri);
}

public record OAuthUserInfo(OAuthProvider Provider, string ProviderId, string? Email, string? Name);