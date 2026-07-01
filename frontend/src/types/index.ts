export interface PlayerIdentity {
  id: string;
  nickname: string;
}

export interface Game {
  id: string;
  slug: string;
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  coverImage?: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  difficulty?: string;
  categories?: string[];
  boardSize: number;
  isPlayable: boolean;
  supportsAI: boolean;
  sortOrder: number;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type RoomMode = 'pvp' | 'ai';

export interface RoomPlayer {
  seat: number;
  userId: string | null;
  nickname: string;
  isAI: boolean;
  connected?: boolean;
  lastSeenAt?: string;
}

export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

export interface Room {
  id: string;
  gameSlug: string;
  title: string;
  mode: RoomMode;
  status: RoomStatus;
  maxPlayers: number;
  players: RoomPlayer[];
  boardState: Board;
  boardSize: number;
  currentTurnSeat: number;
  winnerSeat: number | null;
  isDraw: boolean;
  hostUserId: string;
  createdAt?: string;
  updatedAt?: string;
}
