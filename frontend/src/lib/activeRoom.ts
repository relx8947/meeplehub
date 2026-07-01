import { Room } from '@/types';

export const ACTIVE_ROOM_STORAGE_KEY = 'meeplehub-active-room';

interface StoredActiveRoom {
  id: string;
  title: string;
  gameSlug: string;
}

export function getActiveRoom(): StoredActiveRoom | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
  if (!raw) return null;

  try {
    const room = JSON.parse(raw) as StoredActiveRoom;
    if (room.id && room.title && room.gameSlug) return room;
  } catch {
    sessionStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  }

  return null;
}

export function rememberActiveRoom(room: Room): void {
  if (typeof window === 'undefined' || room.status === 'finished') return;

  sessionStorage.setItem(
    ACTIVE_ROOM_STORAGE_KEY,
    JSON.stringify({
      id: room.id,
      title: room.title,
      gameSlug: room.gameSlug,
    }),
  );
}

export function clearActiveRoom(roomId?: string): void {
  if (typeof window === 'undefined') return;

  const activeRoom = getActiveRoom();
  if (!roomId || activeRoom?.id === roomId) {
    sessionStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  }
}
