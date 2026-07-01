import { gomokuEngine } from './gomoku';

describe('gomokuEngine', () => {
  it('creates an empty 15x15 board and starts with seat 0', () => {
    const board = gomokuEngine.createInitialBoard();

    expect(board).toHaveLength(15);
    expect(board.every((row) => row.length === 15)).toBe(true);
    expect(board.flat().every((cell) => cell === 0)).toBe(true);
    expect(gomokuEngine.firstTurnSeat()).toBe(0);
  });

  it('accepts empty in-bounds placements and rejects occupied, out-of-bounds, and pass moves', () => {
    const board = gomokuEngine.createInitialBoard();
    board[7][7] = 1;

    expect(gomokuEngine.isLegalMove(board, 0, { row: 7, col: 8 })).toBe(true);
    expect(gomokuEngine.isLegalMove(board, 0, { row: 7, col: 7 })).toBe(false);
    expect(gomokuEngine.isLegalMove(board, 0, { row: -1, col: 7 })).toBe(false);
    expect(gomokuEngine.isLegalMove(board, 0, { row: 7, col: 15 })).toBe(false);
    expect(gomokuEngine.isLegalMove(board, 0, { row: -1, col: -1, pass: true })).toBe(false);
  });

  it('applies a move without mutating the previous board', () => {
    const board = gomokuEngine.createInitialBoard();
    const result = gomokuEngine.applyMove(board, 0, { row: 7, col: 7 });

    expect(board[7][7]).toBe(0);
    expect(result.board[7][7]).toBe(1);
    expect(result.nextSeat).toBe(1);
  });

  it.each([
    { name: 'horizontal', cells: [[7, 3], [7, 4], [7, 5], [7, 6], [7, 7]] },
    { name: 'vertical', cells: [[3, 7], [4, 7], [5, 7], [6, 7], [7, 7]] },
    { name: 'down-right diagonal', cells: [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7]] },
    { name: 'down-left diagonal', cells: [[3, 7], [4, 6], [5, 5], [6, 4], [7, 3]] },
  ])('detects a $name win', ({ cells }) => {
    const board = gomokuEngine.createInitialBoard();
    for (const [row, col] of cells) {
      board[row][col] = 1;
    }

    expect(gomokuEngine.getResult(board, 1)).toEqual({
      finished: true,
      winnerSeat: 0,
      isDraw: false,
    });
  });

  it('chooses the center as the AI move on an empty board', () => {
    const board = gomokuEngine.createInitialBoard();

    expect(gomokuEngine.aiMove(board, 0)).toEqual({ row: 7, col: 7 });
  });
});
