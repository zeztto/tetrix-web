import { describe, it, expect } from 'vitest';
import { findFullRows, clearLines, countClearedLines } from '../lib/lineClear';
import { createEmptyBoard } from '../lib/board';
import type { Board } from '@/types/game';

function fillRow(board: Board, row: number): void {
  for (let x = 0; x < 10; x++) {
    board[row][x] = 'I';
  }
}

describe('findFullRows', () => {
  it('should return empty array for empty board', () => {
    const board = createEmptyBoard();

    const fullRows = findFullRows(board);

    expect(fullRows).toEqual([]);
  });

  it('should find single full row', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);

    const fullRows = findFullRows(board);

    expect(fullRows).toEqual([19]);
  });

  it('should find multiple full rows', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    fillRow(board, 18);
    fillRow(board, 17);

    const fullRows = findFullRows(board);

    expect(fullRows).toEqual([17, 18, 19]);
  });

  it('should not include partially filled rows', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    board[18][0] = 'T';
    board[18][1] = 'T';

    const fullRows = findFullRows(board);

    expect(fullRows).toEqual([19]);
  });

  it('should find non-consecutive full rows', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    fillRow(board, 15);

    const fullRows = findFullRows(board);

    expect(fullRows).toEqual([15, 19]);
  });
});

describe('clearLines', () => {
  it('should return same board if no full rows', () => {
    const board = createEmptyBoard();
    board[19][0] = 'T';

    const newBoard = clearLines(board);

    expect(newBoard[19][0]).toBe('T');
  });

  it('should clear single full row and shift down', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    board[18][5] = 'T';

    const newBoard = clearLines(board);

    expect(newBoard[19][5]).toBe('T');
    expect(newBoard[18][5]).toBeNull();
  });

  it('should clear multiple rows (Tetris)', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    fillRow(board, 18);
    fillRow(board, 17);
    fillRow(board, 16);
    board[15][3] = 'J';

    const newBoard = clearLines(board);

    expect(newBoard[19][3]).toBe('J');
    for (let y = 0; y < 19; y++) {
      expect(newBoard[y][3]).toBeNull();
    }
  });

  it('should add empty rows at top', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);

    const newBoard = clearLines(board);

    for (let x = 0; x < 10; x++) {
      expect(newBoard[0][x]).toBeNull();
    }
  });

  it('should preserve blocks above cleared rows', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    board[10][0] = 'S';
    board[10][9] = 'Z';

    const newBoard = clearLines(board);

    expect(newBoard[11][0]).toBe('S');
    expect(newBoard[11][9]).toBe('Z');
  });

  it('should handle non-consecutive clears', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    board[18][5] = 'L';
    fillRow(board, 17);

    const newBoard = clearLines(board);

    expect(newBoard[19][5]).toBe('L');
  });

  it('should not mutate original board', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    const originalCell = board[19][0];

    clearLines(board);

    expect(board[19][0]).toBe(originalCell);
  });
});

describe('countClearedLines', () => {
  it('should return 0 for empty board', () => {
    const board = createEmptyBoard();

    const count = countClearedLines(board);

    expect(count).toBe(0);
  });

  it('should return 1 for single full row', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);

    const count = countClearedLines(board);

    expect(count).toBe(1);
  });

  it('should return 4 for Tetris', () => {
    const board = createEmptyBoard();
    fillRow(board, 19);
    fillRow(board, 18);
    fillRow(board, 17);
    fillRow(board, 16);

    const count = countClearedLines(board);

    expect(count).toBe(4);
  });
});
