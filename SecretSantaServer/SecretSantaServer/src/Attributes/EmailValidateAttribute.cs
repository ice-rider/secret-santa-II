using System.ComponentModel.DataAnnotations;
using SecretSantaServer.Services;

namespace SecretSantaServer.Attributes;

public class EmailValidateAttribute : ValidationAttribute
{
    private readonly HashSet<char> _prohibitedChars=new(){'.','-','_'};
    private readonly HashSet<char> _prohibitedCharsInDomain=new(){'+','%'};
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string email || string.IsNullOrWhiteSpace(email))
            return ValidationResult.Success;

        if (email.Contains(' '))
            return new ValidationResult(ErrorMessage ?? "Email must not contain spaces.");

        var atCount = email.Count(c => c == '@');
        if (atCount != 1)
            return new ValidationResult(ErrorMessage ?? "Email must contain exactly one '@' symbol.");

        var parts = email.Split('@');
        var localPart = parts[0];
        var domain = parts[1];

        if (string.IsNullOrEmpty(localPart) || string.IsNullOrEmpty(domain))
            return new ValidationResult(ErrorMessage ?? "Email is missing local or domain part.");

        if (localPart.Any(c => !IsValidChar(c, isDomain: false)))
            return new ValidationResult(ErrorMessage ?? "Local part contains invalid characters.");
        
        var validationResult = CheckDomain(domain);
        if (validationResult != null) return validationResult;

        return ValidationResult.Success;
    }

    private ValidationResult? CheckDomain(string domain)
    {
        if (!domain.Contains('.'))
            return new ValidationResult(ErrorMessage ?? "Domain must contain a dot (e.g. gmail.com).");

        if (domain.StartsWith('.') || domain.EndsWith('.'))
            return new ValidationResult(ErrorMessage ?? "Domain cannot start or end with a dot.");

        if (domain.Contains(".."))
            return new ValidationResult(ErrorMessage ?? "Domain cannot contain consecutive dots.");

        if (domain.Any(c => !IsValidChar(c, isDomain: true)))
            return new ValidationResult(ErrorMessage ?? "Domain contains invalid characters.");
        
        return null;
    }

    bool IsValidChar(char c, bool isDomain)
    {
        if (char.IsLetterOrDigit(c)) return true;
        if (_prohibitedChars.Contains(c)) return true;
        if (!isDomain && _prohibitedCharsInDomain.Contains(c)) return true;
        return false;
    }
}