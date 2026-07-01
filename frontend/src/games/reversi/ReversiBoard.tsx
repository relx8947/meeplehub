'use client';

import { Board } from '@/types';

interface ReversiBoardProps {
  board: Board;
  legalMoves: { row: number; col: number }[];
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
}

/**
 * Reversi board: 8x8 grid of green cells, discs sit inside each cell.
 * Legal-move cells are highlighted with a faint marker when it's your turn.
 */
export function ReversiBoard({ board, legalMoves, onPlace, disabled }: ReversiBoardProps) {
  const size = board.length;
  const legalSet = new Set(legalMoves.map((m) => `${m.row},${m.col}`));

  return (
    <div className="inline-block bg-green-800 p-2 rounded-lg shadow-inner select-none">
      <div
        className="grid gap-[2px] bg-green-900"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((rowArr, r) =>
          rowArr.map((cell, c) => {
            const isLegal = !disabled && legalSet.has(`${r},${c}`);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => isLegal && onPlace(r, c)}
                disabled={disabled || !isLegal}
                className="bg-green-700 hover:bg-green-600 flex items-center justify-center transition-colors"
                style={{ width: 44, height: 44 }}
              >
                {cell !== 0 ? (
                  <span
                    className={`rounded-full shadow-md ${
                      cell === 1
                        ? 'bg-gradient-to-br from-gray-800 to-black'
                        : 'bg-gradient-to-br from-white to-gray-200'
                    }`}
                    style={{ width: 34, height: 34 }}
                  />
                ) : isLegal ? (
                  <span className="rounded-full bg-white/30" style={{ width: 14, height: 14 }} />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
