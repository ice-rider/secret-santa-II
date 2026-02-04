using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Data;
using SecretSantaServer.DTOs;
using SecretSantaServer.Enums;
using SecretSantaServer.Models;
using SecretSantaServer.Utils;

namespace SecretSantaServer.Services;

public class AuthService : IAuthService
{
    private readonly IDbContext _dbContext;
    private readonly ICacheRepository _cacheRepository;
    private readonly IAccessTokenGenerator _accessTokenAccessTokenGenerator;

    public AuthService(IDbContext context, ICacheRepository cacheRepository ,IAccessTokenGenerator accessTokenGenerator)
    {
        _dbContext = context;
        _cacheRepository = cacheRepository;
        _accessTokenAccessTokenGenerator = accessTokenGenerator;
    }

    public async Task<Result<UserAuthInfoDto>> Register(EmailRegisterRequest request)
    {
        if (await _dbContext.Users.AnyAsync(u => u.Credential.Email == request.Email))
            return Result<UserAuthInfoDto>.Failure("Email already used", StatusCodes.Status409Conflict);
        var createdUser = await CreateUser(request);

        var refreshToken = await CreateRefreshToken(createdUser.Id);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(createdUser.Id.ToString(), Role.User);

        var result = new UserAndAccessTokenDto(new UserProfileDto(createdUser), accessToken);
        return Result<UserAuthInfoDto>.Success(new UserAuthInfoDto(result,refreshToken));
    }

    public async Task<Result<UserAuthInfoDto>> Login(EmailLoginRequest request)
    {
        var foundedUser = await _dbContext.Users
            .AsNoTracking()
            .Include(x=>x.Credential)
            .FirstOrDefaultAsync(u => u.Credential.Email == request.Email);
        if (foundedUser == null || !BCrypt.Net.BCrypt.Verify(request.Password, foundedUser.Credential.PasswordHash))
            return Result<UserAuthInfoDto>.Failure($"Wrong Email Or Password", StatusCodes.Status401Unauthorized);

        var refreshToken = await CreateRefreshToken(foundedUser.Id);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(foundedUser.Id.ToString(), Role.User);
        var result = new UserAndAccessTokenDto(new UserProfileDto(foundedUser), accessToken);

        return Result<UserAuthInfoDto>.Success(new UserAuthInfoDto(result,refreshToken));
    }

    public async Task<Result<bool>> Logout(string refreshToken)
    {
        var foundedToken = await _cacheRepository.GetAsync<UserTokenInfo>(refreshToken);
        if (foundedToken == null)
            return Result<bool>.Failure("Refresh Token Not Found", StatusCodes.Status401Unauthorized);

        await _cacheRepository.RemoveAsync<UserTokenInfo>(refreshToken);
        
        return Result<bool>.Success(true);
    }

    public async Task<Result<UserAuthInfoDto>> Refresh(string oldRefreshToken)
    {
        var foundedToken = await _cacheRepository.GetAsync<UserTokenInfo>(oldRefreshToken);
        if (foundedToken == null)
            return Result<UserAuthInfoDto>.Failure("Invalid Refresh Token", StatusCodes.Status401Unauthorized);

        var refreshToken = await CreateRefreshToken(foundedToken.UserId);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(foundedToken.UserId.ToString(), Role.User);
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == foundedToken.UserId);

        var result = new UserAndAccessTokenDto(new UserProfileDto(user!), accessToken);
        await _cacheRepository.RemoveAsync<UserTokenInfo>(oldRefreshToken);

        return Result<UserAuthInfoDto>.Success(new UserAuthInfoDto(result,refreshToken));
    }

    private async Task<string> CreateRefreshToken(int userId)
    {
        var refreshToken = RefreshTokenGenerator.GenerateToken();
        await _cacheRepository.SetAsync(refreshToken, new UserTokenInfo(userId), TimeSpan.FromDays(30));
        return refreshToken;
    }

    private async Task<User> CreateUser(EmailRegisterRequest request)
    {
        var newUser = new User
        {
            Name = request.Name,
            Credential = new(){
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            }
        };

        var createdUser = _dbContext.Users.Add(newUser).Entity;
        await _dbContext.SaveChangesAsync();
        return createdUser;
    }
}