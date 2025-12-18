using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SecretSantaServer.Enums;

namespace SecretSantaServer.Models;

[Table("games")]
public class Game
{
    [Key] public int Id { get; init; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? Code { get; set; }

    public int AdminId { get; set; }
    public User Admin { get; set; } = null!;
    public bool IsAdminParticipating { get; set; } = true;
    public ICollection<GameMember> GameMembers { get; init; } = null!;

    public GameStatus Status { get; set; } = GameStatus.Created;
    public DateTime? StartsAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}