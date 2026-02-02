using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Hubs;
using SecretSantaServer.Models;
using SecretSantaServer.Services;

namespace Tests.Services;

public class GameServiceTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<ICacheRepository> _mockCacheRepository;
    private readonly Mock<IHubContext<GameHub>> _mockHubContext;
    private readonly GameService _gameService;

    public GameServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _mockConfiguration = new Mock<IConfiguration>();
        _mockCacheRepository = new Mock<ICacheRepository>();
        _mockHubContext = new Mock<IHubContext<GameHub>>();

        var mockClientProxy = new Mock<IClientProxy>();
        var mockHubClients = new Mock<IHubClients>();
        mockHubClients
            .Setup(clients => clients.Group(It.IsAny<string>()))
            .Returns(mockClientProxy.Object);
        _mockHubContext
            .Setup(hub => hub.Clients)
            .Returns(mockHubClients.Object);

        _mockConfiguration.Setup(config => config["Frontend:GameStatusUpdatedMethod"]).Returns("GameStatusUpdated");
        _mockConfiguration.Setup(config => config["Frontend:UserJoinMethod"]).Returns("UserJoined");
        _mockConfiguration.Setup(config => config["Frontend:UserExitMethod"]).Returns("UserExited");

        _gameService = new GameService(_dbContext, _mockHubContext.Object, _mockConfiguration.Object,
            _mockCacheRepository.Object);
    }

    [Fact]
    public async Task GetUserGames_UserExists_ReturnsUserGames()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            Description = "Test Description",
            AdminId = 1,
            Code = "ABC123",
            Status = GameStatus.Created,
            Admin = user
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Game = game,
            User = user
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.GetUserGames(1);
        
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Single(result.Value);
    }

    [Fact]
    public async Task GetUserGames_UserDoesNotExist_ReturnsFailure()
    {
        var result = await _gameService.GetUserGames(999);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("User not found", result.Error);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task IsUserInGame_UserInGame_ReturnsTrue()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            Description = "Test Description",
            AdminId = 1,
            Code = "ABC123",
            Status = GameStatus.Created,
            Admin = user
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Game = game,
            User = user
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.IsUserInGame(1, 1);
        
        Assert.True(result);
    }

    [Fact]
    public async Task IsUserInGame_UserNotInGame_ReturnsFalse()
    {
        var result = await _gameService.IsUserInGame(1, 999);
        
        Assert.False(result);
    }

    [Fact]
    public async Task GetGameById_GameExists_ReturnsGame()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            Description = "Test Description",
            AdminId = 1,
            Code = "ABC123",
            Status = GameStatus.Created,
            Admin = user,
            GameMembers = new List<GameMember>()
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.GetGameById(1);
        
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(game.Title, result.Value.Title);
    }

    [Fact]
    public async Task GetGameById_GameDoesNotExist_ReturnsFailure()
    {
        var result = await _gameService.GetGameById(999);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Game not found", result.Error);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task CreateGame_ValidRequest_CreatesGame()
    {
        var user = new User { Id = 1, Name = "Test Admin" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var request = new CreateGameRequest
        {
            Title = "New Game",
            Description = "New Game Description",
            IsAdminParticipating = true,
            StartsAt = DateTime.UtcNow.AddDays(1)
        };
        
        var result = await _gameService.CreateGame(1, request);
        
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(request.Title, result.Value.Title);
        Assert.Equal(request.Description, result.Value.Description);
    }

    [Fact]
    public async Task CreateGame_AdminDoesNotExist_ReturnsFailure()
    {
        var request = new CreateGameRequest
        {
            Title = "New Game",
            Description = "New Game Description",
            IsAdminParticipating = true
        };
        
        var result = await _gameService.CreateGame(999, request);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Admin user not found", result.Error);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task CreateGame_AdminExists_CreatesGameAndAddsAdminAsMember()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        _dbContext.Users.Add(admin);
        await _dbContext.SaveChangesAsync();

        var request = new CreateGameRequest
        {
            Title = "Test Game",
            Description = "Desc",
            IsAdminParticipating = true,
            StartsAt = DateTime.UtcNow.AddDays(1)
        };
        
        var result = await _gameService.CreateGame(1, request);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(StatusCodes.Status201Created, result.StatusCode);

        var gameInDb = await _dbContext.Games.FirstAsync();
        var members = await _dbContext.GameMembers.Where(gm => gm.GameId == gameInDb.Id).ToListAsync();

        Assert.Single(members);
        Assert.Equal(1, members[0].UserId);
    }

    [Fact]
    public async Task ChangeStatusGame_AdminChangesToStarted_WithEnoughPlayers_StartsGame()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        var user2 = new User { Id = 2, Name = "User2" };
        var user3 = new User { Id = 3, Name = "User3" };
        _dbContext.Users.AddRange(admin, user2, user3);
        await _dbContext.SaveChangesAsync();

        var game = new Game
        {
            Title = "Game",
            AdminId = 1,
            Code = "ABC123",
            Status = GameStatus.Created,
            IsAdminParticipating = true
        };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.AddRange(
            new GameMember { GameId = game.Id, UserId = 1 },
            new GameMember { GameId = game.Id, UserId = 2 },
            new GameMember { GameId = game.Id, UserId = 3 }
        );
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.ChangeStatusGame(game.Id, admin.Id, GameStatus.Created, GameStatus.Started);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(GameStatus.Started, result.Value.Status);

        var assignments = await _dbContext.Assignments.Where(a => a.GameId == game.Id).ToListAsync();
        Assert.Equal(3, assignments.Count);
    }

    [Fact]
    public async Task ChangeStatusGame_TooFewPlayers_ReturnsFailure()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        var user2 = new User { Id = 2, Name = "User2" };
        _dbContext.Users.AddRange(admin, user2);
        await _dbContext.SaveChangesAsync();

        var game = new Game
        {
            Title = "Game",
            AdminId = 1,
            Code = "ABC123",
            Status = GameStatus.Created,
            IsAdminParticipating = true
        };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.AddRange(
            new GameMember { GameId = game.Id, UserId = 1 },
            new GameMember { GameId = game.Id, UserId = 2 }
        );
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.ChangeStatusGame(game.Id, admin.Id, GameStatus.Created, GameStatus.Started);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Too few players to start", result.Error);
        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task UpdateGame_NonAdminUser_ReturnsForbidden()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        var nonAdmin = new User { Id = 2, Name = "Hacker" };
        _dbContext.Users.AddRange(admin, nonAdmin);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Id = 1, Title = "Old", AdminId = 1, Status = GameStatus.Created };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        var request = new UpdateGameRequest { Title = "Hacked!" };
        
        var result = await _gameService.UpdateGame(1, request, userId: 2);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("You don't have access to this game's settings", result.Error);
        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public async Task UpdateGame_AfterGameStarted_ReturnsBadRequest()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        _dbContext.Users.Add(admin);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Id = 1, Title = "Game", AdminId = 1, Status = GameStatus.Started };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        var request = new UpdateGameRequest { Title = "New" };
        
        var result = await _gameService.UpdateGame(1, request, userId: 1);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Game cannot be updated after it has started", result.Error);
        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ExitGame_AdminTriesToExit_ReturnsBadRequest()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        _dbContext.Users.Add(admin);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Title = "Game", Id = 1, AdminId = 1, Status = GameStatus.Created };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.Add(new GameMember { GameId = 1, UserId = 1 });
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.ExitGame(1, 1);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Admin can't exit game", result.Error);
        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task RemoveMember_AdminRemovesParticipant_Success()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        var member = new User { Id = 2, Name = "Member" };
        _dbContext.Users.AddRange(admin, member);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Id = 1, Title = "Game", AdminId = 1, Status = GameStatus.Created };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.AddRange(
            new GameMember { GameId = 1, UserId = 1 },
            new GameMember { GameId = 1, UserId = 2 }
        );
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.RemoveMember(1, memberId: 2, userId: 1);
        
        Assert.True(result.IsSuccess);
        Assert.True(result.Value);

        var remaining = await _dbContext.GameMembers.CountAsync(gm => gm.GameId == 1);
        Assert.Equal(1, remaining);
    }

    [Fact]
    public async Task RemoveMember_NonAdminUser_ReturnsForbidden()
    {
        var admin = new User { Id = 1, Name = "Admin" };
        var hacker = new User { Id = 2, Name = "Hacker" };
        var member = new User { Id = 3, Name = "Victim" };
        _dbContext.Users.AddRange(admin, hacker, member);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Id = 1, Title = "Game", AdminId = 1, Status = GameStatus.Created };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.AddRange(
            new GameMember { GameId = 1, UserId = 1 },
            new GameMember { GameId = 1, UserId = 3 }
        );
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.RemoveMember(1, memberId: 3, userId: 2);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("You don't have access to this game's settings", result.Error);
        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public async Task JoinGame_UserAlreadyInGame_ReturnsConflict()
    {
        var user = new User { Id = 1, Name = "User" };
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var game = new Game { Id = 1, Title = "Game", Code = "JOINME", Status = GameStatus.Created };
        _dbContext.Games.Add(game);
        await _dbContext.SaveChangesAsync();

        _dbContext.GameMembers.Add(new GameMember { GameId = 1, UserId = 1 });
        await _dbContext.SaveChangesAsync();
        
        var result = await _gameService.JoinGame("JOINME", 1, "Wish");
        
        Assert.False(result.IsSuccess);
        Assert.Equal("You are already in game", result.Error);
        Assert.Equal(StatusCodes.Status409Conflict, result.StatusCode);
    }
}