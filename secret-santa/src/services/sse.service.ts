import { API_BASE_URL } from './api';

// Define event types
export type SseEventType = 
  | 'participant-joined'
  | 'participant-left'
  | 'game-started'
  | 'game-revealed'
  | 'game-updated'
  | 'error';

export interface SseEvent {
  type: SseEventType;
  data: any;
  gameId?: string;
  timestamp: string;
}

// Define callback type for event handling
export type SseEventHandler = (event: SseEvent) => void;

class SseService {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<SseEventType, Set<SseEventHandler>> = new Map();
  private reconnectInterval: number = 5000; // 5 seconds
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/events`;
  }

  /**
   * Connect to SSE endpoint
   */
  connect(gameId: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = `${this.baseUrl}?gameId=${gameId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log(`SSE connection opened for game: ${gameId}`);
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    this.eventSource.onmessage = (event) => {
      try {
        const sseEvent: SseEvent = JSON.parse(event.data);
        this.handleEvent(sseEvent);
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.isConnected = false;
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.connect(gameId);
        }, this.reconnectInterval);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('SSE connection closed');
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: SseEventType, handler: SseEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)?.add(handler);
  }

  /**
   * Unsubscribe from specific event type
   */
  unsubscribe(eventType: SseEventType, handler: SseEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Handle incoming SSE event
   */
  private handleEvent(event: SseEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default new SseService();