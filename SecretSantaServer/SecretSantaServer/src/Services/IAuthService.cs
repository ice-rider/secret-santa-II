using Microsoft.AspNetCore.Identity.Data;
using SecretSantaServer.DTOs;

namespace SecretSantaServer.Services;

public interface IAuthService
{
    Task<Result<UserAndTokensDto>> Register(EmailRegisterRequest request);
    Task<Result<UserAndTokensDto>> Login(EmailLoginRequest request);
    Task<Result<bool>> Logout(int userId, string refreshToken);
    Task<Result<UserAndTokensDto>> Refresh(int userId, string oldRefreshToken);
}