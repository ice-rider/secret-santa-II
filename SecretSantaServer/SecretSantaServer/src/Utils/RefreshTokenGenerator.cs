using System.Security.Cryptography;
using SecretSantaServer.Models;

namespace SecretSantaServer.Utils;

public class RefreshTokenGenerator
{
    public static RefreshToken GetRefreshToken(int userId)
    {
        return new RefreshToken()
        {
            Token = GenerateToken(),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow,
        };
    }
    
    public static string GenerateToken(int size = 64)
    {
        var randomBytes = new byte[size];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}