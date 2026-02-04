namespace SecretSantaServer.DTOs;

public class UserTokenInfo
{
    public int UserId{get;set;}
    public UserTokenInfo(int userId)
    {
        UserId = userId;
    }
}