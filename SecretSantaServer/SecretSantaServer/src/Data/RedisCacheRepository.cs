using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using SecretSantaServer.DTOs;
using SecretSantaServer.Models;

namespace SecretSantaServer.Data;

public class RedisCacheRepository : ICacheRepository
{
    private readonly IDistributedCache _cache;

    private readonly IReadOnlyDictionary<Type, string> prefixes = new Dictionary<Type, string>()
    {
        { typeof(GameDto), "Game" },
        { typeof(UserTokenInfo), "RefreshToken" },
    };

    public RedisCacheRepository(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string id)
    {
        var value = await _cache.GetStringAsync(GetKey(typeof(T), id));
        Console.WriteLine("GetAsync: " + value);
        return value == null ? default : JsonSerializer.Deserialize<T>(value);
    }

    public async Task SetAsync<T>(string id, T value, TimeSpan expiration)
    {
        var json = JsonSerializer.Serialize(value);
        var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(expiration);
        Console.WriteLine($"SetAsync: {json}");
        await _cache.SetStringAsync(GetKey(typeof(T), id), json, options);
    }

    public async Task RemoveAsync<T>(string id)
    {
        await _cache.RemoveAsync(GetKey(typeof(T), id));
        Console.WriteLine("RemoveAsync: " + id);
    }

    private string GetKey(Type type, string id)
    {
        return $"{prefixes[type]}_{id}";
    }
}