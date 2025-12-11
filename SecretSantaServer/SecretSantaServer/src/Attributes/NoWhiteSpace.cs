using System.ComponentModel.DataAnnotations;

namespace SecretSantaServer.Attributes;

public class NoWhiteSpaceAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if(value is string str && str.Contains(" ",StringComparison.OrdinalIgnoreCase))
            return new ValidationResult($"{validationContext.DisplayName} must not contain spaces.");
        return ValidationResult.Success;
    }
}