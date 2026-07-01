'use client';

import { Board } from '@/types';

interface ConnectFourBoardProps {
  board: Board;
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
}

export function ConnectFourBoard({ board, onPlace, disabled }: ConnectFourBoardProps) {
  const columns = board[0]?.length || 0;

  return (
    <div className="inline-block rounded-lg bg-blue-700 p-2 shadow-inner select-none">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => {
            const columnFull = board[0][col] !== 0;
            const canDrop = !disabled && !columnFull;

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => canDrop && onPlace(0, col)}
                disabled={!canDrop}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950/35 transition-colors hover:bg-blue-900/50 sm:h-12 sm:w-12"
              >
                <span
                  className={`h-9 w-9 rounded-full shadow-inner sm:h-10 sm:w-10 ${
                    cell === 1
                      ? 'bg-gradient-to-br from-red-400 to-red-600'
                      : cell === 2
                        ? 'bg-gradient-to-br from-yellow-200 to-yellow-400'
                        : 'bg-white'
                  }`}
                />
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
