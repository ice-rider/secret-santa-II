using SecretSantaServer.Enums;

namespace SecretSantaServer.Utils;

public interface IAccessTokenGenerator
{
    string GenerateJwtToken(string userId, Role role);
}