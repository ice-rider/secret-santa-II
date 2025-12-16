using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Models;

namespace SecretSantaServer.Services;

public class GameService : IGameService
{
    private readonly ApplicationDbContext _context;
    public GameService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GameDto>> CreateGame(int adminId, CreateGameRequest request)
    {
        if (!_context.Users.Any(u => u.Id == adminId))
            return Result<GameDto>.Failure("Admin user not found", StatusCodes.Status404NotFound);
        var uniqueCode = await GenerateUniqueGameCodeAsync();
        
        var game = new Game
        {
            Title = request.Title,
            Description = request.Description,
            AdminId = adminId,
            Code = uniqueCode,
            Status = GameStatus.Created
        };
        
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Games.Add(game);
            await _context.SaveChangesAsync();
            
            var adminMember = new GameMember
            {
                GameId = game.Id,
                UserId = adminId
            };
            _context.GameMembers.Add(adminMember);
            await _context.SaveChangesAsync();
            
            await transaction.CommitAsync();
            return Result<GameDto>.Success(new GameDto(game), StatusCodes.Status201Created);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Result<GameDto>.Failure("Internal server error", StatusCodes.Status500InternalServerError);
        }
    }

    public async Task<Result<List<GameDto>>> GetUserGames(int id)
    {
        if(!_context.Users.Any(u => u.Id == id))
            return Result<List<GameDto>>.Failure("User not found", StatusCodes.Status404NotFound);
        
        var result = await _context.GameMembers
            .AsNoTracking()
            .Include(gm => gm.Game)
            .Where(gm => gm.UserId == id)
            .Select(gm => new GameDto(gm.Game)).ToListAsync();
        
        return Result<List<GameDto>>.Success(result);
    }

    public async Task<Result<GameDto>> GetGameById(int id)
    {
        var game = await _context.Games
            .AsNoTracking()
            .Include(g => g.GameMembers)
            .ThenInclude(gm => gm.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);

        return Result<GameDto>.Success(new GameDto(game));
    }

    public async Task<Result<GameDto>> UpdateGame(int gameId, UpdateGameRequest request, int userId)
    {
        var game = await _context.Games.FindAsync(gameId);
        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);
        if(game.AdminId != userId)
            return Result<GameDto>.Failure("You don't have access to this game's settings", StatusCodes.Status403Forbidden);

        if (game.Status != GameStatus.Created)
            return Result<GameDto>.Failure("Game cannot be updated after it has started", StatusCodes.Status400BadRequest);

        game.Title = request.Title;
        game.Description = request.Description;

        _context.Games.Update(game);
        await _context.SaveChangesAsync();

        return Result<GameDto>.Success(new GameDto(game));

    }

    public async Task<Result<bool>> DeleteGame(int gameId, int userId)
    {
        var game = await _context.Games
            .Include(g => g.GameMembers)
            .FirstOrDefaultAsync(g => g.Id == gameId);
        
        if (game == null)
            return Result<bool>.Failure("Game not found", StatusCodes.Status404NotFound);
        if(game.AdminId != userId)
            return Result<bool>.Failure("You don't have access to this game's settings", StatusCodes.Status403Forbidden);

        if (game.Status != GameStatus.Created)
            return Result<bool>.Failure("Only not started games can be deleted", StatusCodes.Status400BadRequest);

        _context.GameMembers.RemoveRange(game.GameMembers);
        _context.Games.Remove(game);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
    
    private async Task<string> GenerateUniqueGameCodeAsync(int length = 6)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        string code;

        do
        {
            code = new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        } while (await _context.Games.AnyAsync(g => g.Code == code));

        return code;
    }
}