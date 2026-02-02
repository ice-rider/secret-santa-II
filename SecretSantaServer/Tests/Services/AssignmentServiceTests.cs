using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;
using SecretSantaServer.Services;

namespace Tests.Services;

public class AssignmentServiceTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly AssignmentService _assignmentService;

    public AssignmentServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _assignmentService = new AssignmentService(_dbContext);
    }

    [Fact]
    public async Task GetMyWishLetter_UserInGame_ReturnsGameMember()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Created,
            Admin = user
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Letter = "My wish letter",
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();
        
        var result = await _assignmentService.GetMyWishLetter(1, 1);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(gameMember.Letter, result.Value.Letter);
        Assert.Equal(1, result.Value.UserId);
    }

    [Fact]
    public async Task GetMyWishLetter_UserNotInGame_ReturnsFailure()
    {
        var result = await _assignmentService.GetMyWishLetter(1, 999);

        Assert.False(result.IsSuccess);
        Assert.Equal($"User 999 not found in game 1", result.Error);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task GetParticipantWishLetter_AssignmentExists_ReturnsRecipient()
    {
        var user1 = new User { Id = 1, Name = "Santa User" };
        var user2 = new User { Id = 2, Name = "Recipient User" };

        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Started,
            Admin = user1
        };

        var gameMember1 = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            User = user1,
            Game = game
        };

        var gameMember2 = new GameMember
        {
            Id = 2,
            GameId = 1,
            UserId = 2,
            User = user2,
            Game = game
        };

        var assignment = new Assignment
        {
            GameId = 1,
            SantaId = 1,
            RecipientId = 2,
            Santa = gameMember1,
            Recipient = gameMember2
        };

        _dbContext.Users.AddRange(user1, user2);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.AddRange(gameMember1, gameMember2);
        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync();
        
        var result = await _assignmentService.GetParticipantWishLetter(1, 1);
        
        Assert.True(result.IsSuccess, result.Error);
        Assert.NotNull(result.Value);
        Assert.Equal(assignment.Recipient.UserId, result.Value.UserId);
    }

    [Fact]
    public async Task GetParticipantWishLetter_GameDoesNotExist_ReturnsFailure()
    {
        var result = await _assignmentService.GetParticipantWishLetter(999, 1);
        
        Assert.False(result.IsSuccess);
        Assert.Equal($"Game 999 not found", result.Error);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task ChangeWishLetter_ValidRequest_ChangesWish()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Created,
            Admin = user
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Letter = "Old wish",
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();

        const string newWish = "New wish letter";
        
        var result = await _assignmentService.ChangeWishLetter(1, 1, newWish);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(newWish, result.Value.Letter);
    }

    [Fact]
    public async Task ChangeWishLetter_GameStarted_ReturnsFailure()
    {
        var user = new User { Id = 1, Name = "Test User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Started,
            Admin = user
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Letter = "Old wish",
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();

        const string newWish = "New wish letter";
        
        var result = await _assignmentService.ChangeWishLetter(1, 1, newWish);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("You can't change wish after the game has started.", result.Error);
        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task GetParticipantWishLetter_GameNotStarted_ReturnsBadRequest()
    {
        var user = new User { Id = 1, Name = "Santa" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Created
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();
        
        var result = await _assignmentService.GetParticipantWishLetter(1, 1);

        Assert.False(result.IsSuccess);
        Assert.Equal("Game has not started yet", result.Error);
        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task GetParticipantWishLetter_NoAssignment_ReturnsUserNotFound()
    {
        var user = new User { Id = 1, Name = "Santa" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Started
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();
        
        var result = await _assignmentService.GetParticipantWishLetter(1, 1);

        Assert.False(result.IsSuccess);

        Assert.Equal($"User 1 not found in game 1", result.Error);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
    }

    [Fact]
    public async Task GetParticipantWishLetter_AssignmentExists_ReturnsRecipientWithLetter()
    {
        var santaUser = new User { Id = 1, Name = "Santa" };
        var recipientUser = new User { Id = 2, Name = "Recipient" };

        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Started
        };

        var santaMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            User = santaUser,
            Game = game
        };

        var recipientMember = new GameMember
        {
            Id = 2,
            GameId = 1,
            UserId = 2,
            Letter = "I want a pony!",
            User = recipientUser,
            Game = game
        };

        var assignment = new Assignment
        {
            GameId = 1,
            SantaId = 1,
            RecipientId = 2,
            Santa = santaMember,
            Recipient = recipientMember
        };

        _dbContext.Users.AddRange(santaUser, recipientUser);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.AddRange(santaMember, recipientMember);
        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync();

        var result = await _assignmentService.GetParticipantWishLetter(1, 1);
        
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("I want a pony!", result.Value.Letter);
        Assert.Equal(2, result.Value.UserId);
        Assert.Equal("Recipient", result.Value.User.Name);
    }

    [Fact]
    public async Task ChangeWishLetter_GameStarted_ReturnsBadRequest()
    {
        var user = new User { Id = 1, Name = "User" };
        var game = new Game
        {
            Id = 1,
            Title = "Test Game",
            AdminId = 1,
            Status = GameStatus.Started
        };

        var gameMember = new GameMember
        {
            Id = 1,
            GameId = 1,
            UserId = 1,
            Letter = "Old wish",
            User = user,
            Game = game
        };

        _dbContext.Users.Add(user);
        _dbContext.Games.Add(game);
        _dbContext.GameMembers.Add(gameMember);
        await _dbContext.SaveChangesAsync();

        var result = await _assignmentService.ChangeWishLetter(1, 1, "New wish");
        
        Assert.False(result.IsSuccess);
        Assert.Equal("You can't change wish after the game has started.", result.Error);
        Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task GetMyWishLetter_UserNotInGame_ReturnsNotFound()
    {
        var result = await _assignmentService.GetMyWishLetter(1, 999);
        Assert.False(result.IsSuccess);
        Assert.Equal("User 999 not found in game 1", result.Error);
        Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
    }

    public void Dispose()
    {
        _dbContext?.Dispose();
    }
}