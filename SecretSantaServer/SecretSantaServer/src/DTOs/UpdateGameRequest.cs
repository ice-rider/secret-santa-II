using System.ComponentModel.DataAnnotations;

namespace SecretSantaServer.DTOs;

public class UpdateGameRequest
{
    [Required, MinLength(4), MaxLength(64)]
    public string Title { get; set; }
    
    [MaxLength(512)]
    public string? Description { get; set; }

    public bool IsAdminParticipating;
    
    public DateTime? StartsAt { get; set; }
}