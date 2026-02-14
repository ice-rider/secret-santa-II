namespace SecretSantaServer.DTOs;

public class EventDto<T>
{
    public string EventType { get; set; }
    public T Message { get; set; }
    private int? PlayerId { get; set; } = null;
    
    public EventDto(string eventType, T message, int? playerId = null)
    {
        EventType = eventType;
        Message = message;
        PlayerId = playerId;
    }
}