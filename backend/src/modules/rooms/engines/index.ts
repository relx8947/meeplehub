import { GameEngine } from './types';
import { gomokuEngine } from './gomoku';
import { reversiEngine } from './reversi';

const ENGINES: Record<string, GameEngine> = {
  [gomokuEngine.slug]: gomokuEngine,
  [reversiEngine.slug]: reversiEngine,
};

export function getEngine(slug: string): GameEngine {
  const engine = ENGINES[slug];
  if (!engine) {
    throw new Error(`Unknown game slug: ${slug}`);
  }
  return engine;
}

export function isValidGameSlug(slug: string): boolean {
  return slug in ENGINES;
}

export const PLAYABLE_SLUGS = Object.keys(ENGINES);

export * from './types';
