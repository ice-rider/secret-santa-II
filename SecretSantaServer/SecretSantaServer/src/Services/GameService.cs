using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Expressions.Internal;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Models;
using SecretSantaServer.Enums;
using SecretSantaServer.Hubs;

namespace SecretSantaServer.Services;

public class GameService : IGameService
{
    #region fields

    private readonly ApplicationDbContext _dbContext;
    private readonly IHubContext<GameHub> _hubContext;
    private readonly ICacheRepository _cacheRepository;

    private readonly string _gameStatusUpdateMethod;
    private readonly string _userJoinMethod;
    private readonly string _userExitMethod;

    private const string CharsForCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private readonly TimeSpan gameExpiration = TimeSpan.FromMinutes(60);

    public GameService(ApplicationDbContext dbContext, IHubContext<GameHub> hubContextContext,
        IConfiguration configuration, ICacheRepository cacheRepository)
    {
        _dbContext = dbContext;
        _hubContext = hubContextContext;
        _gameStatusUpdateMethod = configuration["Frontend:GameStatusUpdatedMethod"]!;
        _userJoinMethod = configuration["Frontend:UserJoinMethod"]!;
        _userExitMethod = configuration["Frontend:UserExitMethod"]!;
        _cacheRepository = cacheRepository;
    }

    #endregion

    #region getGame

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

    public async Task<bool> IsUserInGame(int gameId, int userId)
    {
        return await _dbContext.GameMembers.AnyAsync(gm => gm.GameId == gameId && gm.UserId == userId);
    }

    public async Task<Result<GameDto>> GetGameById(int id)
    {
        var gameInCache = await _cacheRepository.GetAsync<GameDto>(id.ToString());
        if (gameInCache != null)
            return Result<GameDto>.Success(gameInCache);
        var game = await _dbContext.Games
            .AsNoTracking()
            .Include(g => g.GameMembers)
            .ThenInclude(gm => gm.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);
        var gameDto = new GameDto(game);
        await _cacheRepository.SetAsync(id.ToString(), gameDto, gameExpiration);
        return Result<GameDto>.Success(gameDto);
    }

    public async Task<GameStatus?> GetGameStatusById(int id)
    {
        var gameInCache = await _cacheRepository.GetAsync<GameDto>(id.ToString());
        if (gameInCache != null)
            return gameInCache.Status;
        var game = await _dbContext.Games.FirstOrDefaultAsync(x => x.Id == id);
        if (game == null)
            return null;

        await _cacheRepository.SetAsync(id.ToString(), new GameDto(game), gameExpiration);
        return game.Status;
    }

    #endregion

    #region gameEdit

    public async Task<Result<GameDto>> CreateGame(int adminId, CreateGameRequest request)
    {
        if (!await _dbContext.Users.AnyAsync(u => u.Id == adminId))
            return Result<GameDto>.Failure("Admin user not found", StatusCodes.Status404NotFound);

        if (request.StartsAt < DateTime.UtcNow)
            request.StartsAt = null;

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var code = GenerateGameCode(5 + attempt);
            var game = new Game
            {
                Title = request.Title,
                Description = request.Description,
                AdminId = adminId,
                Code = code,
                IsAdminParticipating = request.IsAdminParticipating,
                Status = GameStatus.Created,
                ScheduledAt = request.StartsAt
            };

            if (await TryAddGame(adminId, game)) continue;

            var gameDto = new GameDto(game);
            await _cacheRepository.SetAsync(game.Id.ToString(), gameDto, gameExpiration);
            return Result<GameDto>.Success(gameDto, StatusCodes.Status201Created);
        }

