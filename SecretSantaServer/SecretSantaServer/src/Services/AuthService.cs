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
    private readonly IAccessTokenGenerator _accessTokenAccessTokenGenerator;

    public AuthService(IDbContext context, IAccessTokenGenerator accessTokenGenerator)
    {
        _dbContext = context;
        _accessTokenAccessTokenGenerator = accessTokenGenerator;
    }

    public async Task<Result<UserAndTokensDto>> Register(EmailRegisterRequest request)
    {
        using var transaction = await _dbContext.BeginTransactionAsync();
        try
        {
            if (await _dbContext.Users.AnyAsync(u => u.Credential.Email == request.Email))
                return Result<UserAndTokensDto>.Failure("Email already used", StatusCodes.Status409Conflict);
            var createdUser = await CreateUser(request);

            var refreshToken = await CreateRefreshToken(createdUser.Id);
            var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(createdUser.Id.ToString(), Role.User);

            var result = new UserAndTokensDto(new UserProfileDto(createdUser), refreshToken.Token, accessToken);
            await _dbContext.CommitTransactionAsync(transaction);

            return Result<UserAndTokensDto>.Success(result);
        }
        catch (Exception e)
        {
            await _dbContext.RollbackTransactionAsync(transaction);
            return Result<UserAndTokensDto>.Failure(e.Message,StatusCodes.Status500InternalServerError);
        }
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
        await _dbContext.SaveChangesAsync();

        return Result<UserAndTokensDto>.Success(result);
    }

    public async Task<Result<bool>> Logout(string refreshToken)
    {
        var foundedToken = await _dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
        if (foundedToken == null)
            return Result<bool>.Failure("Refresh Token Not Found", StatusCodes.Status401Unauthorized);

        _dbContext.RefreshTokens.Remove(foundedToken);
        await _dbContext.SaveChangesAsync();
        
        return Result<bool>.Success(true);
    }

    public async Task<Result<UserAndTokensDto>> Refresh(string oldRefreshToken)
    {
        var foundedToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == oldRefreshToken);
        if (foundedToken == null || foundedToken.ExpiresAt < DateTime.UtcNow)
            return Result<UserAndTokensDto>.Failure("Invalid Refresh Token", StatusCodes.Status401Unauthorized);

        var refreshToken = await CreateRefreshToken(foundedToken.UserId);
        var accessToken = _accessTokenAccessTokenGenerator.GenerateJwtToken(foundedToken.UserId.ToString(), Role.User);
        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == foundedToken.UserId);

        var result = new UserAndTokensDto(new UserProfileDto(user!), refreshToken.Token, accessToken);
        await _dbContext.RefreshTokens.Where(r=>r.Token==oldRefreshToken).ExecuteDeleteAsync();

        return Result<UserAndTokensDto>.Success(result);
    }

    private async Task<RefreshToken> CreateRefreshToken(int userId)
    {
        var refreshToken = RefreshTokenGenerator.GetRefreshToken(userId);
        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();
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