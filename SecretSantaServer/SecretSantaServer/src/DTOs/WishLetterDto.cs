using System.ComponentModel.DataAnnotations;

namespace SecretSantaServer.DTOs;

public class WishLetterDto
{
    [MaxLength(256)]
    public string? Letter { get; set; }
}