export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Game-related types
export interface Participant {
  id: string;
  name: string;
  email: string;
  isCreator?: boolean;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  participantLimit: number;
  participantCount: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  isParticipant: boolean;
  isCreator: boolean;
  participants?: Participant[];
}

export interface CreateGameRequest {
  name: string;
  description?: string;
  participantLimit: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateGameRequest {
  name?: string;
  description?: string;
  participantLimit?: number;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface GameFilter {
  type?: 'created' | 'participating' | 'all';
}