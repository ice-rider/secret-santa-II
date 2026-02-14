namespace SecretSantaServer.DTOs;

public class UserAuthInfoDto
{
    public UserAndAccessTokenDto User { get; set; }
    public string RefreshToken { get; set; }
    public UserAuthInfoDto(UserAndAccessTokenDto user, string refreshToken)
    {
        User = user;
        RefreshToken = refreshToken;
    }
}