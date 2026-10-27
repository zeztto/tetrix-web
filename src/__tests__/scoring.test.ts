import { describe, it, expect } from 'vitest';
import {
  calculateLineClearScore,
  calculateTSpinScore,
  calculateDropScore,
  calculateLevel,
  detectTSpin,
} from '../lib/scoring';
import { createEmptyBoard } from '../lib/board';
import type { Piece } from '@/types/game';

describe('calculateLineClearScore', () => {
  it('should calculate Single at level 1', () => {
    const score = calculateLineClearScore(1, 1, false, 0);
    expect(score).toBe(100);
  });

  it('should calculate Double at level 1', () => {
    const score = calculateLineClearScore(2, 1, false, 0);
    expect(score).toBe(300);
  });

  it('should calculate Triple at level 1', () => {
    const score = calculateLineClearScore(3, 1, false, 0);
    expect(score).toBe(500);
  });

  it('should calculate Tetris at level 1', () => {
    const score = calculateLineClearScore(4, 1, false, 0);
    expect(score).toBe(800);
  });

  it('should scale with level', () => {
    const scoreL1 = calculateLineClearScore(4, 1, false, 0);
    const scoreL2 = calculateLineClearScore(4, 2, false, 0);
    expect(scoreL2).toBe(scoreL1 * 2);
  });

  it('should apply Back-to-Back bonus (1.5x)', () => {
    const normalTetris = calculateLineClearScore(4, 1, false, 0);
    const b2bTetris = calculateLineClearScore(4, 1, true, 0);
    expect(b2bTetris).toBe(Math.floor(normalTetris * 1.5));
  });

  it('should add combo bonus', () => {
    const noCombo = calculateLineClearScore(1, 1, false, 0);
    const combo3 = calculateLineClearScore(1, 1, false, 3);
    expect(combo3).toBe(noCombo + 50 * 3 * 1);
  });

  it('should combine level, B2B, and combo', () => {
    const base = 800 * 2;
    const b2b = Math.floor(base * 1.5);
    const combo = 50 * 2 * 2;
    const expected = b2b + combo;

    const score = calculateLineClearScore(4, 2, true, 2);
    expect(score).toBe(expected);
  });
});

describe('calculateTSpinScore', () => {
  it('should calculate T-Spin Single at level 1', () => {
    const score = calculateTSpinScore(1, 1, false);
    expect(score).toBe(800);
  });

  it('should calculate T-Spin Double at level 1', () => {
    const score = calculateTSpinScore(2, 1, false);
    expect(score).toBe(1200);
  });

  it('should calculate T-Spin Triple at level 1', () => {
    const score = calculateTSpinScore(3, 1, false);
    expect(score).toBe(1600);
  });

  it('should scale with level', () => {
    const scoreL1 = calculateTSpinScore(2, 1, false);
    const scoreL3 = calculateTSpinScore(2, 3, false);
    expect(scoreL3).toBe(scoreL1 * 3);
  });

  it('should apply Back-to-Back bonus', () => {
    const normal = calculateTSpinScore(2, 1, false);
    const b2b = calculateTSpinScore(2, 1, true);
    expect(b2b).toBe(Math.floor(normal * 1.5));
  });
});

describe('calculateDropScore', () => {
  it('should calculate soft drop score (1 per cell)', () => {
    const score = calculateDropScore(10, 'soft');
    expect(score).toBe(10);
  });

  it('should calculate hard drop score (2 per cell)', () => {
    const score = calculateDropScore(10, 'hard');
    expect(score).toBe(20);
  });

  it('should return 0 for 0 cells', () => {
    expect(calculateDropScore(0, 'soft')).toBe(0);
    expect(calculateDropScore(0, 'hard')).toBe(0);
  });
});

describe('calculateLevel', () => {
  it('should return level 1 for 0 lines', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('should return level 1 for 9 lines', () => {
    expect(calculateLevel(9)).toBe(1);
  });

  it('should return level 2 for 10 lines', () => {
    expect(calculateLevel(10)).toBe(2);
  });

  it('should return level 2 for 15 lines', () => {
    expect(calculateLevel(15)).toBe(2);
  });

  it('should cap at level 15', () => {
    expect(calculateLevel(150)).toBe(15);
    expect(calculateLevel(1000)).toBe(15);
  });
});

describe('detectTSpin', () => {
  it('should return false for non-T piece', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'I',
      position: { x: 3, y: 5 },
      rotation: 0,
    };

    expect(detectTSpin(board, piece, 'rotate')).toBe(false);
  });

  it('should return false if last action was not rotate', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 5 },
      rotation: 0,
    };

    expect(detectTSpin(board, piece, 'move')).toBe(false);
  });

  it('should return true when 3 corners are filled (T-Spin)', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 17 },
      rotation: 2,
    };

    board[17][3] = 'I';
    board[17][5] = 'I';
    board[19][3] = 'I';

    expect(detectTSpin(board, piece, 'rotate')).toBe(true);
  });

  it('should return false when less than 3 corners filled', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 17 },
      rotation: 0,
    };

    board[17][3] = 'I';
    board[17][5] = 'I';

    expect(detectTSpin(board, piece, 'rotate')).toBe(false);
  });

  it('should count wall/floor as filled corner', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 0, y: 18 },
      rotation: 3,
    };

    board[18][2] = 'I';

    expect(detectTSpin(board, piece, 'rotate')).toBe(true);
  });
});
