'use client';

import { useParams } from 'next/navigation';
import { GameRoomClient } from './GameRoomClient';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  return <GameRoomClient roomId={roomId} />;
}
