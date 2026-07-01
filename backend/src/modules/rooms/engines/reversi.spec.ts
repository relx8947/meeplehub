import { reversiEngine } from './reversi';
import { Board, Cell } from './types';

function fullBoard(piece: Cell): Board {
  return Array.from({ length: 8 }, () => Array<Cell>(8).fill(piece));
}

describe('reversiEngine', () => {
  it('creates the standard initial board and starts with seat 0', () => {
    const board = reversiEngine.createInitialBoard();

    expect(board).toHaveLength(8);
    expect(board.every((row) => row.length === 8)).toBe(true);
    expect(board[3][3]).toBe(2);
    expect(board[3][4]).toBe(1);
    expect(board[4][3]).toBe(1);
    expect(board[4][4]).toBe(2);
    expect(reversiEngine.firstTurnSeat()).toBe(0);
  });

  it('finds the standard opening moves for black', () => {
    const board = reversiEngine.createInitialBoard();
    const moves = reversiEngine
      .getLegalMoves(board, 0)
      .map((move) => `${move.row},${move.col}`)
      .sort();

    expect(moves).toEqual(['2,3', '3,2', '4,5', '5,4']);
  });

  it('rejects occupied, out-of-bounds, non-flipping, and premature pass moves', () => {
    const board = reversiEngine.createInitialBoard();

    expect(reversiEngine.isLegalMove(board, 0, { row: 3, col: 3 })).toBe(false);
    expect(reversiEngine.isLegalMove(board, 0, { row: -1, col: 0 })).toBe(false);
    expect(reversiEngine.isLegalMove(board, 0, { row: 0, col: 0 })).toBe(false);
    expect(reversiEngine.isLegalMove(board, 0, { row: -1, col: -1, pass: true })).toBe(false);
  });

  it('places a disc, flips captured discs, and gives the opponent the next turn', () => {
    const board = reversiEngine.createInitialBoard();
    const result = reversiEngine.applyMove(board, 0, { row: 2, col: 3 });

    expect(board[2][3]).toBe(0);
    expect(board[3][3]).toBe(2);
    expect(result.board[2][3]).toBe(1);
    expect(result.board[3][3]).toBe(1);
    expect(result.nextSeat).toBe(1);
  });

  it('allows pass only when the current player has no legal moves', () => {
    const board = fullBoard(1);

    expect(reversiEngine.getLegalMoves(board, 1)).toHaveLength(0);
    expect(reversiEngine.isLegalMove(board, 1, { row: -1, col: -1, pass: true })).toBe(true);
  });

  it('counts pieces to determine a terminal winner or draw', () => {
    expect(reversiEngine.getResult(fullBoard(1), 1)).toEqual({
      finished: true,
      winnerSeat: 0,
      isDraw: false,
    });

    const drawBoard = reversiEngine.createInitialBoard();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        drawBoard[row][col] = (row + col) % 2 === 0 ? 1 : 2;
      }
    }

    expect(reversiEngine.getResult(drawBoard, 0)).toEqual({
      finished: true,
      winnerSeat: null,
      isDraw: true,
    });
  });

  it('chooses a legal AI move when one is available', () => {
    const board = reversiEngine.createInitialBoard();
    const move = reversiEngine.aiMove(board, 0);

    expect(move).not.toBeNull();
    expect(reversiEngine.isLegalMove(board, 0, move!)).toBe(true);
  });
});
