namespace SecretSantaServer.Data;

public interface ICacheRepository
{
    Task<T?> GetAsync<T>(string id);
    Task SetAsync<T>(string id, T value, TimeSpan expiration);
    Task RemoveAsync<T>(string id);
}