using Microsoft.AspNetCore.Identity.Data;
using SecretSantaServer.DTOs;

namespace SecretSantaServer.Services;

public interface IAuthService
{
    Task<Result<UserAuthInfoDto>> Register(EmailRegisterRequest request);
    Task<Result<UserAuthInfoDto>> Login(EmailLoginRequest request);
    Task<Result<bool>> Logout(string refreshToken);
    Task<Result<UserAuthInfoDto>> Refresh(string oldRefreshToken);
}