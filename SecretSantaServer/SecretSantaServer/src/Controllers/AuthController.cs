using Microsoft.AspNetCore.Mvc;
using SecretSantaServer.DTOs;
using SecretSantaServer.Services;

namespace SecretSantaServer.Controllers;

[ApiController, Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] EmailRegisterRequest request)
    {
        if(!ModelState.IsValid)
            return BadRequest(new ValidationProblemDetails(ModelState));
        var result = await _authService.Register(request);
        if (result.IsSuccess)
        {
            AddTokensToCookies(result.Value.RefreshToken, result.Value.AccessToken);
            return CreatedAtRoute(result.Value.UserProfile.Id, result.Value.UserProfile);
        }

        return StatusCode(result.StatusCode, new { result.Error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] EmailLoginRequest request)
    {
        if(!ModelState.IsValid)
            return BadRequest(new ValidationProblemDetails(ModelState));
        var result = await _authService.Login(request);
        if (result.IsSuccess)
        {
            AddTokensToCookies(result.Value.RefreshToken, result.Value.AccessToken);
            return Ok(result.Value.UserProfile);
        }
        
        return StatusCode(result.StatusCode, new { result.Error });
    }
    
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto refreshToken)
    {
        var result = await _authService.Logout(refreshToken);
        if (result.IsSuccess)
            return Ok();

        return StatusCode(result.StatusCode, new { result.Error });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshToken)
    {
        var result = await _authService.Refresh(refreshToken);
        if (result.IsSuccess)
        {
            AddTokensToCookies(result.Value.RefreshToken, result.Value.AccessToken);
            return Ok(result.Value!.UserProfile);
        }
        
        return StatusCode(result.StatusCode, new { result.Error });
    }

    private void AddTokensToCookies(string refreshToken, string accessToken)
    {
        Response.Cookies.Append("access_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        });
        
        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });
    }
}