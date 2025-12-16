using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecretSantaServer.DTOs;
using SecretSantaServer.Services;

namespace SecretSantaServer.Controllers;

[ApiController, Route("api/[controller]s")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;

    public GameController(IGameService gameService)
    {
        _gameService = gameService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest request)
    {
        var userId=GetUserId();
        var result = await _gameService.CreateGame(userId, request);
        
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, new{result.Error});
        
        return CreatedAtRoute(result.Value!.Id.ToString(), result.Value);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameById(int id)
    {
        var result = await _gameService.GetGameById(id);
        
        if(!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        
        return Ok(result.Value);
    }

    [HttpPut("{gameId}")]
    [Authorize]
    public async Task<IActionResult> UpdateGame(int gameId, [FromBody] UpdateGameRequest request)
    {
        var userId = GetUserId();
        var result = await _gameService.UpdateGame(gameId, request, userId);
        
        if(!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        
        return Ok(result.Value);
    }

    [HttpDelete("{gameId}")]
    [Authorize]
    public async Task<IActionResult> DeleteGame(int gameId)
    {
        var userId=GetUserId();
        var result = await _gameService.DeleteGame(gameId, userId);
        
        if(!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        
        return NoContent();
    }
    
    private int GetUserId()
    {
        var userId=int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return userId;
    }
}