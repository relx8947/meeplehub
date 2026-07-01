'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { rememberActiveRoom } from '@/lib/activeRoom';
import { getRoomPlayHref } from '@/lib/utils';
import { Game, RoomMode } from '@/types';

interface CreateRoomModalProps {
  games: Game[];
  defaultSlug?: string;
  defaultMode?: RoomMode;
  onClose: () => void;
}

export function CreateRoomModal({ games, defaultSlug, defaultMode, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [gameSlug, setGameSlug] = useState(defaultSlug || games[0]?.slug || 'gomoku');
  const [mode, setMode] = useState<RoomMode>(defaultMode || 'pvp');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/rooms', {
        gameSlug,
        mode,
        title: title || undefined,
      });
      rememberActiveRoom(res.data);
      router.push(getRoomPlayHref(res.data));
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">创建对战房间</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Game selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择游戏</label>
          <div className="grid grid-cols-2 gap-3">
            {games.map((g) => (
              <button
                key={g.slug}
                onClick={() => setGameSlug(g.slug)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  gameSlug === g.slug
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {g.nameZh || g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mode selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">对战模式</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('pvp')}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'pvp'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              双人对战
              <span className="block text-xs text-gray-400 mt-1">等待好友加入</span>
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'ai'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              人机对战
              <span className="block text-xs text-gray-400 mt-1">立即和 AI 开局</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">房间名称(选填)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如:来一局五子棋"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建并进入'}
          </button>
        </div>
      </div>
    </div>
  );
}
