using SecretSantaServer.DTOs;
using SecretSantaServer.Models;

namespace SecretSantaServer.Services;

public interface IAssignmentService
{
    Task<Result<GameMemberDto>> GetMyWishLetter(int gameId, int userId);
    Task<Result<GameMemberDto>> GetParticipantWishLetter(int gameId, int userId);
    Task<Result<GameMemberDto>> ChangeWishLetter(int gameId, int userId, string wishLetter);
}