import { Board } from './engines/types';

export enum RoomStatus {
  WAITING = 'waiting', // 等待对手加入
  PLAYING = 'playing', // 对局进行中
  FINISHED = 'finished', // 已结束
}

export enum RoomMode {
  PVP = 'pvp', // 在线双人
  AI = 'ai', // 人机对战
}

/** A seated player inside a room. Stored as JSONB so we are not limited to 2 players. */
export interface RoomPlayer {
  seat: number; // 0-based seat index
  userId: string | null; // null for AI
  nickname: string;
  isAI: boolean;
}

export interface Room {
  id: string;
  gameSlug: string; // 'gomoku' | 'reversi'
  title: string;
  mode: RoomMode;
  status: RoomStatus;
  maxPlayers: number;
  players: RoomPlayer[];
  boardState: Board;
  currentTurnSeat: number;
  winnerSeat: number | null;
  isDraw: boolean;
  boardSize: number;
  hostUserId: string;
  createdAt: string;
  updatedAt: string;
}
