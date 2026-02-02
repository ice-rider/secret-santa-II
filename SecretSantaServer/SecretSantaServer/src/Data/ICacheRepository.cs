namespace SecretSantaServer.Data;

public interface ICacheRepository
{
    Task<T?> GetAsync<T>(int id);
    Task SetAsync<T>(int id, T value, TimeSpan expiration);
    Task RemoveAsync<T>(int id);
}