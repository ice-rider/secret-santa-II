using SecretSantaServer.DTOs;
using SecretSantaServer.Models;

namespace SecretSantaServer.Services;

public interface IAssignmentService
{
    Task<Result<GameMemberDto>> GetWishLetter(int gameId, int userId, int requesterId);
    Task<Result<GameMemberDto>> ChangeWishLetter(int gameId, int userId, string wishLetter);
}