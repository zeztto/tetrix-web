import { describe, it, expect } from 'vitest';
import {
  isValidPosition,
  canMoveLeft,
  canMoveRight,
  canMoveDown,
  getGhostPosition,
} from '@/lib/collision';
import { createEmptyBoard } from '@/lib/board';
import type { Piece } from '@/types/game';

describe('Collision Detection', () => {
  describe('isValidPosition', () => {
    it('should return true for valid position in empty board', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      expect(isValidPosition(board, piece)).toBe(true);
    });

    it('should return false when piece is past left wall', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: -2, y: 0 },
        rotation: 0,
      };

      expect(isValidPosition(board, piece)).toBe(false);
    });

    it('should return false when piece is past right wall', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 8, y: 0 },
        rotation: 0,
      };

      expect(isValidPosition(board, piece)).toBe(false);
    });

    it('should return false when piece is past bottom', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 19 },
        rotation: 0,
      };

      expect(isValidPosition(board, piece)).toBe(false);
    });

    it('should return false when piece overlaps existing blocks', () => {
      const board = createEmptyBoard();
      board[1][4] = 'I';

      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      expect(isValidPosition(board, piece)).toBe(false);
    });
  });

  describe('canMoveLeft', () => {
    it('should return true when left is clear', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      expect(canMoveLeft(board, piece)).toBe(true);
    });

    it('should return false when at left wall', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 0, y: 0 },
        rotation: 0,
      };

      expect(canMoveLeft(board, piece)).toBe(false);
    });
  });

  describe('canMoveRight', () => {
    it('should return true when right is clear', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      expect(canMoveRight(board, piece)).toBe(true);
    });

    it('should return false when at right wall', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 7, y: 0 },
        rotation: 0,
      };

      expect(canMoveRight(board, piece)).toBe(false);
    });
  });

  describe('canMoveDown', () => {
    it('should return true when below is clear', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      expect(canMoveDown(board, piece)).toBe(true);
    });

    it('should return false when at bottom', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 18 },
        rotation: 0,
      };

      expect(canMoveDown(board, piece)).toBe(false);
    });
  });

  describe('getGhostPosition', () => {
    it('should return bottom position for empty board', () => {
      const board = createEmptyBoard();
      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      const ghostY = getGhostPosition(board, piece);

      expect(ghostY).toBe(18);
    });

    it('should stop at existing blocks', () => {
      const board = createEmptyBoard();
      for (let x = 0; x < 10; x++) {
        board[15][x] = 'I';
      }

      const piece: Piece = {
        type: 'T',
        position: { x: 3, y: 0 },
        rotation: 0,
      };

      const ghostY = getGhostPosition(board, piece);

      expect(ghostY).toBe(13);
    });
  });
});
