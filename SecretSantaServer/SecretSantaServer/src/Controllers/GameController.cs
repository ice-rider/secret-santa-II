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
    private readonly IAssignmentService _assignmentService;

    public GameController(IGameService gameService, IAssignmentService assignmentService)
    {
        _gameService = gameService;
        _assignmentService = assignmentService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest request)
    {
        var userId = GetUserId();
        var result = await _gameService.CreateGame(userId, request);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, new { result.Error });

        return CreatedAtAction(nameof(GetGameById), new { result.Value!.Id }, result.Value);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGameById(int id)
    {
        var result = await _gameService.GetGameById(id);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpPut("{gameId}")]
    [Authorize]
    public async Task<IActionResult> UpdateGame(int gameId, [FromBody] UpdateGameRequest request)
    {
        var userId = GetUserId();
        var result = await _gameService.UpdateGame(gameId, request, userId);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{gameId}/start")]
    [Authorize]
    public async Task<IActionResult> StartGame(int gameId)
    {
        var userId = GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId, userId, GameStatus.Created, GameStatus.Started);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, new { result.Error });

        return Ok(result.Value);
    }

    [HttpPost("{gameId}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelGame(int gameId)
    {
        var userId = GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId, userId, GameStatus.Created, GameStatus.Cancelled);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{gameId}/finish")]
    [Authorize]
    public async Task<IActionResult> FinishGame(int gameId)
    {
        var userId = GetUserId();
        var result = await _gameService.ChangeStatusGame(gameId, userId, GameStatus.Started, GameStatus.Finished);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{gameCode}/join")]
    [Authorize]
    public async Task<IActionResult> JoinGame(string gameCode, WishLetterDto? wishLetter = null)
    {
        var userId = GetUserId();
        var result = await _gameService.JoinGame(gameCode, userId, wishLetter?.Letter);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }
    
    [HttpPut("{gameId}/members/me")]
    [Authorize]
    public async Task<IActionResult> ChangeWishLetter(int gameId, WishLetterDto wishLetter)
    {
        var userId = GetUserId();
        if(wishLetter.Letter == null)
            return BadRequest("Wish letter text cannot be null");
        
        var result = await _assignmentService.ChangeWishLetter(gameId, userId, wishLetter.Letter!);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }
    
    [HttpGet("{gameId}/members/{userId}/wish")]
    [Authorize]
    public async Task<IActionResult> GetWishLetter(int gameId, int userId, WishLetterDto wishLetter)
    {
        var requesterId = GetUserId();
        
        var result = await _assignmentService.GetWishLetter(gameId, userId, requesterId);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpPost("{gameId}/exit")]
    [Authorize]
    public async Task<IActionResult> ExitGame(int gameId)
    {
        var userId = GetUserId();
        var result = await _gameService.ExitGame(gameId, userId);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    [HttpDelete("{gameId}/members/{memberId}")]
    [Authorize]
    public async Task<IActionResult> RemoveMember(int gameId, int memberId)
    {
        var userId = GetUserId();
        var result = await _gameService.RemoveMember(gameId, memberId, userId);
        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, result.Error);

        return Ok(result.Value);
    }

    private int GetUserId()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return userId;
    }
}