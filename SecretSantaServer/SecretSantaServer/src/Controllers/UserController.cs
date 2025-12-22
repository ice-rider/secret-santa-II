using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecretSantaServer.Services;

namespace SecretSantaServer.Controllers;

[ApiController,Route("api/[controller]s")]
public class UserController : ControllerBase
{
    private readonly IGameService _gameService;

    public UserController(IGameService gameService)
    {
        _gameService = gameService;
    }
    
    [HttpGet("me/games")]
    [Authorize]
    public async Task<IActionResult> GetUserGames()
    {
        var id=GetUserId();
        var result = await _gameService.GetUserGames(id);
        
        if(!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        
        return Ok(result.Value);
    }

    private int GetUserId()
    {
        var userId=int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return userId;
    }
}