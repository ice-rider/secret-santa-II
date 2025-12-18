using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Models;
using SecretSantaServer.Enums;

namespace SecretSantaServer.Services;

public class GameService : IGameService
{
    private readonly ApplicationDbContext _dbContext;

    public GameService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<GameDto>> CreateGame(int adminId, CreateGameRequest request)
    {
        if (!_dbContext.Users.Any(u => u.Id == adminId))
            return Result<GameDto>.Failure("Admin user not found", StatusCodes.Status404NotFound);
        var uniqueCode = await GenerateUniqueGameCodeAsync();

        if (request.StartsAt < DateTime.UtcNow)
            request.StartsAt = null;

        var game = new Game
        {
            Title = request.Title,
            Description = request.Description,
            AdminId = adminId,
            Code = uniqueCode,
            IsAdminParticipating = request.IsAdminParticipating,
            Status = GameStatus.Created,
            StartsAt = request.StartsAt
        };

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            _dbContext.Games.Add(game);
            await _dbContext.SaveChangesAsync();

            var adminMember = new GameMember
            {
                GameId = game.Id,
                UserId = adminId
            };
            _dbContext.GameMembers.Add(adminMember);
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return Result<GameDto>.Success(new GameDto(game), StatusCodes.Status201Created);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.InnerException);
            await transaction.RollbackAsync();
            return Result<GameDto>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
        }
    }

    public async Task<Result<List<GameDto>>> GetUserGames(int id)
    {
        if (!_dbContext.Users.Any(u => u.Id == id))
            return Result<List<GameDto>>.Failure("User not found", StatusCodes.Status404NotFound);

        var result = await _dbContext.GameMembers
            .AsNoTracking()
            .Include(gm => gm.Game)
            .Where(gm => gm.UserId == id)
            .Select(gm => new GameDto(gm.Game)).ToListAsync();

        return Result<List<GameDto>>.Success(result);
    }

    public async Task<Result<GameDto>> GetGameById(int id)
    {
        var game = await _dbContext.Games
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
        var game = await _dbContext.Games.FindAsync(gameId);
        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);
        if (game.AdminId != userId)
            return Result<GameDto>.Failure("You don't have access to this game's settings",
                StatusCodes.Status403Forbidden);

        if (game.Status != GameStatus.Created)
            return Result<GameDto>.Failure("Game cannot be updated after it has started",
                StatusCodes.Status400BadRequest);

        if (request.StartsAt < DateTime.UtcNow)
            request.StartsAt = null;

        game.Title = request.Title;
        game.Description = request.Description;
        game.StartsAt = request.StartsAt;
        game.IsAdminParticipating = request.IsAdminParticipating;

        _dbContext.Games.Update(game);
        await _dbContext.SaveChangesAsync();

        return Result<GameDto>.Success(new GameDto(game));
    }

    public async Task<Result<GameDto>> ChangeStatusGame(int gameId, int userId, GameStatus expectedStatus,
        GameStatus newStatus)
    {
        var game = await _dbContext.Games
            .Include(g => g.GameMembers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);
        if (game.AdminId != userId)
            return Result<GameDto>.Failure("You don't have access to this game's settings",
                StatusCodes.Status403Forbidden);

        if (game.Status != expectedStatus)
            return Result<GameDto>.Failure($"Game status not {expectedStatus}. Current status: {game.Status}",
                StatusCodes.Status400BadRequest);

        game.Status = newStatus;
        if (newStatus == GameStatus.Started || newStatus == GameStatus.Cancelled)
        {
            game.Code = null;
            game.StartsAt = null;
        }

        if (newStatus == GameStatus.Started)
            game.StartedAt = DateTime.UtcNow;
        if (newStatus == GameStatus.Finished)
            game.FinishedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Result<GameDto>.Success(new GameDto(game));
    }

    public async Task<Result<GameDto>> JoinGame(string gameCode, int userId)
    {
        if (await _dbContext.Users.AllAsync(x => x.Id != userId))
            return Result<GameDto>.Failure($"User {userId} not found", StatusCodes.Status404NotFound);

        var game = await _dbContext.Games.Include(x => x.GameMembers)
            .FirstOrDefaultAsync(g => g.Code == gameCode);

        if (game == null)
            return Result<GameDto>.Failure($"Game {gameCode} not found", StatusCodes.Status404NotFound);
        if (game.GameMembers.Any(m => m.UserId == userId))
            return Result<GameDto>.Failure("You are already in game", StatusCodes.Status409Conflict);

        var newMember = new GameMember
        {
            GameId = game.Id,
            UserId = userId
        };
        _dbContext.GameMembers.Add(newMember);
        await _dbContext.SaveChangesAsync();

        return Result<GameDto>.Success(new GameDto(game));
    }
    
    public async Task<Result<GameDto>> ExitGame(int gameId, int userId)
    {
        var game = await _dbContext.Games.Include(x => x.GameMembers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameDto>.Failure($"Game {gameId} not found", StatusCodes.Status404NotFound);
        
        var user=game.GameMembers.FirstOrDefault(m => m.UserId == userId);
        if (user==null)
            return Result<GameDto>.Failure($"User {userId} not found in game", StatusCodes.Status404NotFound);
        
        if(userId==game.AdminId)
            return Result<GameDto>.Failure("Admin can't exit game", StatusCodes.Status400BadRequest);
        
        if (game.Status != GameStatus.Created)
            return Result<GameDto>.Failure("You can't exit after the game has started.",
                StatusCodes.Status400BadRequest);
        
        _dbContext.GameMembers.Remove(user);
        await _dbContext.SaveChangesAsync();

        return Result<GameDto>.Success(new GameDto(game));
    }

    public async Task<Result<bool>> RemoveMember(int gameId, int memberId, int userId)
    {
        var game = await _dbContext.Games
            .Include(g => g.GameMembers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<bool>.Failure($"Game {gameId} not found", StatusCodes.Status404NotFound);
        if (game.AdminId != userId)
            return Result<bool>.Failure("You don't have access to this game's settings",
                StatusCodes.Status403Forbidden);

        if (game.Status != GameStatus.Created)
            return Result<bool>.Failure("Cannot remove members after game has started",
                StatusCodes.Status400BadRequest);

        var member = game.GameMembers.FirstOrDefault(m => m.UserId == memberId);
        if (member == null)
            return Result<bool>.Failure($"User {userId} not found in game", StatusCodes.Status404NotFound);

        if (game.AdminId == memberId)
            return Result<bool>.Failure("Cannot remove game admin", StatusCodes.Status400BadRequest);
        if (game.Status != GameStatus.Created)
            return Result<bool>.Failure("You can't remove a player after the game has started.",
                StatusCodes.Status400BadRequest);

        _dbContext.GameMembers.Remove(member);
        await _dbContext.SaveChangesAsync();

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
        } while (await _dbContext.Games.AnyAsync(g => g.Code == code));

        return code;
    }
}