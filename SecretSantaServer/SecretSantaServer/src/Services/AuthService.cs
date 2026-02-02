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

    public async Task<Result<UserAndTokensDto>> Register(EmailRegisterRequest request)
    {
        if (await _dbContext.Users.AnyAsync(u => u.Credential.Email == request.Email))
            return Result<UserAndTokensDto>.Failure("Email already used", StatusCodes.Status409Conflict);
        var createdUser = await CreateUser(request);

        var refreshToken = await CreateRefreshToken(createdUser.Id);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(createdUser.Id.ToString(), Role.User);

        var result = new UserAndTokensDto(new UserProfileDto(createdUser), refreshToken.Token, accessToken);
        return Result<UserAndTokensDto>.Success(result);
    }

    public async Task<Result<UserAndTokensDto>> Login(EmailLoginRequest request)
    {
        var foundedUser = await _dbContext.Users
            .AsNoTracking()
            .Include(x=>x.Credential)
            .FirstOrDefaultAsync(u => u.Credential.Email == request.Email);
        if (foundedUser == null || !BCrypt.Net.BCrypt.Verify(request.Password, foundedUser.Credential.PasswordHash))
            return Result<UserAndTokensDto>.Failure($"Wrong Email Or Password", StatusCodes.Status401Unauthorized);

        var refreshToken = await CreateRefreshToken(foundedUser.Id);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(foundedUser.Id.ToString(), Role.User);
        var result = new UserAndTokensDto(new UserProfileDto(foundedUser), refreshToken.Token, accessToken);

        return Result<UserAndTokensDto>.Success(result);
    }

    public async Task<Result<bool>> Logout(int userId, string refreshToken)
    {
        var foundedToken = await _cacheRepository.GetAsync<RefreshToken>(userId);
        if (foundedToken == null)
            return Result<bool>.Failure("Refresh Token Not Found", StatusCodes.Status401Unauthorized);

        await _cacheRepository.RemoveAsync<RefreshToken>(userId);
        
        return Result<bool>.Success(true);
    }

    public async Task<Result<UserAndTokensDto>> Refresh(int userId, string oldRefreshToken)
    {
        var foundedToken = await _cacheRepository.GetAsync<RefreshToken>(userId);
        if (foundedToken == null)
            return Result<UserAndTokensDto>.Failure("Invalid Refresh Token", StatusCodes.Status401Unauthorized);

        var refreshToken = await CreateRefreshToken(foundedToken.UserId);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(foundedToken.UserId.ToString(), Role.User);
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == foundedToken.UserId);

        var result = new UserAndTokensDto(new UserProfileDto(user!), refreshToken.Token, accessToken);
        await _cacheRepository.RemoveAsync<RefreshToken>(userId);

        return Result<UserAndTokensDto>.Success(result);
    }

    private async Task<RefreshToken> CreateRefreshToken(int userId)
    {
        var refreshToken = new RefreshToken(userId, RefreshTokenGenerator.GenerateToken());
        await _cacheRepository.SetAsync(userId, refreshToken, TimeSpan.FromDays(30));
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