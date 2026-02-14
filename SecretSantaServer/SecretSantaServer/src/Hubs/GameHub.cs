using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Services;

namespace SecretSantaServer.Hubs;

[Authorize]
public class GameHub : Hub
{
    private readonly IGameService _gameService;
    private readonly string _gameStatusUpdateMethod;

    public GameHub(IGameService gameService, IConfiguration configuration)
    {
        _gameService = gameService;
        _gameStatusUpdateMethod = configuration["Frontend:GameStatusUpdatedMethod"]!;
    }

    public async Task JoinGame(int gameId)
    {
        var userId = int.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (!await _gameService.IsUserInGame(gameId, userId))
        {
            await Clients.Caller.SendAsync("Error", $"User {userId} not in game {gameId}");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"game-{gameId}");

        var currentStatus = await _gameService.GetGameStatusById(gameId);

        await Clients.Caller.SendAsync(_gameStatusUpdateMethod, new EventDto<int>($"game-{currentStatus}", gameId));
    }
}