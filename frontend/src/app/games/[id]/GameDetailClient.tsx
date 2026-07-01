'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types';
import { api } from '@/lib/api';
import { rememberActiveRoom } from '@/lib/activeRoom';
import { getDifficultyLabel, getDifficultyColor, getPlaytimeLabel, getRoomPlayHref } from '@/lib/utils';

const GAME_EMOJI: Record<string, string> = {
  gomoku: '⚫',
  reversi: '🔵',
  'connect-four': '🔴',
};

export function GameDetailClient({ game }: { game: Game }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'pvp' | 'ai' | null>(null);
  const [error, setError] = useState('');

  const startGame = async (mode: 'pvp' | 'ai') => {
    setLoading(mode);
    setError('');
    try {
      const res = await api.post('/rooms', { gameSlug: game.slug, mode });
      rememberActiveRoom(res.data);
      router.push(getRoomPlayHref(res.data));
    } catch (err: any) {
      setError(err.response?.data?.message || '创建房间失败');
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/games" className="hover:text-primary-600">游戏大厅</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{game.nameZh || game.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: identity + actions */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6 text-center sticky top-24">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-5xl mx-auto mb-4">
              {GAME_EMOJI[game.slug] || '🎲'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{game.nameZh || game.name}</h1>
            <p className="text-sm text-gray-500 mb-4">{game.name}</p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <StatBox label="人数" value={`${game.minPlayers} 人`} />
              <StatBox label="时长" value={getPlaytimeLabel(game.minPlaytime, game.maxPlaytime)} />
              <StatBox label="棋盘" value={`${game.boardSize}×${game.boardSize}`} />
              <StatBox label="难度" value={getDifficultyLabel(game.difficulty)} />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {game.supportsAI && (
                <button
                  onClick={() => startGame('ai')}
                  disabled={loading !== null}
                  className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading === 'ai' ? '准备中...' : '人机对战'}
                </button>
              )}
              <button
                onClick={() => startGame('pvp')}
                disabled={loading !== null}
                className="w-full bg-white border border-primary-600 text-primary-600 py-2.5 rounded-lg font-medium hover:bg-primary-50 disabled:opacity-50"
              >
                {loading === 'pvp' ? '创建中...' : '创建双人房间'}
              </button>
              <Link
                href="/rooms"
                className="block w-full text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
              >
                去大厅找对手
              </Link>
            </div>
          </div>
        </div>

        {/* Right: gameplay intro */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">玩法介绍</h2>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {game.descriptionZh}
            </div>

            {game.description && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-base font-bold text-gray-900 mb-2">About (EN)</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{game.description}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {game.categories?.map((cat) => (
                <span key={cat} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 mt-1 text-sm">{value}</p>
    </div>
  );
}
