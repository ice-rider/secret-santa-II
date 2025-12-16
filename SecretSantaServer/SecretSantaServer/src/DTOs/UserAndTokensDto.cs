namespace SecretSantaServer.DTOs;

public class UserAndTokensDto
{
    public UserProfileDto UserProfile { get; set; }
    public string RefreshToken { get; set; }
    public string AccessToken { get; set; }
    public bool IsNewUser { get; set; }

    public UserAndTokensDto(UserProfileDto userProfile, string refreshToken, string accessToken, bool isNewUser = false)
    {
        UserProfile = userProfile;
        RefreshToken = refreshToken;
        AccessToken = accessToken;
        IsNewUser = isNewUser;
    }
}