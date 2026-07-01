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

const ROWS = 6;
const COLS = 7;
const WIN = 4;

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function dropRow(board: Board, col: number): number {
  if (col < 0 || col >= COLS) return -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) return row;
  }
  return -1;
}

function legalColumns(board: Board): number[] {
  const columns: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (dropRow(board, col) !== -1) columns.push(col);
  }
  return columns;
}

function findWinner(board: Board): Cell | 0 {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = board[row][col];
      if (piece === 0) continue;

      for (const [dr, dc] of DIRECTIONS) {
        let count = 1;
        for (let step = 1; step < WIN; step++) {
          const nextRow = row + dr * step;
          const nextCol = col + dc * step;
          if (!inBounds(nextRow, nextCol) || board[nextRow][nextCol] !== piece) break;
          count++;
        }
        if (count >= WIN) return piece;
      }
    }
  }

  return 0;
}

function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== 0);
}

function wouldWin(board: Board, col: number, piece: Cell): boolean {
  const row = dropRow(board, col);
  if (row === -1) return false;
  const next = cloneBoard(board);
  next[row][col] = piece;
  return findWinner(next) === piece;
}

export const connectFourEngine: GameEngine = {
  slug: 'connect-four',
  boardSize: COLS,

  createInitialBoard(): Board {
    return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
  },

  firstTurnSeat(): number {
    return 0;
  },

  getLegalMoves(board: Board, _seat: number): Move[] {
    return legalColumns(board).map((col) => ({ row: dropRow(board, col), col }));
  },

  isLegalMove(board: Board, _seat: number, move: Move): boolean {
    if (move.pass) return false;
    return dropRow(board, move.col) !== -1;
  },

  applyMove(board: Board, seat: number, move: Move): { board: Board; nextSeat: number } {
    const row = dropRow(board, move.col);
    const next = cloneBoard(board);
    next[row][move.col] = pieceForSeat(seat);
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
    const columns = legalColumns(board);
    if (columns.length === 0) return null;

    const piece = pieceForSeat(seat);
    const opponentPiece = pieceForSeat(opponentSeat(seat));

    const winningColumn = columns.find((col) => wouldWin(board, col, piece));
    if (winningColumn !== undefined) {
      return { row: dropRow(board, winningColumn), col: winningColumn };
    }

    const blockingColumn = columns.find((col) => wouldWin(board, col, opponentPiece));
    if (blockingColumn !== undefined) {
      return { row: dropRow(board, blockingColumn), col: blockingColumn };
    }

    const center = Math.floor(COLS / 2);
    const preferred = [...columns].sort(
      (a, b) => Math.abs(a - center) - Math.abs(b - center),
    )[0];
    return { row: dropRow(board, preferred), col: preferred };
  },
};