        return Result<GameDto>.Failure("Failed to generate unique game code", StatusCodes.Status500InternalServerError);
    }

    public async Task<Result<GameDto>> UpdateGame(int gameId, UpdateGameRequest request, int userId)
    {
        var game = await _dbContext.Games.Include(g => g.GameMembers).ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == gameId);

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
        game.ScheduledAt = request.StartsAt;
        game.IsAdminParticipating = request.IsAdminParticipating;

        _dbContext.Games.Update(game);
        await _dbContext.SaveChangesAsync();
        await _cacheRepository.RemoveAsync<GameDto>(game.Id.ToString());
        var gameDto = new GameDto(game);
        await _cacheRepository.SetAsync(game.Id.ToString(), gameDto, gameExpiration);

        return Result<GameDto>.Success(gameDto);
    }

    public async Task<Result<GameDto>> ChangeStatusGame(int gameId, int userId, GameStatus expectedStatus,
        GameStatus newStatus)
    {
        var game = await _dbContext.Games
            .Include(g => g.GameMembers).ThenInclude(x => x.User)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameDto>.Failure("Game not found", StatusCodes.Status404NotFound);
        if (game.AdminId != userId)
            return Result<GameDto>.Failure("You don't have access to this game's settings",
                StatusCodes.Status403Forbidden);

        if (game.Status != expectedStatus)
            return Result<GameDto>.Failure($"Game status not {expectedStatus}. Current status: {game.Status}",
                StatusCodes.Status400BadRequest);
        if (newStatus == GameStatus.Started)
        {
            var participants = game.GameMembers.Count;
            if (!game.IsAdminParticipating)
                participants--;
            if (participants < 3)
                return Result<GameDto>.Failure("Too few players to start", StatusCodes.Status400BadRequest);
        }

        var result = await ProcessNewStatus(gameId, newStatus, game);
        await _cacheRepository.RemoveAsync<GameDto>(game.Id.ToString());
        await _cacheRepository.SetAsync(game.Id.ToString(), new GameDto(game), gameExpiration);
        return result;
    }

    #endregion

    #region members

    public async Task<Result<GameDto>> JoinGame(string gameCode, int userId, string? wishLetter)
    {
        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
            return Result<GameDto>.Failure($"User {userId} not found", StatusCodes.Status404NotFound);

        var game = await _dbContext.Games.Include(x => x.GameMembers).ThenInclude(x => x.User)
            .FirstOrDefaultAsync(g => g.Code == gameCode);

        if (game == null)
            return Result<GameDto>.Failure($"Game {gameCode} not found", StatusCodes.Status404NotFound);
        if (game.GameMembers.Any(m => m.UserId == userId))
            return Result<GameDto>.Failure("You are already in game", StatusCodes.Status409Conflict);

        var newMember = new GameMember
        {
            GameId = game.Id,
            UserId = userId,
            Letter = wishLetter,
        };
        _dbContext.GameMembers.Add(newMember);
        await _dbContext.SaveChangesAsync();

        await _hubContext.Clients.Group($"game-{game.Id}")
            .SendAsync(_userJoinMethod, new EventDto<UserProfileDto>($"user-joined", new UserProfileDto(user)));
        await _cacheRepository.RemoveAsync<GameDto>(game.Id.ToString());
        var gameDto = new GameDto(game);
        await _cacheRepository.SetAsync(game.Id.ToString(), gameDto, gameExpiration);
        return Result<GameDto>.Success(gameDto);
    }

    public async Task<Result<GameDto>> ExitGame(int gameId, int userId)
    {
        var game = await _dbContext.Games.Include(x => x.GameMembers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameDto>.Failure($"Game {gameId} not found", StatusCodes.Status404NotFound);

        var gameMember = game.GameMembers.FirstOrDefault(m => m.UserId == userId);
        if (gameMember == null)
            return Result<GameDto>.Failure($"User {userId} not found in game", StatusCodes.Status404NotFound);

        if (userId == game.AdminId)
            return Result<GameDto>.Failure("Admin can't exit game", StatusCodes.Status400BadRequest);

        if (game.Status != GameStatus.Created)
            return Result<GameDto>.Failure("You can't exit after the game has started.",
                StatusCodes.Status400BadRequest);

        _dbContext.GameMembers.Remove(gameMember);
        await _dbContext.SaveChangesAsync();

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
        await _hubContext.Clients.Group($"game-{game.Id}")
            .SendAsync(_userExitMethod, new EventDto<UserProfileDto>($"user-exit", new UserProfileDto(user!)));

        await _cacheRepository.RemoveAsync<GameDto>(game.Id.ToString());
        var gameDto = new GameDto(game);
        await _cacheRepository.SetAsync(game.Id.ToString(), gameDto, gameExpiration);
        return Result<GameDto>.Success(gameDto);
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
            return Result<bool>.Failure("Cannot remove member after game has started",
                StatusCodes.Status400BadRequest);

        var member = game.GameMembers.FirstOrDefault(m => m.UserId == memberId);
        if (member == null)
            return Result<bool>.Failure($"User {userId} not found in game", StatusCodes.Status404NotFound);

        if (game.AdminId == memberId)
            return Result<bool>.Failure("Cannot remove game admin", StatusCodes.Status400BadRequest);

        _dbContext.GameMembers.Remove(member);
        await _dbContext.SaveChangesAsync();

        await _cacheRepository.RemoveAsync<GameDto>(game.Id.ToString());
        await _cacheRepository.SetAsync(game.Id.ToString(), new GameDto(game), gameExpiration);

        return Result<bool>.Success(true);
    }

    #endregion

    #region private

    private async Task<bool> TryAddGame(int adminId, Game game)
    {
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
        }
        catch (DbUpdateException ex)
            when (ex.InnerException?.Message.Contains("UNIQUE") == true ||
                  ex.InnerException?.Message.Contains("duplicate") == true)
        {
            _dbContext.Entry(game).State = EntityState.Detached;
            return true;
        }

        return false;
    }

    private async Task<Result<GameDto>> ProcessNewStatus(int gameId, GameStatus newStatus, Game game)
    {
        game.Status = newStatus;
        if (newStatus is GameStatus.Started or GameStatus.Cancelled)
        {
            game.Code = null;
            game.ScheduledAt = null;
        }

        if (newStatus == GameStatus.Started)
        {
            StartGame(game);
            game.StartedAt = DateTime.UtcNow;
        }

        if (newStatus == GameStatus.Finished)
            game.FinishedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        await _hubContext.Clients.Group($"game-{gameId}")
            .SendAsync(_gameStatusUpdateMethod, new EventDto<int>($"game-{newStatus}", gameId));

        return Result<GameDto>.Success(new GameDto(game));
    }

    private string GenerateGameCode(int length = 6)
    {
        return new string(Enumerable.Range(0, length)
            .Select(_ => CharsForCode[Random.Shared.Next(CharsForCode.Length)])
            .ToArray());
    }

    private void StartGame(Game game)
    {
        var members = game.GameMembers.Where(x => x.UserId != game.AdminId || game.IsAdminParticipating)
            .Select(x => x.Id).ToList();
        members.Shuffle();
        for (var i = 1; i < members.Count; i++)
        {
            var assignment = new Assignment()
            {
                GameId = game.Id,
                RecipientId = members[i],
                SantaId = members[i - 1],
            };
            _dbContext.Assignments.Add(assignment);
        }

        var lastAssigment = new Assignment()
        {
            GameId = game.Id,
            RecipientId = members[0],
            SantaId = members[^1],
        };
        _dbContext.Assignments.Add(lastAssigment);
    }

    #endregion
}

public static class ShuffleExtension
{
    private static Random rng = new Random();

    public static void Shuffle<T>(this IList<T> list)
    {
        var n = list.Count;
        while (n > 1)
        {
            n--;
            var k = rng.Next(n + 1);
            (list[k], list[n]) = (list[n], list[k]);
        }
    }
}