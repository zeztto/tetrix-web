import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  cloneBoard,
  getCellAt,
  setCellAt,
  mergePieceToBoard,
  isRowFull,
  isRowEmpty,
} from '@/lib/board';
import type { Piece } from '@/types/game';

describe('Board Utils', () => {
  describe('createEmptyBoard', () => {
    it('should create a 20x10 board filled with null', () => {
      const board = createEmptyBoard();

      expect(board.length).toBe(20);
      expect(board[0].length).toBe(10);

      board.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBeNull();
        });
      });
    });
  });

  describe('cloneBoard', () => {
    it('should create an independent copy of the board', () => {
      const original = createEmptyBoard();
      original[0][0] = 'I';

      const cloned = cloneBoard(original);

      expect(cloned[0][0]).toBe('I');

      cloned[0][0] = 'T';

      expect(original[0][0]).toBe('I');
      expect(cloned[0][0]).toBe('T');
    });
  });

  describe('getCellAt', () => {
    it('should return the cell value at given coordinates', () => {
      const board = createEmptyBoard();
      board[5][3] = 'T';

      expect(getCellAt(board, 3, 5)).toBe('T');
      expect(getCellAt(board, 0, 0)).toBeNull();
    });

    it('should return null for out of bounds coordinates', () => {
      const board = createEmptyBoard();

      expect(getCellAt(board, -1, 0)).toBeNull();
      expect(getCellAt(board, 10, 0)).toBeNull();
      expect(getCellAt(board, 0, -1)).toBeNull();
      expect(getCellAt(board, 0, 20)).toBeNull();
    });
  });

  describe('setCellAt', () => {
    it('should return a new board with the cell set', () => {
      const original = createEmptyBoard();
      const newBoard = setCellAt(original, 3, 5, 'T');

      expect(original[5][3]).toBeNull();
      expect(newBoard[5][3]).toBe('T');
    });

    it('should not mutate the original board', () => {
      const original = createEmptyBoard();
      const newBoard = setCellAt(original, 0, 0, 'I');

      expect(original[0][0]).toBeNull();
      expect(newBoard[0][0]).toBe('I');
    });
  });

  describe('mergePieceToBoard', () => {
    it('should merge piece blocks to the board', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      const newBoard = mergePieceToBoard(board, piece);

      expect(newBoard[0][4]).toBe('T');
      expect(newBoard[1][3]).toBe('T');
      expect(newBoard[1][4]).toBe('T');
      expect(newBoard[1][5]).toBe('T');
    });

    it('should not mutate the original board', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'O',
        position: { x: 0, y: 0 },
        rotation: 0,
      };

      const newBoard = mergePieceToBoard(board, piece);

      expect(board[0][1]).toBeNull();
      expect(newBoard[0][1]).toBe('O');
    });
  });

  describe('isRowFull', () => {
    it('should return true for a full row', () => {
      const board = createEmptyBoard();
      for (let x = 0; x < 10; x++) {
        board[19][x] = 'I';
      }

      expect(isRowFull(board, 19)).toBe(true);
    });

    it('should return false for a row with any null cells', () => {
      const board = createEmptyBoard();
      for (let x = 0; x < 9; x++) {
        board[19][x] = 'I';
      }

      expect(isRowFull(board, 19)).toBe(false);
    });

    it('should return false for an empty row', () => {
      const board = createEmptyBoard();

      expect(isRowFull(board, 0)).toBe(false);
    });
  });

  describe('isRowEmpty', () => {
    it('should return true for an empty row', () => {
      const board = createEmptyBoard();

      expect(isRowEmpty(board, 0)).toBe(true);
    });

    it('should return false for a row with any blocks', () => {
      const board = createEmptyBoard();
      board[0][0] = 'I';

      expect(isRowEmpty(board, 0)).toBe(false);
    });
  });
});
