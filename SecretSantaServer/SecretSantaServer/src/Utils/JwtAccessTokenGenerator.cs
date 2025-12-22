using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SecretSantaServer.Enums;

namespace SecretSantaServer.Utils;

public class JwtAccessTokenGenerator : IAccessTokenGenerator
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SymmetricSecurityKey _key;

    public JwtAccessTokenGenerator(IConfiguration config)
    {
        _issuer = config["Jwt:Issuer"];
        _audience = config["Jwt:Audience"];
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
    }
    
    public string GenerateJwtToken(string userId, Role role)
    {
        var claims = new List<Claim>
        {
            new (JwtRegisteredClaimNames.Sub, userId),
            new (JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.Add(new Claim(ClaimTypes.Role, role.ToString()));

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}