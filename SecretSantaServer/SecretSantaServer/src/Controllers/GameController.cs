using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
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
        
        return CreatedAtAction(nameof(GetGameById), new{result.Value!.Id}, result.Value);
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
    
    [HttpPut("{gameId}/start")]
    [Authorize]
    public async Task<IActionResult> StartGame(int gameId)
    {
        var userId=GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId,userId,GameStatus.Created,GameStatus.Started);
        
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, new{result.Error});
        
        return Ok(result.Value);
    }

    [HttpPut("{gameId}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelGame(int gameId)
    {
        var userId=GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId, userId,GameStatus.Created,GameStatus.Cancelled);
        
        if(!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);
        
        return Ok(result.Value);
    }
    
    [HttpPut("{gameId}/finish")]
    [Authorize]
    public async Task<IActionResult> FinishGame(int gameId)
    {
        var userId=GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId, userId,GameStatus.Started,GameStatus.Finished);
        
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