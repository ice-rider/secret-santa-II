using Microsoft.EntityFrameworkCore;
using Moq;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;
using SecretSantaServer.Services;
using SecretSantaServer.Utils;

namespace Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<ICacheRepository> _mockCacheRepository;
    private readonly Mock<IAccessTokenGenerator> _mockAccessTokenGenerator;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _mockCacheRepository = new Mock<ICacheRepository>();
        _mockAccessTokenGenerator = new Mock<IAccessTokenGenerator>();

        _authService = new AuthService(_dbContext, _mockCacheRepository.Object, _mockAccessTokenGenerator.Object);
    }

    [Fact]
    public async Task Register_ValidRequest_CreatesUser()
    {
        var request = new EmailRegisterRequest
        {
            Name = "Test User",
            Email = "test@example.com",
            Password = "password123"
        };

        _mockAccessTokenGenerator.Setup(x => x.GenerateJwtToken(It.IsAny<string>(), Role.User))
            .Returns("fake_jwt_token");

        _mockCacheRepository
            .Setup(repo => repo.SetAsync(It.IsAny<string>(), It.IsAny<UserTokenInfo>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);
        
        var result = await _authService.Register(request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.NotNull(result.Value.User);
        Assert.NotNull(result.Value.User.AccessToken);
        Assert.NotNull(result.Value.RefreshToken);
    }

    [Fact]
    public async Task Register_EmailAlreadyUsed_ReturnsFailure()
    {
        var existingUser = new User
        {
            Id = 1,
            Name = "Existing User",
            Credential = new UserCredentials
            {
                UserId = 1,
                Email = "existing@example.com",
                PasswordHash = "hashed_password"
            }
        };

        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var request = new EmailRegisterRequest
        {
            Name = "Test User",
            Email = "existing@example.com",
            Password = "password123"
        };
        
        var result = await _authService.Register(request);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Email already used", result.Error);
        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsTokens()
    {
        var user = new User
        {
            Id = 1,
            Name = "Test User",
            Credential = new UserCredentials
            {
                UserId = 1,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123")
            }
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var request = new EmailLoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        _mockAccessTokenGenerator.Setup(x => x.GenerateJwtToken(It.IsAny<string>(), Role.User))
            .Returns("fake_jwt_token");

        _mockCacheRepository
            .Setup(repo => repo.SetAsync(It.IsAny<string>(), It.IsAny<UserTokenInfo>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);
        
        var result = await _authService.Login(request);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.NotNull(result.Value.User);
        Assert.NotNull(result.Value.User.AccessToken);
        Assert.NotNull(result.Value.RefreshToken);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsFailure()
    {
        var user = new User
        {
            Id = 1,
            Name = "Test User",
            Credential = new UserCredentials
            {
                UserId = 1,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword")
            }
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        var request = new EmailLoginRequest
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        var result = await _authService.Login(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("Wrong Email Or Password", result.Error);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task Logout_ValidToken_RemovesTokenFromCache()
    {
        var userId = 1;
        var refreshToken = "valid_refresh_token";
        
        _mockCacheRepository.Setup(repo => repo.GetAsync<UserTokenInfo>(refreshToken))
            .ReturnsAsync(new UserTokenInfo(userId));

        _mockCacheRepository.Setup(repo => repo.RemoveAsync<UserTokenInfo>(refreshToken))
            .Returns(Task.CompletedTask);
        
        var result = await _authService.Logout(refreshToken);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
    }

    [Fact]
    public async Task Logout_InvalidToken_ReturnsFailure()
    {
        var userId = 1;
        var refreshToken = "invalid_refresh_token";

        _mockCacheRepository.Setup(repo => repo.GetAsync<UserTokenInfo>(refreshToken))
            .ReturnsAsync((UserTokenInfo)null);
        
        var result = await _authService.Logout(refreshToken);
        
        Assert.False(result.IsSuccess);
        Assert.Equal("Refresh Token Not Found", result.Error);
        Assert.Equal(401, result.StatusCode);
    }

    public void Dispose()
    {
        _dbContext?.Dispose();
    }
}