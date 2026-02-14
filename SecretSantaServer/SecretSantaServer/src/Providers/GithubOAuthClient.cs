using System.Net.Http.Headers;
using System.Text.Json;
using SecretSantaServer.Enums;

namespace SecretSantaServer.Providers;

public class GithubOAuthClient : IOAuthClient
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _clientSecret;

    public OAuthProvider Provider=> OAuthProvider.Github;
    private const string EmailsRequestUri = "https://api.github.com/user/emails";
    private const string UsersRequestUri = "https://api.github.com/user";
    private const string AccessTokenRequestUri = "https://github.com/login/oauth/access_token";

    public GithubOAuthClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("SecretSanta/1.0");
        _clientId = configuration["OAuth:Github:ClientId"]!;
        _clientSecret = configuration["OAuth:Github:ClientSecret"]!;
    }

    public async Task<OAuthUserInfo> GetUserInfoAsync(string code, string redirectUri)
    {
        var accessToken = await GetAccessToken(code, redirectUri);
        if (accessToken == null)
            return null;
        _httpClient.DefaultRequestHeaders.Authorization = new("token", accessToken);
        var verifiedEmail = await GetVerifiedEmail();
        return await GetUserInfo(verifiedEmail);
    }

    private async Task<string?> GetVerifiedEmail()
    {
        var verified = false;
        var emailsRequestMessage = new HttpRequestMessage(HttpMethod.Get, EmailsRequestUri);
        emailsRequestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var response = await _httpClient.SendAsync(emailsRequestMessage);

        if (response.IsSuccessStatusCode)
        {
            var emailsJson = await response.Content.ReadFromJsonAsync<JsonDocument>();
            var primaryEmail = emailsJson!.RootElement.EnumerateArray()
                .FirstOrDefault(x => x.GetProperty("primary").GetBoolean());

            if (primaryEmail.ValueKind != JsonValueKind.Null && primaryEmail.GetProperty("verified").GetBoolean())
                return primaryEmail.GetProperty("email").GetString();
        }

        return null;
    }

    private async Task<OAuthUserInfo> GetUserInfo(string? email)
    {
        var userRequestMessage = new HttpRequestMessage(HttpMethod.Get, UsersRequestUri);
        userRequestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var userResponse = await _httpClient.SendAsync(userRequestMessage);
        var userJson = await userResponse.Content.ReadFromJsonAsync<JsonDocument>();

        var id = userJson!.RootElement.GetProperty("id").ToString();
        var name = userJson.RootElement.TryGetProperty("name", out var n) ? n.GetString() : null;
        return new OAuthUserInfo(OAuthProvider.Github, id!, email, name);
    }

    private async Task<string?> GetAccessToken(string code, string? redirectUri)
    {
        if (redirectUri == null)
            return null;
        var tokenRequest = new Dictionary<string, string>()
        {
            ["client_id"] = _clientId,
            ["client_secret"] = _clientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code",
            ["redirect_uri"] = redirectUri
        };
        var tokenRequestMessage = new HttpRequestMessage(HttpMethod.Post, AccessTokenRequestUri)
        {
            Content = new FormUrlEncodedContent(tokenRequest)
        };
        tokenRequestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var tokenResponse = await _httpClient.SendAsync(tokenRequestMessage);

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonDocument>();
        var accessToken = tokenJson!.RootElement.GetProperty("access_token").GetString();
        return accessToken;
    }
}