'use client';

import { GameRoomShell } from '@/games/shared/GameRoomShell';
import { useRoomSession } from '@/games/shared/useRoomSession';
import { ConnectFourBoard } from './ConnectFourBoard';

export function ConnectFourRoom({ roomId }: { roomId: string }) {
  const session = useRoomSession(roomId, 'connect-four');

  return (
    <GameRoomShell
      session={session}
      renderBoard={({ room, boardDisabled, makeMove }) => (
        <ConnectFourBoard
          board={room.boardState}
          onPlace={(row, col) => makeMove(row, col, false)}
          disabled={boardDisabled}
        />
      )}
      sidebarExtra={() => (
        <div className="mt-6 border-t pt-4 text-sm text-gray-500">
          选择一列投入棋子,棋子会自动落到该列最底部。
        </div>
      )}
    />
  );
}
