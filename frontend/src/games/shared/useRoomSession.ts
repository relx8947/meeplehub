'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearActiveRoom, rememberActiveRoom } from '@/lib/activeRoom';
import { useGameSocket } from '@/hooks/useGameSocket';
import { usePlayerStore } from '@/store/player';
import { PlayerIdentity, Room } from '@/types';

export interface RoomSession {
  roomId: string;
  expectedGameSlug?: string;
  room: Room | null;
  player: PlayerIdentity | null;
  error: string;
  joining: boolean;
  leaving: boolean;
  mySeat: number | null;
  isInRoom: boolean;
  isHost: boolean;
  canJoin: boolean;
  canLeave: boolean;
  leaveLabel: string;
  isMyTurn: boolean;
  boardDisabled: boolean;
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  makeMove: (row: number, col: number, pass?: boolean) => void;
  restart: () => void;
}

export function useRoomSession(roomId: string, expectedGameSlug?: string): RoomSession {
  const router = useRouter();
  const { player, loadFromStorage } = usePlayerStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { makeMove, restart } = useGameSocket({
    roomId,
    player,
    onState: (nextRoom) => setRoom(nextRoom),
    onError: (message) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    },
    onClosed: (message) => {
      clearActiveRoom(roomId);
      setRoom(null);
      setError(message);
    },
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    api
      .get(`/rooms/${roomId}`)
      .then((res) => {
        const nextRoom = res.data as Room;
        if (expectedGameSlug && nextRoom.gameSlug !== expectedGameSlug) {
          router.replace(`/play/${nextRoom.gameSlug}/${nextRoom.id}`);
          return;
        }
        setRoom(nextRoom);
      })
      .catch(() => setError('房间不存在'));
  }, [expectedGameSlug, roomId, router]);

  useEffect(() => {
    if (!room || !player) return;

    const isSeated = room.players.some((roomPlayer) => roomPlayer.userId === player.id);
    if (isSeated && room.status !== 'finished') {
      rememberActiveRoom(room);
    }
    if (room.status === 'finished') {
      clearActiveRoom(room.id);
    }
  }, [room, player]);

  const mySeat = room?.players.find((roomPlayer) => roomPlayer.userId === player?.id)?.seat ?? null;
  const isInRoom = mySeat !== null;
  const isHost = Boolean(room && player?.id === room.hostUserId);
  const canJoin = Boolean(
    room &&
      room.mode === 'pvp' &&
      !isInRoom &&
      room.players.length < room.maxPlayers &&
      room.status !== 'finished',
  );
  const canLeave = Boolean(room && isInRoom && room.status !== 'finished');
  const leaveLabel =
    room?.status === 'playing'
      ? '投降离开'
      : isHost
        ? '关闭房间'
        : '离开房间';
  const isMyTurn = Boolean(isInRoom && room?.status === 'playing' && room.currentTurnSeat === mySeat);
  const boardDisabled = !isMyTurn;

  const joinRoom = useCallback(async () => {
    setJoining(true);
    try {
      const res = await api.post(`/rooms/${roomId}/join`);
      rememberActiveRoom(res.data);
      setRoom(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '加入失败');
    } finally {
      setJoining(false);
    }
  }, [roomId]);

  const leaveRoom = useCallback(async () => {
    if (!room) return;

    setLeaving(true);
    try {
      await api.post(`/rooms/${roomId}/leave`);
      clearActiveRoom(roomId);
      router.push('/rooms');
    } catch (err: any) {
      setError(err.response?.data?.message || '离开房间失败');
    } finally {
      setLeaving(false);
    }
  }, [room, roomId, router]);

  return {
    roomId,
    expectedGameSlug,
    room,
    player,
    error,
    joining,
    leaving,
    mySeat,
    isInRoom,
    isHost,
    canJoin,
    canLeave,
    leaveLabel,
    isMyTurn,
    boardDisabled,
    joinRoom,
    leaveRoom,
    makeMove,
    restart,
  };
}
