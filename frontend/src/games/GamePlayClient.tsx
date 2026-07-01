'use client';

import Link from 'next/link';
import { ConnectFourRoom } from './connect-four/ConnectFourRoom';
import { GomokuRoom } from './gomoku/GomokuRoom';
import { ReversiRoom } from './reversi/ReversiRoom';

export function GamePlayClient({
  gameSlug,
  roomId,
}: {
  gameSlug: string;
  roomId: string;
}) {
  if (gameSlug === 'gomoku') {
    return <GomokuRoom roomId={roomId} />;
  }
  if (gameSlug === 'reversi') {
    return <ReversiRoom roomId={roomId} />;
  }
  if (gameSlug === 'connect-four') {
    return <ConnectFourRoom roomId={roomId} />;
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">暂不支持这个游戏</h1>
      <Link href="/games" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
        返回游戏大厅
      </Link>
    </div>
  );
}
