using SecretSantaServer.Models;

namespace SecretSantaServer.DTOs;

public class GameMemberDto
{
    public int Id { get; init; }

    public int GameId { get; init; }
    public int UserId { get; init; }
    public UserProfileDto User { get; init; }

    public string? Letter { get; set; }

    public GameMemberDto(GameMember gameMember)
    {
        Id = gameMember.Id;
        GameId = gameMember.GameId;
        UserId = gameMember.UserId;
        User = new UserProfileDto(gameMember.User);
        Letter = gameMember.Letter;
    }
}