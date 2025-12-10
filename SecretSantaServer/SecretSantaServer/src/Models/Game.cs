using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecretSantaServer.Models;

[Table("games")]
public class Game
{
    [Key] public int Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; set; }
    public string Code { get; init; } = null!;

    public int AdminId { get; set; }
    public User Admin { get; set; } = null!;
    public ICollection<GameMember> GameMembers { get; init; } = null!;

    public GameStatus Status { get; set; } = GameStatus.Created;
    public DateTime? StartsAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}

public enum GameStatus
{
    Created,
    Started,
    Cancelled,
    Finished
}