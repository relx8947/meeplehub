'use client';

import { GameRoomShell } from '@/games/shared/GameRoomShell';
import { useRoomSession } from '@/games/shared/useRoomSession';
import { GomokuBoard } from './GomokuBoard';

export function GomokuRoom({ roomId }: { roomId: string }) {
  const session = useRoomSession(roomId, 'gomoku');

  return (
    <GameRoomShell
      session={session}
      renderBoard={({ room, boardDisabled, makeMove }) => (
        <GomokuBoard
          board={room.boardState}
          onPlace={(row, col) => makeMove(row, col, false)}
          disabled={boardDisabled}
        />
      )}
    />
  );
}
