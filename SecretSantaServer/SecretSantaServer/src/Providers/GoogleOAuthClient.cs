using System.Text.Json;
using SecretSantaServer.Enums;

namespace SecretSantaServer.Providers;

public class GoogleOAuthClient : IOAuthClient
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _clientSecret;

    public GoogleOAuthClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _clientId = configuration["OAuth:Google:ClientId"]!;
        _clientSecret = configuration["OAuth:Google:ClientSecret"]!;
    }

    public async Task<OAuthUserInfo> GetUserInfoAsync(string code, string? redirectUri = null)
    {
        var accessToken = await GetAccessToken(code, redirectUri);

        _httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);
        
        return await GetUserInfo();
    }

    private async Task<OAuthUserInfo> GetUserInfo()
    {
        var userResponse = await _httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
        var userJson = await userResponse.Content.ReadFromJsonAsync<JsonDocument>();

        var id = userJson!.RootElement.GetProperty("id").GetString();
        var email = userJson.RootElement.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = userJson.RootElement.TryGetProperty("name", out var n) ? n.GetString() : null;
        var emailVerified = userJson.RootElement.TryGetProperty("verified_email", out var v) ? v.GetBoolean() : false;
        if(!emailVerified)
            email = null;
        return new OAuthUserInfo(OAuthProvider.Google, id!, email, name);
    }

    private async Task<string?> GetAccessToken(string code, string? redirectUri)
    {
        var tokenRequest = new Dictionary<string, string>()
        {
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code",
            ["redirect_uri"] = redirectUri ?? "http://localhost:5000/api/oauth/google/callback"
        };
        var tokenResponse = await _httpClient.PostAsync("https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(tokenRequest));

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonDocument>();
        var accessToken = tokenJson!.RootElement.GetProperty("access_token").GetString();
        return accessToken;
    }
}