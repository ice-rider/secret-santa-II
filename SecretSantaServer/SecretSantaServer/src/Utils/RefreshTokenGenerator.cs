using System.Security.Cryptography;
using SecretSantaServer.Models;

namespace SecretSantaServer.Utils;

public static class RefreshTokenGenerator
{
    public static string GenerateToken(int size = 32)
    {
        var randomBytes = new byte[Math.Max(16,size)];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}