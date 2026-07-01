import { PlayerIdentity } from '@/types';

export const PLAYER_STORAGE_KEY = 'meeplehub-player';

export function getStoredPlayer(): PlayerIdentity | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(PLAYER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const player = JSON.parse(raw) as PlayerIdentity;
    if (player.id && player.nickname) return player;
  } catch {
    sessionStorage.removeItem(PLAYER_STORAGE_KEY);
  }

  return null;
}

export function getOrCreatePlayer(): PlayerIdentity {
  const existing = getStoredPlayer();
  if (existing) return existing;

  const player = createRandomPlayer();
  savePlayer(player);
  return player;
}

export function resetPlayer(): PlayerIdentity {
  const player = createRandomPlayer();
  savePlayer(player);
  return player;
}

export function renamePlayer(nickname: string): PlayerIdentity {
  const current = getOrCreatePlayer();
  const player = {
    ...current,
    nickname: normalizeNickname(nickname) || current.nickname,
  };
  savePlayer(player);
  return player;
}

export function savePlayer(player: PlayerIdentity): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
}

function createRandomPlayer(): PlayerIdentity {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `anon-${Math.random().toString(36).slice(2, 12)}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return {
    id,
    nickname: `玩家${suffix}`,
  };
}

function normalizeNickname(nickname: string): string {
  return nickname.trim().slice(0, 20);
}
