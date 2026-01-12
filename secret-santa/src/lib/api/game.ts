// frontend/src/lib/api/game.ts
import { ApiClient } from './client';
import type { ApiResponse } from './client';

export enum GameStatus {
  Created = 0,
  Started = 1,
  Cancelled = 2,
  Finished = 3,
}

export interface UserProfile {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface GameDto {
  id: number;
  title: string;
  description?: string;
  code: string;
  adminId: number;
  members?: UserProfile[]; // Может быть undefined или null
  isAdminParticipating: boolean;
  status: GameStatus;
  startsAt?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface CreateGameRequest {
  title: string;
  description?: string;
  isAdminParticipating: boolean;
  startsAt?: string;
}

export interface UpdateGameRequest {
  title: string;
  description?: string;
  isAdminParticipating: boolean;
  startsAt?: string;
}

export interface GameMemberDto {
  id: number;
  gameId: number;
  userId: number;
  user: UserProfile;
  letter?: string;
}

export class GameService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createGame(request: CreateGameRequest): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post('/games', request);
  }

  async getGameById(id: number): Promise<ApiResponse<GameDto>> {
    return this.apiClient.get(`/games/${id}`);
  }

  async updateGame(gameId: number, request: UpdateGameRequest): Promise<ApiResponse<GameDto>> {
    return this.apiClient.put(`/games/${gameId}`, request);
  }

  async startGame(gameId: number): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post(`/games/${gameId}/start`);
  }

  async cancelGame(gameId: number): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post(`/games/${gameId}/cancel`);
  }

  async finishGame(gameId: number): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post(`/games/${gameId}/finish`);
  }

  async joinGame(gameCode: string, wishLetter?: string): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post(`/games/${gameCode}/join`, wishLetter ? { letter: wishLetter } : undefined);
  }

  async exitGame(gameId: number): Promise<ApiResponse<GameDto>> {
    return this.apiClient.post(`/games/${gameId}/exit`);
  }

  async removeMember(gameId: number, memberId: number): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete(`/games/${gameId}/members/${memberId}`);
  }

  async getUserGames(): Promise<ApiResponse<GameDto[]>> {
    return this.apiClient.get('/users/me/games');
  }

  async getMyWishLetter(gameId: number): Promise<ApiResponse<GameMemberDto>> {
    return this.apiClient.get(`/games/${gameId}/my-wish`);
  }

  async getParticipantWishLetter(gameId: number): Promise<ApiResponse<GameMemberDto>> {
    return this.apiClient.get(`/games/${gameId}/participant/wish`);
  }

  async changeWishLetter(gameId: number, letter: string): Promise<ApiResponse<GameMemberDto>> {
    return this.apiClient.put(`/games/${gameId}/members/me`, { letter });
  }
}