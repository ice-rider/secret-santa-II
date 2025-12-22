namespace SecretSantaServer.DTOs;

public class EventDto<T>
{
    public string EventType { get; set; }
    T Message { get; set; }
    private int? PlayerId { get; set; } = null;
    
    public EventDto(string eventType, T gameId, int? playerId = null)
    {
        EventType = eventType;
        Message = gameId;
        PlayerId = playerId;
    }
}