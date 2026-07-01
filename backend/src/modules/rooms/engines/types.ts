/**
 * Shared game engine types & interface.
 *
 * Board representation: a 2D array of cell values.
 *   0 = empty, 1 = seat-0's piece, 2 = seat-1's piece.
 * Engines are pure logic (no DB / no IO) so they are trivially unit-testable
 * and reusable on both the gateway (real-time) and AI paths.
 */

export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

/** A move: place a piece at (row, col). `pass` is used by Reversi when no legal move exists. */
export interface Move {
  row: number;
  col: number;
  pass?: boolean;
}

export interface GameResult {
  finished: boolean;
  winnerSeat: number | null; // 0 or 1, or null
  isDraw: boolean;
}

/**
 * Seat <-> piece mapping is fixed: seat 0 uses piece 1, seat 1 uses piece 2.
 * `currentTurnSeat` always refers to whose turn it is (0 or 1).
 */
export interface GameEngine {
  slug: string;
  boardSize: number;
  /** Build the starting board. */
  createInitialBoard(): Board;
  /** Which seat moves first (0 for most games). */
  firstTurnSeat(): number;
  /** All legal moves for the given seat. Empty array means the seat must pass. */
  getLegalMoves(board: Board, seat: number): Move[];
  /** Is this move legal for the seat? */
  isLegalMove(board: Board, seat: number, move: Move): boolean;
  /**
   * Apply a move, returning the new board and the next seat to move.
   * Assumes the move is legal (validate with isLegalMove first).
   */
  applyMove(
    board: Board,
    seat: number,
    move: Move,
  ): { board: Board; nextSeat: number };
  /** Evaluate terminal state of the board, given whose turn it is next. */
  getResult(board: Board, nextSeat: number): GameResult;
  /** Pick a move for the AI playing `seat`. Returns null if no move (should pass). */
  aiMove(board: Board, seat: number): Move | null;
}

export const pieceForSeat = (seat: number): Cell => (seat === 0 ? 1 : 2);
export const opponentSeat = (seat: number): number => (seat === 0 ? 1 : 0);

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}
