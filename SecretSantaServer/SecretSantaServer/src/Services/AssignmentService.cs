using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;

namespace SecretSantaServer.Services;

public class AssignmentService : IAssignmentService
{
    private readonly IDbContext _dbContext;

    public AssignmentService(IDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<GameMemberDto>> GetMyWishLetter(int gameId, int userId)
    {
        var member = await _dbContext.GameMembers.AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(g => g.GameId == gameId && g.UserId == userId);
        if (member == null)
            return Result<GameMemberDto>.Failure($"User {userId} not found in game {gameId}",
                StatusCodes.Status404NotFound);

        return Result<GameMemberDto>.Success(new GameMemberDto(member));
    }

    public async Task<Result<GameMemberDto>> GetParticipantWishLetter(int gameId, int userId)
    {
        var game = await _dbContext.Games.Include(x => x.GameMembers)
            .ThenInclude(x => x.User).FirstOrDefaultAsync(x => x.Id == gameId);
        if (game == null)
            return Result<GameMemberDto>.Failure($"Game {gameId} not found", StatusCodes.Status404NotFound);
        if (game.Status != GameStatus.Started)
            return Result<GameMemberDto>.Failure("Game has not started yet", StatusCodes.Status400BadRequest);
        
        var member = game.GameMembers.FirstOrDefault(g => g.GameId == gameId && g.UserId == userId);
        if (member == null)
            return Result<GameMemberDto>.Failure($"User {userId} not found in game {gameId}",
                StatusCodes.Status404NotFound);

        var assignment = await _dbContext.Assignments.AsNoTracking()
            .Include(x => x.Recipient)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.SantaId == member.Id);
        if (assignment == null)
            return Result<GameMemberDto>.Failure($"User {userId} not found in game {gameId}", StatusCodes.Status404NotFound);

        return Result<GameMemberDto>.Success(new GameMemberDto(assignment.Recipient));
    }

    public async Task<Result<GameMemberDto>> ChangeWishLetter(int gameId, int userId, string wishLetter)
    {
        var gameMember = await _dbContext.GameMembers.Include(x => x.Game)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.GameId == gameId && x.UserId == userId);
        if (gameMember == null)
            return Result<GameMemberDto>.Failure($"User {userId} not found in game {gameId}",
                StatusCodes.Status404NotFound);

        if (gameMember.Game.Status != GameStatus.Created)
            return Result<GameMemberDto>.Failure("You can't change wish after the game has started.",
                StatusCodes.Status400BadRequest);
        gameMember.Letter = wishLetter;
        _dbContext.GameMembers.Update(gameMember);
        await _dbContext.SaveChangesAsync();

        return Result<GameMemberDto>.Success(new GameMemberDto(gameMember));
    }
}