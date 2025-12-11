using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("users")]
public class User
{
    public int Id { get; init; }
    public required string Name { get; set; }
    public string? AvatarUrl { get; set; }

    public UserCredentials? Credential { get; set; }
    
    public required IEnumerable<GameMember> GameMembers { get; init; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}