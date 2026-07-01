'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Room } from '@/types';

export function GameRoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/rooms/${roomId}`)
      .then((res) => {
        const room = res.data as Room;
        router.replace(`/play/${room.gameSlug}/${room.id}`);
      })
      .catch(() => setError('房间不存在'));
  }, [roomId, router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
          <Link href="/rooms" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            返回对战大厅
          </Link>
        </>
      ) : (
        <div className="animate-pulse text-gray-400">正在进入游戏...</div>
      )}
    </div>
  );
}
