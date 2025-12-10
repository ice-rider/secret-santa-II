using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("assignments")]
public class Assignment
{
    public int GameId { get; init; }
    public required Game Game { get; init; }
    
    public int RecipientId { get; init; }
    public required GameMember Recipient { get; init; }
    
    public int? SantaId { get; set; }
    public GameMember? Santa { get; set; }
}