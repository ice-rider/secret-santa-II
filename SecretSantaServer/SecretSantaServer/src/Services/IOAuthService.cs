using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Providers;

namespace SecretSantaServer.Services;

public interface IOAuthService
{
    Task<Result<(int userId, string refreshToken)>> OAuthLogin(string code, string state, OAuthProvider provider, string redirectUri);
}