import { Board, Cell } from '@/types';

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function inBounds(size: number, r: number, c: number): boolean {
  return r >= 0 && r < size && c >= 0 && c < size;
}

/** Does placing `piece` at (r,c) flip at least one opponent disc? */
function hasFlips(board: Board, r: number, c: number, piece: Cell): boolean {
  const size = board.length;
  if (board[r][c] !== 0) return false;
  const opp: Cell = piece === 1 ? 2 : 1;

  for (const [dr, dc] of DIRECTIONS) {
    let nr = r + dr;
    let nc = c + dc;
    let seenOpp = false;
    while (inBounds(size, nr, nc) && board[nr][nc] === opp) {
      seenOpp = true;
      nr += dr;
      nc += dc;
    }
    if (seenOpp && inBounds(size, nr, nc) && board[nr][nc] === piece) {
      return true;
    }
  }
  return false;
}

/** Legal moves for the given piece (1 or 2). */
export function reversiLegalMoves(board: Board, piece: Cell): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (hasFlips(board, r, c, piece)) moves.push({ row: r, col: c });
    }
  }
  return moves;
}

/** Count discs of each color. */
export function countDiscs(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 1) black++;
      else if (cell === 2) white++;
    }
  }
  return { black, white };
}
