using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("user_auth_data")]
public class UserCredentials
{
    public int UserId { get; init; }
    public User User { get; init; } = null!;
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    
    public string? GoogleId {get; set;}
    public string? GithubId {get; set;}
    public long? TelegramId { get; set; }
}