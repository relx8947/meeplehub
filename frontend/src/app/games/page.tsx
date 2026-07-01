'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Game } from '@/types';
import { getGameNameZh } from '@/lib/utils';

const GAME_EMOJI: Record<string, string> = {
  gomoku: '⚫',
  reversi: '🔵',
};

export default function GamesPage() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: async () => (await api.get('/games')).data,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">游戏大厅</h1>
        <p className="text-gray-600">选择一款游戏,查看玩法介绍并开始在线对弈。</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          {games?.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className="bg-white rounded-xl border hover:shadow-lg transition-shadow p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-3xl">
                    {GAME_EMOJI[game.slug] || '🎲'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {game.nameZh || game.name}
                    </h3>
                    <p className="text-sm text-gray-500">{game.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {(game.descriptionZh || '').split('\n')[0]}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.categories?.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
