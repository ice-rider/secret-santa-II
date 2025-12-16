using System.ComponentModel.DataAnnotations;
using SecretSantaServer.Attributes;

namespace SecretSantaServer.DTOs;

public class EmailRegisterRequest
{
    [Required, NoWhiteSpace, MinLength(3), MaxLength(32)]
    public required string Name { get; set; }

    [Required, NoWhiteSpace, MaxLength(120), EmailValidate]
    public required string Email { get; set; }

    [Required, NoWhiteSpace, MinLength(4), MaxLength(32)]
    public required string Password { get; set; }
}