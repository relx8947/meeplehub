import { create } from 'zustand';
import { PlayerIdentity } from '@/types';
import { api } from '@/lib/api';
import { getOrCreatePlayer, getStoredPlayer, renamePlayer, resetPlayer } from '@/lib/playerIdentity';

interface PlayerState {
  player: PlayerIdentity | null;
  loadFromStorage: () => void;
  resetIdentity: () => Promise<void>;
  renameIdentity: (nickname: string) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    set({ player: getOrCreatePlayer() });
  },

  resetIdentity: async () => {
    if (typeof window === 'undefined') return;
    if (getStoredPlayer()) {
      try {
        await api.post('/rooms/players/me/release');
      } catch {
        // The identity is still local-only, so users must be able to switch even if cleanup fails.
      }
    }
    set({ player: resetPlayer() });
  },

  renameIdentity: (nickname: string) => {
    if (typeof window === 'undefined') return;
    set({ player: renamePlayer(nickname) });
  },
}));
