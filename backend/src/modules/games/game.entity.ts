/**
 * A playable game in the in-memory catalog (e.g. Gomoku, Reversi).
 * `slug` maps to a game engine in modules/rooms/engines.
 */
export interface Game {
  id: string;
  slug: string; // 'gomoku' | 'reversi'
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string; // 玩法介绍
  coverImage?: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  difficulty?: string; // 'beginner' | 'intermediate' | 'advanced'
  categories?: string[];
  boardSize: number;
  isPlayable: boolean;
  supportsAI: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}
