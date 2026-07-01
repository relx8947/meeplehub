import { Game } from '@/types';
import { GameDetailClient } from './GameDetailClient';

async function getGame(id: string): Promise<Game | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/games/${id}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const game = await getGame(params.id);
  if (!game) return { title: '未找到游戏' };
  return {
    title: `${game.nameZh || game.name} 玩法介绍 - MeepleHub`,
    description: (game.descriptionZh || '').split('\n')[0],
  };
}

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const game = await getGame(params.id);

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">未找到游戏</h1>
      </div>
    );
  }

  return <GameDetailClient game={game} />;
}
