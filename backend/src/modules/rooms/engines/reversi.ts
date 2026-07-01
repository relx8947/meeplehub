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

const SIZE = 8;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// Positional weights: corners are gold, squares adjacent to corners are dangerous.
const WEIGHTS = [
  [120, -20, 20, 5, 5, 20, -20, 120],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [5, -5, 3, 3, 3, 3, -5, 5],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [120, -20, 20, 5, 5, 20, -20, 120],
];

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

/** Return the list of opponent pieces that would be flipped by placing `piece` at (r,c). */
function flipsFor(board: Board, r: number, c: number, piece: Cell): [number, number][] {
  if (board[r][c] !== 0) return [];
  const opp: Cell = piece === 1 ? 2 : 1;
  const flips: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const line: [number, number][] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc) && board[nr][nc] === opp) {
      line.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    // Must be terminated by our own piece, with at least one opponent in between.
    if (line.length > 0 && inBounds(nr, nc) && board[nr][nc] === piece) {
      flips.push(...line);
    }
  }
  return flips;
}

function legalMovesForPiece(board: Board, piece: Cell): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0 && flipsFor(board, r, c, piece).length > 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

function countPieces(board: Board): { p1: number; p2: number; empty: number } {
  let p1 = 0;
  let p2 = 0;
  let empty = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 1) p1++;
      else if (cell === 2) p2++;
      else empty++;
    }
  }
  return { p1, p2, empty };
}

export const reversiEngine: GameEngine = {
  slug: 'reversi',
  boardSize: SIZE,

  createInitialBoard(): Board {
    const board: Board = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(0));
    const mid = SIZE / 2;
    // Standard starting position.
    board[mid - 1][mid - 1] = 2;
    board[mid - 1][mid] = 1;
    board[mid][mid - 1] = 1;
    board[mid][mid] = 2;
    return board;
  },

  firstTurnSeat(): number {
    return 0; // seat 0 (piece 1 = black) moves first
  },

  getLegalMoves(board: Board, seat: number): Move[] {
    return legalMovesForPiece(board, pieceForSeat(seat));
  },

  isLegalMove(board: Board, seat: number, move: Move): boolean {
    if (move.pass) {
      // Passing is only legal when the seat truly has no moves.
      return legalMovesForPiece(board, pieceForSeat(seat)).length === 0;
    }
    return flipsFor(board, move.row, move.col, pieceForSeat(seat)).length > 0;
  },

  applyMove(board: Board, seat: number, move: Move): { board: Board; nextSeat: number } {
    const piece = pieceForSeat(seat);
    let next = cloneBoard(board);

    if (!move.pass) {
      const flips = flipsFor(board, move.row, move.col, piece);
      next[move.row][move.col] = piece;
      for (const [fr, fc] of flips) {
        next[fr][fc] = piece;
      }
    }

    // Determine next seat: opponent if they have a move, else same seat, else nobody (terminal).
    const opp = opponentSeat(seat);
    if (legalMovesForPiece(next, pieceForSeat(opp)).length > 0) {
      return { board: next, nextSeat: opp };
    }
    if (legalMovesForPiece(next, piece).length > 0) {
      return { board: next, nextSeat: seat }; // opponent must pass
    }
    return { board: next, nextSeat: opp }; // game over; nextSeat irrelevant
  },

  getResult(board: Board): GameResult {
    const black = legalMovesForPiece(board, 1).length;
    const white = legalMovesForPiece(board, 2).length;
    if (black > 0 || white > 0) {
      return { finished: false, winnerSeat: null, isDraw: false };
    }
    // Neither side can move → game over, count pieces.
    const { p1, p2 } = countPieces(board);
    if (p1 === p2) return { finished: true, winnerSeat: null, isDraw: true };
    return { finished: true, winnerSeat: p1 > p2 ? 0 : 1, isDraw: false };
  },

  aiMove(board: Board, seat: number): Move | null {
    const piece = pieceForSeat(seat);
    const moves = legalMovesForPiece(board, piece);
    if (moves.length === 0) return null;

    let best: Move | null = null;
    let bestScore = -Infinity;
    for (const move of moves) {
      const flips = flipsFor(board, move.row, move.col, piece);
      // Positional weight of the square + small bonus for flips.
      const score = WEIGHTS[move.row][move.col] + flips.length;
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return best;
  },
};
