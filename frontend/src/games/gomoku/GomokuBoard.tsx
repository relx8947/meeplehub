'use client';

import { Board } from '@/types';

interface GomokuBoardProps {
  board: Board;
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
  lastMove?: { row: number; col: number } | null;
}

/**
 * Gomoku board: stones sit on line intersections of a 15x15 grid.
 * We draw the grid lines with CSS and place stones at intersections.
 */
export function GomokuBoard({ board, onPlace, disabled }: GomokuBoardProps) {
  const size = board.length;

  return (
    <div className="inline-block bg-amber-100 p-3 rounded-lg shadow-inner select-none">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {board.map((rowArr, r) =>
          rowArr.map((cell, c) => {
            const isStar = isStarPoint(size, r, c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => !disabled && cell === 0 && onPlace(r, c)}
                disabled={disabled || cell !== 0}
                className="relative flex items-center justify-center"
                style={{ width: 30, height: 30 }}
              >
                {/* grid lines */}
                <span className="absolute bg-amber-800/60" style={{ height: 1, left: c === 0 ? '50%' : 0, right: c === size - 1 ? '50%' : 0, top: '50%' }} />
                <span className="absolute bg-amber-800/60" style={{ width: 1, top: r === 0 ? '50%' : 0, bottom: r === size - 1 ? '50%' : 0, left: '50%' }} />
                {/* star points */}
                {isStar && cell === 0 && (
                  <span className="absolute rounded-full bg-amber-800/70" style={{ width: 6, height: 6 }} />
                )}
                {/* stone */}
                {cell !== 0 && (
                  <span
                    className={`relative rounded-full shadow ${
                      cell === 1
                        ? 'bg-gradient-to-br from-gray-700 to-black'
                        : 'bg-gradient-to-br from-white to-gray-300 border border-gray-400'
                    }`}
                    style={{ width: 24, height: 24 }}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function isStarPoint(size: number, r: number, c: number): boolean {
  if (size !== 15) return false;
  const stars = [3, 7, 11];
  return stars.includes(r) && stars.includes(c);
}
