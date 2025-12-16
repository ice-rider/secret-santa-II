using SecretSantaServer.DTOs;

namespace SecretSantaServer.Services;

public interface IGameService
{
    Task<Result<GameDto>> CreateGame(int adminId, CreateGameRequest request);
    Task<Result<List<GameDto>>> GetUserGames(int id);
    Task<Result<GameDto>> GetGameById(int id);
    Task<Result<GameDto>> UpdateGame(int gameId, UpdateGameRequest request, int userId);
    Task<Result<bool>> DeleteGame(int gameId, int userId);
}