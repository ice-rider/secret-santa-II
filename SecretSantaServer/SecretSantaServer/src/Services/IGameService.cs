using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;

namespace SecretSantaServer.Services;

public interface IGameService
{
    Task<Result<GameDto>> CreateGame(int adminId, CreateGameRequest request);
    Task<Result<List<GameDto>>> GetUserGames(int id);
    Task<bool> IsUserInGame(int gameId, int userId);
    Task<Result<GameDto>> GetGameById(int id);
    Task<GameStatus?> GetGameStatusById(int id);
    Task<Result<GameDto>> UpdateGame(int gameId, UpdateGameRequest request, int userId);
    Task<Result<GameDto>> ChangeStatusGame(int gameId, int userId, GameStatus expectedStatus, GameStatus newStatus);
    Task<Result<GameDto>> JoinGame(string gameCode, int userId, string? wishLetter);
    Task<Result<GameDto>> ExitGame(int gameId, int userId);
    Task<Result<bool>> RemoveMember(int gameId, int memberId, int userId);
}