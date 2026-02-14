using SecretSantaServer.Models;

namespace SecretSantaServer.DTOs;

public class UserDto
{
    public int Id { get; init; }
    public string Name { get; set; }
    public string? AvatarUrl { get; set; }

    public string? Email { get; set; }
    public string? PasswordHash { get; set; }

    public string? GoogleId { get; set; }
    public string? GithubId { get; set; }
    public long? TelegramId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserDto(User user)
    {
        Id = user.Id;
        Name = user.Name;
        AvatarUrl = user.AvatarUrl;
        if (user.Credential != null)
        {
            Email = user.Credential.Email;
            PasswordHash = user.Credential.PasswordHash;
            TelegramId = user.Credential.TelegramId;
            GoogleId = user.Credential.GoogleId;
            GithubId = user.Credential.GithubId;
            CreatedAt = user.CreatedAt;
        }
    }
}