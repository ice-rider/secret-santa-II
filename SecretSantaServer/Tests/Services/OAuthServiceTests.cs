using Microsoft.EntityFrameworkCore;
using Moq;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;
using SecretSantaServer.Providers;
using SecretSantaServer.Services;
using SecretSantaServer.Utils;

namespace Tests.Services;

public class OAuthServiceTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<IAccessTokenGenerator> _mockAccessTokenGenerator;
    private readonly Mock<ICacheRepository> _mockCacheRepository;
    private readonly Mock<IOAuthClient> _mockGoogleOAuthClient;
    private readonly Mock<IOAuthClient> _mockGithubOAuthClient;
    private readonly OAuthService _oAuthService;

    private const string Code = "valid_code";
    private const string State = "state";
    private const string RedirectUri = "https://example.com/callback";

    public OAuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _mockAccessTokenGenerator = new Mock<IAccessTokenGenerator>();
        _mockCacheRepository = new Mock<ICacheRepository>();
        _mockGoogleOAuthClient = new Mock<IOAuthClient>();
        _mockGithubOAuthClient = new Mock<IOAuthClient>();
        _mockGoogleOAuthClient.Setup(client => client.Provider).Returns(OAuthProvider.Google);
        _mockGithubOAuthClient.Setup(client => client.Provider).Returns(OAuthProvider.Github);

        _oAuthService = new OAuthService(
            _dbContext,
            _mockAccessTokenGenerator.Object,
            new List<IOAuthClient>() { _mockGoogleOAuthClient.Object, _mockGithubOAuthClient.Object },
            _mockCacheRepository.Object);
    }

    [Fact]
    public async Task OAuthLogin_GoogleValidCode_CreatesOrReturnsUser()
    {
        var userInfo = new OAuthUserInfo(OAuthProvider.Google, "google_id_123", "user@example.com", "Test User");

        _mockGoogleOAuthClient.Setup(client => client.GetUserInfoAsync(Code, RedirectUri))
            .ReturnsAsync(userInfo);

        _mockAccessTokenGenerator.Setup(x => x.GenerateJwtToken(It.IsAny<string>(), Role.User))
            .Returns("fake_jwt_token");

        _mockCacheRepository
            .Setup(repo => repo.SetAsync(It.IsAny<string>(), It.IsAny<UserTokenInfo>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);

        var result = await _oAuthService.OAuthLogin(Code, State, OAuthProvider.Google, RedirectUri);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value.refreshToken);
    }

    [Fact]
    public async Task OAuthLogin_GithubValidCode_CreatesOrReturnsUser()
    {
        var userInfo = new OAuthUserInfo(OAuthProvider.Github, "github_id_123", "user@example.com", "Test User");

        _mockGithubOAuthClient.Setup(client => client.GetUserInfoAsync(Code, RedirectUri))
            .ReturnsAsync(userInfo);

        _mockAccessTokenGenerator.Setup(x => x.GenerateJwtToken(It.IsAny<string>(), Role.User))
            .Returns("fake_jwt_token");

        _mockCacheRepository
            .Setup(repo => repo.SetAsync(It.IsAny<string>(), It.IsAny<UserTokenInfo>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);

        var result = await _oAuthService.OAuthLogin(Code, State, OAuthProvider.Github, RedirectUri);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value.refreshToken);
    }

    [Fact]
    public async Task OAuthLogin_ProviderIdMissing_ReturnsFailure()
    {
        var userInfo = new OAuthUserInfo(OAuthProvider.Google, null, "user@example.com", "Test User");

        _mockGoogleOAuthClient.Setup(client => client.GetUserInfoAsync(Code, RedirectUri))
            .ReturnsAsync(userInfo);

        var result = await _oAuthService.OAuthLogin(Code, State, OAuthProvider.Google, RedirectUri);

        Assert.False(result.IsSuccess);
        Assert.Equal("Provider Id Is Missing", result.Error);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task OAuthLogin_ExistingUserByProviderId_ReturnsExistingUser()
    {
        var userInfo = new OAuthUserInfo(OAuthProvider.Google, "google_id_123", "user@example.com", "Test User");

        _mockGoogleOAuthClient.Setup(client => client.GetUserInfoAsync(Code, RedirectUri))
            .ReturnsAsync(userInfo);

        var existingUser = new User
        {
            Id = 1,
            Name = "Existing User",
            Credential = new UserCredentials
            {
                UserId = 1,
                Email = "user@example.com",
                GoogleId = "google_id_123"
            }
        };

        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        _mockAccessTokenGenerator.Setup(x => x.GenerateJwtToken(It.IsAny<string>(), Role.User))
            .Returns("fake_jwt_token");

        _mockCacheRepository
            .Setup(repo => repo.SetAsync(It.IsAny<string>(), It.IsAny<UserTokenInfo>(), It.IsAny<TimeSpan>()))
            .Returns(Task.CompletedTask);

        var result = await _oAuthService.OAuthLogin(Code, State, OAuthProvider.Google, RedirectUri);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value.refreshToken);
    }

    public void Dispose()
    {
        _dbContext?.Dispose();
    }
}