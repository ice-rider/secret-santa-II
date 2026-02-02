using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;
using SecretSantaServer.Providers;
using SecretSantaServer.Utils;

namespace SecretSantaServer.Services;

public class OAuthService : IOAuthService
{
    private readonly IDbContext _dbContext;
    private readonly IAccessTokenGenerator _accessTokenGenerator;
    private readonly ICacheRepository _cacheRepository;
    private readonly Dictionary<OAuthProvider, IOAuthClient> _oAuthClients;

    public OAuthService(IDbContext dbContext, IAccessTokenGenerator accessTokenGenerator,
        IEnumerable<IOAuthClient> oAuthClients, ICacheRepository cacheRepository)
    {
        _dbContext = dbContext;
        _accessTokenGenerator = accessTokenGenerator;
        _oAuthClients = oAuthClients.ToDictionary(x => x.Provider);
        _cacheRepository = cacheRepository;
    }

    public async Task<Result<UserAndTokensDto>> OAuthLogin(string code, string state, OAuthProvider provider,
        string redirectUri)
    {
        var client = _oAuthClients[provider];
        var userInfo = await client.GetUserInfoAsync(code, redirectUri);
        if (userInfo.ProviderId == null)
            return Result<UserAndTokensDto>.Failure("Provider Id Is Missing", StatusCodes.Status401Unauthorized);

        var userByProviderId = await _dbContext.Users.AsNoTracking()
            .Include(x => x.Credential)
            .FirstOrDefaultAsync(x =>
                provider == OAuthProvider.Google && x.Credential!.GoogleId == userInfo.ProviderId ||
                provider == OAuthProvider.Github && x.Credential!.GithubId == userInfo.ProviderId);

        if (userByProviderId != null)
            return await GetSuccessResult(userByProviderId);

        var (user, isNewUser) = await GetUserByEmail(provider, userInfo);
        return await GetSuccessResult(user, isNewUser);
    }

    private async Task<(User user, bool isNewUser)> GetUserByEmail(OAuthProvider provider, OAuthUserInfo userInfo)
    {
        var userByEmail = (User?)null;
        if (!string.IsNullOrEmpty(userInfo.Email))
        {
            userByEmail = await _dbContext.Users.Include(x => x.Credential)
                .FirstOrDefaultAsync(x => x.Credential.Email == userInfo.Email);
        }

        User user;
        var isNewUser = false;
        if (userByEmail != null)
        {
            if (OAuthProvider.Google == provider)
                userByEmail.Credential!.GoogleId = userInfo.ProviderId;
            else if (OAuthProvider.Github == provider)
                userByEmail.Credential!.GithubId = userInfo.ProviderId;
            _dbContext.Users.Update(userByEmail);
            await _dbContext.SaveChangesAsync();
            user = userByEmail;
        }
        else
        {
            user = await CreateUserByOAuth(provider, userInfo);
            isNewUser = true;
        }

        return (user, isNewUser);
    }

    private async Task<Result<UserAndTokensDto>> GetSuccessResult(User userByProviderId, bool isNewUser = false)
    {
        var refreshTokenByProvider = await CreateRefreshToken(userByProviderId!.Id);
        var accessTokenByProvider = _accessTokenGenerator.GenerateJwtToken(userByProviderId.Id.ToString(), Role.User);

        return Result<UserAndTokensDto>.Success(new UserAndTokensDto(new UserProfileDto(userByProviderId),
            refreshTokenByProvider.Token,
            accessTokenByProvider, isNewUser));
    }

    private async Task<User> CreateUserByOAuth(OAuthProvider provider, OAuthUserInfo userInfo)
    {
        var newUser = new User()
        {
            Name = userInfo.Name ?? "User",
            Credential = new UserCredentials()
            {
                Email = userInfo.Email,
            }
        };
        if (provider == OAuthProvider.Google)
            newUser.Credential.GoogleId = userInfo.ProviderId;
        else if (provider == OAuthProvider.Github)
            newUser.Credential.GithubId = userInfo.ProviderId;

        _dbContext.Users.Add(newUser);
        await _dbContext.SaveChangesAsync();
        return newUser;
    }

    private async Task<RefreshToken> CreateRefreshToken(int userId)
    {
        var refreshToken = new RefreshToken(userId, RefreshTokenGenerator.GenerateToken());
        await _cacheRepository.SetAsync(userId, refreshToken, TimeSpan.FromDays(30));
        return refreshToken;
    }
}