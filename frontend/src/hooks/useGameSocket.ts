'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { PlayerIdentity, Room } from '@/types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001/play';

interface UseGameSocketOptions {
  roomId: string;
  player: PlayerIdentity | null;
  onState?: (room: Room) => void;
  onError?: (message: string) => void;
  onClosed?: (message: string) => void;
}

export function useGameSocket({ roomId, player, onState, onError, onClosed }: UseGameSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onStateRef = useRef(onState);
  const onErrorRef = useRef(onError);
  const onClosedRef = useRef(onClosed);

  // keep latest callbacks without re-creating the socket
  onStateRef.current = onState;
  onErrorRef.current = onError;
  onClosedRef.current = onClosed;

  useEffect(() => {
    if (!roomId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        playerId: player?.id || '',
        playerNickname: encodeURIComponent(player?.nickname || ''),
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', roomId);
    });

    socket.on('room:state', (room: Room) => {
      onStateRef.current?.(room);
    });

    socket.on('room:error', (data: { message: string }) => {
      onErrorRef.current?.(data.message);
    });

    socket.on('room:closed', (data: { message: string }) => {
      onClosedRef.current?.(data.message);
    });

    return () => {
      socket.emit('leaveRoom', roomId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, player?.id, player?.nickname]);

  const makeMove = useCallback(
    (row: number, col: number, pass = false) => {
      socketRef.current?.emit('move', { roomId, row, col, pass });
    },
    [roomId],
  );

  const restart = useCallback(() => {
    socketRef.current?.emit('restart', roomId);
  }, [roomId]);

  return { makeMove, restart };
}
