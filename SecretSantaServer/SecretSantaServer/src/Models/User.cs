using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SecretSantaServer.Models;

[Table("users")]
public class User
{
    public int Id { get; init; }
    public required string Name { get; set; }
    public string? AvatarUrl { get; set; }
    
    public UserCredentials? Credential { get; set; }
    
    public ICollection<GameMember> GameMembers { get; init; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}