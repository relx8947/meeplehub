import { connectFourEngine } from './connect-four';
import { Board } from './types';

describe('connectFourEngine', () => {
  it('creates an empty 6x7 board and starts with seat 0', () => {
    const board = connectFourEngine.createInitialBoard();

    expect(board).toHaveLength(6);
    expect(board.every((row) => row.length === 7)).toBe(true);
    expect(board.flat().every((cell) => cell === 0)).toBe(true);
    expect(connectFourEngine.firstTurnSeat()).toBe(0);
  });

  it('drops pieces to the lowest empty row in a column', () => {
    const board = connectFourEngine.createInitialBoard();
    const first = connectFourEngine.applyMove(board, 0, { row: 0, col: 3 });
    const second = connectFourEngine.applyMove(first.board, 1, { row: 0, col: 3 });

    expect(board[5][3]).toBe(0);
    expect(first.board[5][3]).toBe(1);
    expect(second.board[4][3]).toBe(2);
    expect(second.nextSeat).toBe(0);
  });

  it('rejects pass, out-of-bounds, and full-column moves', () => {
    const board = connectFourEngine.createInitialBoard();
    for (let row = 0; row < 6; row++) {
      board[row][0] = row % 2 === 0 ? 1 : 2;
    }

    expect(connectFourEngine.isLegalMove(board, 0, { row: -1, col: -1, pass: true })).toBe(false);
    expect(connectFourEngine.isLegalMove(board, 0, { row: 0, col: -1 })).toBe(false);
    expect(connectFourEngine.isLegalMove(board, 0, { row: 0, col: 7 })).toBe(false);
    expect(connectFourEngine.isLegalMove(board, 0, { row: 0, col: 0 })).toBe(false);
    expect(connectFourEngine.isLegalMove(board, 0, { row: 0, col: 1 })).toBe(true);
  });

  it.each([
    { name: 'horizontal', cells: [[5, 0], [5, 1], [5, 2], [5, 3]] },
    { name: 'vertical', cells: [[2, 0], [3, 0], [4, 0], [5, 0]] },
    { name: 'down-right diagonal', cells: [[2, 0], [3, 1], [4, 2], [5, 3]] },
    { name: 'down-left diagonal', cells: [[2, 3], [3, 2], [4, 1], [5, 0]] },
  ])('detects a $name win', ({ cells }) => {
    const board = connectFourEngine.createInitialBoard();
    for (const [row, col] of cells) {
      board[row][col] = 1;
    }

    expect(connectFourEngine.getResult(board, 1)).toEqual({
      finished: true,
      winnerSeat: 0,
      isDraw: false,
    });
  });

  it('detects a full-board draw when nobody has four connected', () => {
    const board: Board = [
      [1, 1, 2, 2, 1, 1, 2],
      [2, 2, 1, 1, 2, 2, 1],
      [1, 1, 2, 2, 1, 1, 2],
      [2, 2, 1, 1, 2, 2, 1],
      [1, 1, 2, 2, 1, 1, 2],
      [2, 2, 1, 1, 2, 2, 1],
    ];

    expect(connectFourEngine.getResult(board, 0)).toEqual({
      finished: true,
      winnerSeat: null,
      isDraw: true,
    });
  });

  it('prefers the center column on an empty board', () => {
    const board = connectFourEngine.createInitialBoard();

    expect(connectFourEngine.aiMove(board, 0)).toEqual({ row: 5, col: 3 });
  });

  it('takes an immediate winning move', () => {
    const board = connectFourEngine.createInitialBoard();
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;

    expect(connectFourEngine.aiMove(board, 0)).toEqual({ row: 5, col: 3 });
  });
});
