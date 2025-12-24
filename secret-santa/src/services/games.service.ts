import axios from 'axios';
import { API_BASE_URL } from './api';
import type { CreateGameRequest, Game, GameFilter, UpdateGameRequest } from '../types';

class GamesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/games`;
  }

  async getGames(filter?: GameFilter): Promise<Game[]> {
    const params = new URLSearchParams();
    
    if (filter?.type) {
      params.append('type', filter.type);
    }

    const response = await axios.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getGameById(id: string): Promise<Game> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createGame(gameData: CreateGameRequest): Promise<Game> {
    const response = await axios.post(this.baseUrl, gameData);
    return response.data;
  }

  async updateGame(id: string, gameData: Partial<CreateGameRequest> | Partial<UpdateGameRequest>): Promise<Game> {
    const response = await axios.put(`${this.baseUrl}/${id}`, gameData);
    return response.data;
  }

  async deleteGame(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async joinGame(gameId: string): Promise<Game> {
    const response = await axios.post(`${this.baseUrl}/${gameId}/join`);
    return response.data;
  }

  async leaveGame(gameId: string): Promise<Game> {
    const response = await axios.post(`${this.baseUrl}/${gameId}/leave`);
    return response.data;
  }
}

export default new GamesService();