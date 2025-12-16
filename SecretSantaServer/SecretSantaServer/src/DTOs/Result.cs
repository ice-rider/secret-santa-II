namespace SecretSantaServer.DTOs;

public record Result(bool IsSuccess, int StatusCode, string? Error = null);

public record Result<T>(T? Value, bool IsSuccess, int StatusCode, string? Error = null)
{
    public static Result<T> Success(T value, int statusCode = 200)
        => new(value, true, statusCode);

    public static Result<T> Failure(string error, int statusCode)
        => new(default, false, statusCode, error);
}