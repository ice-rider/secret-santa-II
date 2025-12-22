using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace SecretSantaServer.Models;

[Table("game_members")]
public class GameMember
{
    public int Id { get; init; }
    
    public int GameId { get; init; }
    public Game Game { get; init; }
    
    public int UserId { get; init; }
    public User User { get; init; }
    
    public string? Letter { get; set; }
}