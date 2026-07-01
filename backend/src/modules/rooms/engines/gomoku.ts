import {
  Board,
  Cell,
  GameEngine,
  GameResult,
  Move,
  cloneBoard,
  opponentSeat,
  pieceForSeat,
} from './types';

const SIZE = 15;
const WIN = 5;

const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

/** Check whether placing `piece` at (r,c) completes a line of 5+. */
function isWinningPlacement(board: Board, r: number, c: number, piece: Cell): boolean {
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    // forward
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc) && board[nr][nc] === piece) {
      count++;
      nr += dr;
      nc += dc;
    }
    // backward
    nr = r - dr;
    nc = c - dc;
    while (inBounds(nr, nc) && board[nr][nc] === piece) {
      count++;
      nr -= dr;
      nc -= dc;
    }
    if (count >= WIN) return true;
  }
  return false;
}

function findWinner(board: Board): Cell | 0 {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const piece = board[r][c];
      if (piece !== 0 && isWinningPlacement(board, r, c, piece)) {
        return piece;
      }
    }
  }
  return 0;
}

function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== 0));
}

/**
 * Heuristic scoring for AI: count how valuable placing `piece` at (r,c) is,
 * based on consecutive runs created in all 4 directions (offense),
 * combined with blocking value against the opponent (defense).
 */
function scorePoint(board: Board, r: number, c: number, piece: Cell): number {
  const opp: Cell = piece === 1 ? 2 : 1;
  const offense = lineScore(board, r, c, piece);
  const defense = lineScore(board, r, c, opp) * 0.9; // slightly prefer offense
  return offense + defense;
}

function lineScore(board: Board, r: number, c: number, piece: Cell): number {
  let total = 0;
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    let openEnds = 0;

    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc) && board[nr][nc] === piece) {
      count++;
      nr += dr;
      nc += dc;
    }
    if (inBounds(nr, nc) && board[nr][nc] === 0) openEnds++;

    nr = r - dr;
    nc = c - dc;
    while (inBounds(nr, nc) && board[nr][nc] === piece) {
      count++;
      nr -= dr;
      nc -= dc;
    }
    if (inBounds(nr, nc) && board[nr][nc] === 0) openEnds++;

    // Weight by run length; open ends matter a lot.
    if (count >= 5) total += 1000000;
    else if (count === 4) total += openEnds === 2 ? 100000 : openEnds === 1 ? 10000 : 0;
    else if (count === 3) total += openEnds === 2 ? 5000 : openEnds === 1 ? 500 : 0;
    else if (count === 2) total += openEnds === 2 ? 200 : openEnds === 1 ? 50 : 0;
    else total += openEnds === 2 ? 10 : 1;
  }
  return total;
}

/** Candidate moves: only empties near existing stones (keeps AI fast & sensible). */
function candidateCells(board: Board): { r: number; c: number }[] {
  const candidates: { r: number; c: number }[] = [];
  const seen = new Set<string>();
  let hasStone = false;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) continue;
      hasStone = true;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (inBounds(nr, nc) && board[nr][nc] === 0) {
            const key = `${nr},${nc}`;
            if (!seen.has(key)) {
              seen.add(key);
              candidates.push({ r: nr, c: nc });
            }
          }
        }
      }
    }
  }

  // Empty board → play center.
  if (!hasStone) {
    return [{ r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) }];
  }
  return candidates;
}

export const gomokuEngine: GameEngine = {
  slug: 'gomoku',
  boardSize: SIZE,

  createInitialBoard(): Board {
    return Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(0));
  },

  firstTurnSeat(): number {
    return 0;
  },

  getLegalMoves(board: Board, _seat: number): Move[] {
    const moves: Move[] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) moves.push({ row: r, col: c });
      }
    }
    return moves;
  },

  isLegalMove(board: Board, _seat: number, move: Move): boolean {
    if (move.pass) return false; // no passing in gomoku
    const { row, col } = move;
    return inBounds(row, col) && board[row][col] === 0;
  },

  applyMove(board: Board, seat: number, move: Move): { board: Board; nextSeat: number } {
    const next = cloneBoard(board);
    next[move.row][move.col] = pieceForSeat(seat);
    return { board: next, nextSeat: opponentSeat(seat) };
  },

  getResult(board: Board): GameResult {
    const winner = findWinner(board);
    if (winner !== 0) {
      return { finished: true, winnerSeat: winner === 1 ? 0 : 1, isDraw: false };
    }
    if (isBoardFull(board)) {
      return { finished: true, winnerSeat: null, isDraw: true };
    }
    return { finished: false, winnerSeat: null, isDraw: false };
  },

  aiMove(board: Board, seat: number): Move | null {
    const piece = pieceForSeat(seat);
    const candidates = candidateCells(board);
    let best: Move | null = null;
    let bestScore = -Infinity;

    for (const { r, c } of candidates) {
      // Immediate win?
      if (isWinningPlacement(setTemp(board, r, c, piece), r, c, piece)) {
        return { row: r, col: c };
      }
      const score = scorePoint(board, r, c, piece);
      if (score > bestScore) {
        bestScore = score;
        best = { row: r, col: c };
      }
    }
    return best;
  },
};

/** Helper: temporary placement for win-check without mutating the original. */
function setTemp(board: Board, r: number, c: number, piece: Cell): Board {
  const copy = cloneBoard(board);
  copy[r][c] = piece;
  return copy;
}
