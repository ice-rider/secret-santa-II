using System.ComponentModel.DataAnnotations;

namespace SecretSantaServer.DTOs;

public class CreateGameRequest
{
    [Required, MinLength(4), MaxLength(64)]
    public string Title { get; set; }
    
    [MaxLength(256)]
    public string? Description { get; set; }
    
    public DateTime? StartsAt { get; set; }
}