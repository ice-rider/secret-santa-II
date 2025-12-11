using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("refresh_tokens")]
public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = null!;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}