// frontend/src/services/SignalRService.ts
import * as signalR from '@microsoft/signalr';

export interface GameStatusEvent {
  eventType: string;
  message: number;
}

export interface UserEvent {
  eventType: string;
  message: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
}

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private hubUrl: string;

  constructor(hubUrl: string) {
    this.hubUrl = hubUrl;
  }

  async connect(accessToken?: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // If no access token is provided, try to get it from localStorage
    const token = accessToken || localStorage.getItem('accessToken');

    // Configure options with Authorization header
    const options: signalR.IHttpConnectionOptions = {
      withCredentials: true,
    };

    // If we have an access token, add it to the headers
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Create the HubConnection
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, options)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Add an interceptor to include the token with every request if needed
    if (token) {
      this.connection.onreconnecting(() => {
        // On reconnection, ensure the token is still available
        const newToken = localStorage.getItem('accessToken');
        if (newToken) {
          // Update headers if possible
          console.log('Reconnecting SignalR with updated token');
        }
      });
    }

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  async joinGame(gameId: number): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('JoinGame', gameId);
      console.log(`Joined game ${gameId}`);
    } catch (err) {
      console.error('Error joining game: ', err);
      throw err;
    }
  }

  onGameStatusUpdate(callback: (event: GameStatusEvent) => void): void {
    if (!this.connection) return;
    this.connection.on('GameStatus', callback);
  }

  onUserJoin(callback: (event: UserEvent) => void): void {
    if (!this.connection) return;
    this.connection.on('UserJoin', callback);
  }

  onUserExit(callback: (event: UserEvent) => void): void {
    if (!this.connection) return;
    this.connection.on('UserExit', callback);
  }

  offGameStatusUpdate(callback: (event: GameStatusEvent) => void): void {
    if (!this.connection) return;
    this.connection.off('GameStatus', callback);
  }

  offUserJoin(callback: (event: UserEvent) => void): void {
    if (!this.connection) return;
    this.connection.off('UserJoin', callback);
  }

  offUserExit(callback: (event: UserEvent) => void): void {
    if (!this.connection) return;
    this.connection.off('UserExit', callback);
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}