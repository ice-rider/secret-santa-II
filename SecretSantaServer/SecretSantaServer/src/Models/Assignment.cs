using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SecretSantaServer.Models;

[Table("assignments")]
public class Assignment
{
    public int GameId { get; init; }
    [JsonIgnore]
    public Game Game { get; init; }
    
    public int RecipientId { get; init; }
    public GameMember Recipient { get; init; }
    
    public int SantaId { get; init; }
    public GameMember Santa { get; init; }
}