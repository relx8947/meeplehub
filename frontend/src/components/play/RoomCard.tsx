'use client';

import Link from 'next/link';
import { Room } from '@/types';
import {
  getRoomStatusLabel,
  getRoomStatusColor,
  getModeLabel,
  getGameNameZh,
} from '@/lib/utils';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const isFull = room.players.length >= room.maxPlayers;

  return (
    <div className="bg-white rounded-xl border hover:shadow-lg transition-shadow p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{room.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {getGameNameZh(room.gameSlug)} · {getModeLabel(room.mode)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
          {getRoomStatusLabel(room.status)}
        </span>
      </div>

      <div className="mt-4 flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        玩家 {room.players.length}/{room.maxPlayers}
        <span className="ml-2 text-gray-400">
          ({room.players.map((p) => p.nickname).join('、')})
        </span>
      </div>

      <div className="mt-4">
        <Link
          href={`/rooms/${room.id}`}
          className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
            isFull && room.status !== 'finished'
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isFull ? '进入观战 / 继续' : '加入对战'}
        </Link>
      </div>
    </div>
  );
}
