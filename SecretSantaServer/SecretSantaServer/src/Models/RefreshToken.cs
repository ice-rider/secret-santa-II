using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("refresh_tokens")]
public class RefreshToken
{
    public Guid Guid { get; set; }
    public string Token { get; set; } = null!;
    public int UserId { get; set; }
    public RefreshToken(int userId, string token)
    {
        Guid = Guid.NewGuid();
        Token = token;
        UserId = userId;
    }
}