'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { clearActiveRoom, getActiveRoom, rememberActiveRoom } from '@/lib/activeRoom';
import { Room, Game } from '@/types';
import { RoomCard } from '@/components/play/RoomCard';
import { CreateRoomModal } from '@/components/play/CreateRoomModal';
import { useLobbySocket } from '@/hooks/useLobbySocket';
import { usePlayerStore } from '@/store/player';
import { getGameNameZh } from '@/lib/utils';

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const player = usePlayerStore((state) => state.player);
  const [showCreate, setShowCreate] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useLobbySocket((nextRooms) => {
    queryClient.setQueryData(['rooms'], nextRooms);
  });

  useEffect(() => {
    setActiveRoomId(getActiveRoom()?.id || null);
  }, []);

  const { data: rooms, isLoading, isFetching } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/rooms')).data,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 30000, // fallback if WebSocket is unavailable
  });

  const { data: games } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: async () => (await api.get('/games')).data,
  });

  const {
    data: activeRoom,
    isError: activeRoomError,
  } = useQuery<Room>({
    queryKey: ['active-room', activeRoomId],
    queryFn: async () => (await api.get(`/rooms/${activeRoomId}`)).data,
    enabled: Boolean(activeRoomId),
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (activeRoomError && activeRoomId) {
      clearActiveRoom(activeRoomId);
      setActiveRoomId(null);
    }
  }, [activeRoomError, activeRoomId]);

  useEffect(() => {
    if (!activeRoom || !activeRoomId || !player) return;

    const isSeated = activeRoom.players.some((roomPlayer) => roomPlayer.userId === player.id);
    if (activeRoom.status === 'finished' || !isSeated) {
      clearActiveRoom(activeRoomId);
      setActiveRoomId(null);
      return;
    }

    rememberActiveRoom(activeRoom);
  }, [activeRoom, activeRoomId, player]);

  const resumableRoom =
    activeRoom &&
    player &&
    activeRoom.status !== 'finished' &&
    activeRoom.players.some((roomPlayer) => roomPlayer.userId === player.id)
      ? activeRoom
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">对战大厅</h1>
          <p className="text-gray-600">加入一个开放房间在线对弈,或创建你自己的房间。</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>创建房间</span>
        </button>
      </div>

      {resumableRoom && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium text-primary-600">继续房间</p>
            <p className="font-semibold text-gray-900">{resumableRoom.title}</p>
            <p className="text-sm text-gray-500">
              {getGameNameZh(resumableRoom.gameSlug)} · {resumableRoom.players.length}/{resumableRoom.maxPlayers}
            </p>
          </div>
          <Link
            href={`/rooms/${resumableRoom.id}`}
            className="inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            进入房间
          </Link>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500">
          房间列表实时同步{isFetching ? '中...' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-44" />
          ))}
        </div>
      ) : !rooms || rooms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">还没有开放的房间</p>
          <p className="text-gray-400 mt-2">点击「创建房间」开一局吧!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {showCreate && games && (
        <CreateRoomModal games={games} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
