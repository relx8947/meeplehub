'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Room } from '@/types';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001/play';

export function useLobbySocket(onRooms: (rooms: Room[]) => void) {
  const onRoomsRef = useRef(onRooms);
  onRoomsRef.current = onRooms;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('joinLobby');
    });

    socket.on('lobby:rooms', (rooms: Room[]) => {
      onRoomsRef.current(rooms);
    });

    return () => {
      socket.emit('leaveLobby');
      socket.disconnect();
    };
  }, []);
}
