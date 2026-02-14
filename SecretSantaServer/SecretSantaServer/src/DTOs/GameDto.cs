using SecretSantaServer.Enums;
using SecretSantaServer.Models;

namespace SecretSantaServer.DTOs;

public class GameDto
{
    public int Id { get; init; }
    public string Title { get; init; }
    public string? Description { get; set; }
    public string Code { get; init; } = null!;

    public int AdminId { get; set; }
    public IEnumerable<UserProfileDto> Members { get; set; }
    public bool IsAdminParticipating { get; set; }

    public GameStatus Status { get; set; } = GameStatus.Created;
    public DateTime? StartsAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public GameDto(){}
    public GameDto(Game game)
    {
        Id = game.Id;
        Title = game.Title;
        Description = game.Description;
        Code = game.Code;
        AdminId = game.AdminId;
        Status = game.Status;
        IsAdminParticipating = game.IsAdminParticipating;
        StartsAt = game.ScheduledAt;
        StartedAt = game.StartedAt;
        FinishedAt = game.FinishedAt;
        if (game.GameMembers == null || game.GameMembers.Count == 0)
            Members = null;
        else if (game.GameMembers.ToList()[0].User != null)
            Members = game.GameMembers.Select(x => new UserProfileDto(x.User)).ToList();
    }
}