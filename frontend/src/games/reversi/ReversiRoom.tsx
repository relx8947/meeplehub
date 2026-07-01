'use client';

import { GameRoomShell } from '@/games/shared/GameRoomShell';
import { useRoomSession } from '@/games/shared/useRoomSession';
import { countDiscs, reversiLegalMoves } from '@/lib/reversi';
import { ReversiBoard } from './ReversiBoard';

export function ReversiRoom({ roomId }: { roomId: string }) {
  const session = useRoomSession(roomId, 'reversi');

  return (
    <GameRoomShell
      session={session}
      renderBoard={({ room, boardDisabled, isMyTurn, mySeat, makeMove }) => {
        const legalMoves =
          isMyTurn && mySeat !== null
            ? reversiLegalMoves(room.boardState, mySeat === 0 ? 1 : 2)
            : [];

        return (
          <ReversiBoard
            board={room.boardState}
            legalMoves={legalMoves}
            onPlace={(row, col) => makeMove(row, col, false)}
            disabled={boardDisabled}
          />
        );
      }}
      actionsExtra={({ room, isMyTurn, mySeat, makeMove }) => {
        const legalMoves =
          isMyTurn && mySeat !== null
            ? reversiLegalMoves(room.boardState, mySeat === 0 ? 1 : 2)
            : [];
        const mustPass = isMyTurn && legalMoves.length === 0 && room.status === 'playing';

        if (!mustPass) return null;

        return (
          <button
            onClick={() => makeMove(-1, -1, true)}
            className="rounded-lg bg-yellow-500 px-6 py-2 font-medium text-white hover:bg-yellow-600"
          >
            无子可下,跳过回合
          </button>
        );
      }}
      sidebarExtra={({ room }) => {
        const discs = countDiscs(room.boardState);

        return (
          <div className="mt-6 flex justify-around border-t pt-4 text-center">
            <div>
              <div className="mx-auto mb-1 h-6 w-6 rounded-full bg-black" />
              <p className="text-sm font-medium">{discs.black}</p>
            </div>
            <div>
              <div className="mx-auto mb-1 h-6 w-6 rounded-full border border-gray-300 bg-white" />
              <p className="text-sm font-medium">{discs.white}</p>
            </div>
          </div>
        );
      }}
    />
  );
}
