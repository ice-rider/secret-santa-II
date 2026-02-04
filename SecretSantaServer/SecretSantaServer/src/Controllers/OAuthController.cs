using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Services;

namespace SecretSantaServer.Controllers;

[ApiController, Route("api/[controller]")]
public class OAuthController : ControllerBase
{
    private readonly IOAuthService _oAuthService;
    private readonly IConfiguration _config;

    private const string GoogleOAuthUri = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GithubOAuthUri = "https://github.com/login/oauth/authorize";

    public OAuthController(IOAuthService oAuthService, IConfiguration configuration)
    {
        _oAuthService = oAuthService;
        _config = configuration;
    }

    [HttpGet("google")]
    public IActionResult LoginByGoogle()
    {
        var state = AddStateToCookies();

        var clientId = _config["OAuth:Google:ClientId"]!;
        var redirectUri = $"{Request.Scheme}://{Request.Host}/api/oauth/google/callback";
        const string scope = "openid email profile";

        var queryParams = new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = scope,
            ["access_type"] = "offline",
            ["state"] = state,
        };

        var url = QueryHelpers.AddQueryString(GoogleOAuthUri, queryParams!);
        return Redirect(url);
    }

    [HttpGet("github")]
    public IActionResult LoginByGithub()
    {
        var state = AddStateToCookies();

        var clientId = _config["OAuth:Github:ClientId"]!;
        var redirectUri = $"{Request.Scheme}://{Request.Host}/api/oauth/github/callback";
        const string scope = "read:user user:email";

        var queryParams = new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["scope"] = scope,
            ["state"] = state,
        };

        return Redirect(QueryHelpers.AddQueryString(GithubOAuthUri, queryParams!));
    }

    private string AddStateToCookies()
    {
        var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        Response.Cookies.Append("OAuthState", state, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddMinutes(5)
        });
        return state;
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> HandleLoginByGoogle([FromQuery] string? code, [FromQuery] string? state,
        [FromQuery] string? error)
    {
        try
        {
            return await ProcessAuthRequest(code, state, error, OAuthProvider.Google);
        }
        catch (Exception ex)
        {
            return Redirect(GetRedirectUrlWithError(ex.Message));
        }
    }

    [HttpGet("github/callback")]
    public async Task<IActionResult> HandleLoginByGithub([FromQuery] string? code, [FromQuery] string? state,
        [FromQuery] string? error)
    {
        try
        {
            return await ProcessAuthRequest(code, state, error, OAuthProvider.Github);
        }
        catch (Exception ex)
        {
            return Redirect(GetRedirectUrlWithError(ex.Message));
        }
    }

    private async Task<IActionResult> ProcessAuthRequest(string? code, string? state, string? error, OAuthProvider provider)
    {
        var authError = CheckOAuthParameters(code, state, error);
        if (authError != null)
            return authError;
        
        var redirectUri = $"{Request.Scheme}://{Request.Host}/api/oauth/{provider.ToString().ToLower()}/callback";
        var result = await _oAuthService.OAuthLogin(code, state, provider, redirectUri);
        if (!result.IsSuccess)
            return Redirect(GetRedirectUrlWithError(result.Error));

        return Redirect(GetRedirectUrlWithUserInfo(result.Value.userId, result.Value.refreshToken));
    }

    private IActionResult? CheckOAuthParameters(string? code, string? state, string? error)
    {
        if(!Request.Cookies.TryGetValue("OAuthState", out var expectedState))
            return Redirect(GetRedirectUrlWithError("Missing state"));
        Response.Cookies.Delete("OAuthState");
        
        if (error != null)
            return Redirect(GetRedirectUrlWithError(error));
        
        if(string.IsNullOrEmpty(code))
            return Redirect(GetRedirectUrlWithError("Missing auth code"));

        if (state != expectedState)
            return Redirect(GetRedirectUrlWithError("Invalid or missing state"));

        return null;
    }
    
    private string GetRedirectUrlWithError(string error)
    {
        return $"{_config["Frontend:AuthCallback"]}?error={Uri.EscapeDataString(error)}";
    }
    
    private string GetRedirectUrlWithUserInfo(int userId, string refreshToken)
    {
        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });
        return $"{_config["Frontend:AuthCallback"]}?id={Uri.EscapeDataString(userId.ToString())}";
    }
}