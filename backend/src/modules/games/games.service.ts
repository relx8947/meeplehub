import { Injectable, NotFoundException } from '@nestjs/common';
import { Game } from './game.entity';
import { PLAYABLE_GAMES } from './game-catalog';

@Injectable()
export class GamesService {
  private readonly games = PLAYABLE_GAMES.map((game) => ({ ...game }));

  async findAll(): Promise<Game[]> {
    return this.games
      .filter((game) => game.isPlayable)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((game) => ({ ...game }));
  }

  async findById(id: string): Promise<Game> {
    const game = this.games.find((item) => item.id === id || item.slug === id);
    if (!game) {
      throw new NotFoundException('游戏不存在');
    }
    return { ...game };
  }

  async findBySlug(slug: string): Promise<Game | null> {
    const game = this.games.find((item) => item.slug === slug);
    return game ? { ...game } : null;
  }
}
