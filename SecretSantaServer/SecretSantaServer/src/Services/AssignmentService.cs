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

    public async Task<Result<GameMemberDto>> GetWishLetter(int gameId, int userId, int requesterId)
    {
        var member=await _dbContext.GameMembers.AsNoTracking()
            .Include(x=>x.User)
            .FirstOrDefaultAsync(g => g.GameId == gameId && g.UserId == userId);
        if(member == null)
            return Result<GameMemberDto>.Failure($"User {userId} not found", StatusCodes.Status404NotFound);
        
        if(userId == requesterId)
            return Result<GameMemberDto>.Success(new GameMemberDto(member));
        
        var assignment = await _dbContext.Assignments.AsNoTracking()
            .Include(x=>x.Recipient)
            .FirstOrDefaultAsync(x=>x.GameId == gameId && x.RecipientId == userId);
        if (assignment == null) 
            return Result<GameMemberDto>.Failure("Assignment not found", StatusCodes.Status404NotFound);
        
        if(assignment.SantaId!=requesterId)
            return Result<GameMemberDto>.Failure("You don't have access to this assignment", StatusCodes.Status403Forbidden);
        
        return Result<GameMemberDto>.Success(new GameMemberDto(member));
    }
    
    public async Task<Result<GameMemberDto>> ChangeWishLetter(int gameId, int userId, string wishLetter)
    {
        var gameMember = await _dbContext.GameMembers.Include(x=>x.Game)
            .Include(x=>x.User)
            .FirstOrDefaultAsync(x=>x.GameId == gameId && x.UserId == userId);
        if (gameMember == null) 
            return Result<GameMemberDto>.Failure($"User {userId} not found in game {gameId}", StatusCodes.Status404NotFound);
        
        if(gameMember.Game.Status!=GameStatus.Created)
            return Result<GameMemberDto>.Failure("You can't change wish after the game has started.",
                StatusCodes.Status400BadRequest);
        gameMember.Letter = wishLetter;
        _dbContext.GameMembers.Update(gameMember);
        await _dbContext.SaveChangesAsync();
        
        return Result<GameMemberDto>.Success(new GameMemberDto(gameMember));
    }
}