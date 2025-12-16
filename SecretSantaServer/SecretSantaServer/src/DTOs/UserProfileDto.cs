using SecretSantaServer.Models;

namespace SecretSantaServer.DTOs;

public class UserProfileDto
{
    public int Id { get; init; }
    public string Name { get; set; }
    public string? AvatarUrl { get; set; }

    public UserProfileDto(User user)
    {
        Id = user.Id;
        Name = user.Name;
        AvatarUrl = user.AvatarUrl;
    }
}