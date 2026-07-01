'use client';

import { useParams } from 'next/navigation';
import { GamePlayClient } from '@/games/GamePlayClient';

export default function PlayRoomPage() {
  const params = useParams();

  return (
    <GamePlayClient
      gameSlug={params.gameSlug as string}
      roomId={params.roomId as string}
    />
  );
}
