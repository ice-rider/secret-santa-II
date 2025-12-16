using System.ComponentModel.DataAnnotations;
using SecretSantaServer.Attributes;

namespace SecretSantaServer.DTOs;

public class EmailLoginRequest
{
    [Required, NoWhiteSpace, MaxLength(120), EmailValidate]
    public required string Email { get; set; }

    [Required, NoWhiteSpace, MinLength(4), MaxLength(32)]
    public required string Password { get; set; }
}