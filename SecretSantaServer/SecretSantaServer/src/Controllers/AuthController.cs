using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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
            AddRefreshTokenToCookies(result.Value.RefreshToken);
            return CreatedAtRoute(result.Value.User.UserProfile.Id, result.Value.User);
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
            AddRefreshTokenToCookies(result.Value.RefreshToken);
            return Ok(result.Value.User);
        }
        
        return StatusCode(result.StatusCode, new { result.Error });
    }
    
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out string refreshToken))
        {
            return Unauthorized("Refresh token missing");
        }
        
        var result = await _authService.Logout(refreshToken);
        if (result.IsSuccess)
            return Ok();

        return StatusCode(result.StatusCode, new { result.Error });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        if (!Request.Cookies.TryGetValue("refresh_token", out string refreshToken))
        {
            return Unauthorized("Refresh token missing");
        }
        
        var result = await _authService.Refresh(refreshToken);
        if (result.IsSuccess)
        {
            AddRefreshTokenToCookies(result.Value.RefreshToken);
            return Ok(result.Value.User);
        }
        
        return StatusCode(result.StatusCode, new { result.Error });
    }

    private void AddRefreshTokenToCookies(string refreshToken)
    {
        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });
    }
}