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