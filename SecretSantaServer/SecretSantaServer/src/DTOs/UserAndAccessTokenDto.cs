namespace SecretSantaServer.DTOs;

public class UserAndAccessTokenDto
{
    public UserProfileDto UserProfile { get; set; }
    public string AccessToken { get; set; }
    public bool IsNewUser { get; set; }

    public UserAndAccessTokenDto(UserProfileDto userProfile, string accessToken, bool isNewUser = false)
    {
        UserProfile = userProfile;
        AccessToken = accessToken;
        IsNewUser = isNewUser;
    }
}