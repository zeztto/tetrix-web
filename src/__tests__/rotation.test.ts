import { describe, it, expect } from 'vitest';
import { rotatePiece, getRotatedPiece, tryWallKicks } from '../lib/rotation';
import { createEmptyBoard } from '../lib/board';
import type { Piece, RotationState } from '@/types/game';

describe('getRotatedPiece', () => {
  it('should rotate T-piece clockwise (0 -> 1)', () => {
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 0 },
      rotation: 0,
    };

    const rotated = getRotatedPiece(piece, 'cw');

    expect(rotated.rotation).toBe(1);
    expect(rotated.position).toEqual(piece.position);
    expect(rotated.type).toBe('T');
  });

  it('should rotate T-piece counter-clockwise (0 -> 3)', () => {
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 0 },
      rotation: 0,
    };

    const rotated = getRotatedPiece(piece, 'ccw');

    expect(rotated.rotation).toBe(3);
  });

  it('should wrap rotation clockwise (3 -> 0)', () => {
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 0 },
      rotation: 3,
    };

    const rotated = getRotatedPiece(piece, 'cw');

    expect(rotated.rotation).toBe(0);
  });

  it('should wrap rotation counter-clockwise (0 -> 3)', () => {
    const piece: Piece = {
      type: 'J',
      position: { x: 3, y: 0 },
      rotation: 0,
    };

    const rotated = getRotatedPiece(piece, 'ccw');

    expect(rotated.rotation).toBe(3);
  });

  it('should return same rotation for O-piece', () => {
    const piece: Piece = {
      type: 'O',
      position: { x: 4, y: 0 },
      rotation: 0,
    };

    const rotatedCW = getRotatedPiece(piece, 'cw');
    const rotatedCCW = getRotatedPiece(piece, 'ccw');

    // O-piece visually looks the same in all rotations
    // but we still update the rotation state for consistency
    expect(rotatedCW.rotation).toBe(1);
    expect(rotatedCCW.rotation).toBe(3);
  });
});

describe('tryWallKicks', () => {
  it('should return piece at first valid offset', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 5 },
      rotation: 0,
    };
    const newRotation: RotationState = 1;
    const offsets = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
    ];

    const result = tryWallKicks(board, piece, newRotation, offsets);

    expect(result).not.toBeNull();
    expect(result!.rotation).toBe(1);
    expect(result!.position).toEqual({ x: 3, y: 5 }); // First offset (0,0) works
  });

  it('should try subsequent offsets if first fails', () => {
    const board = createEmptyBoard();
    // Block the position where piece would be with first offset
    board[5][2] = 'I'; // Block position that would conflict

    const piece: Piece = {
      type: 'T',
      position: { x: 0, y: 5 }, // Near left wall
      rotation: 0,
    };
    const newRotation: RotationState = 1;
    const offsets = [
      { x: 0, y: 0 },   // Would put piece at x=0, might conflict
      { x: 1, y: 0 },   // Shift right
      { x: 1, y: -1 },  // Shift right and up
    ];

    const result = tryWallKicks(board, piece, newRotation, offsets);

    expect(result).not.toBeNull();
  });

  it('should return null if all offsets fail', () => {
    const board = createEmptyBoard();
    // Fill the board to make all positions invalid
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'I';
      }
    }

    const piece: Piece = {
      type: 'T',
      position: { x: 3, y: 5 },
      rotation: 0,
    };
    const newRotation: RotationState = 1;
    const offsets = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
    ];

    const result = tryWallKicks(board, piece, newRotation, offsets);

    expect(result).toBeNull();
  });

  it('should return null for empty offsets array', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'O',
      position: { x: 4, y: 5 },
      rotation: 0,
    };

    const result = tryWallKicks(board, piece, 1, []);

    expect(result).toBeNull();
  });
});

describe('rotatePiece', () => {
  it('should rotate T-piece in empty space', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'T',
      position: { x: 4, y: 5 },
      rotation: 0,
    };

    const rotated = rotatePiece(board, piece, 'cw');

    expect(rotated.rotation).toBe(1);
    expect(rotated.position).toEqual({ x: 4, y: 5 });
  });

  it('should use wall kick when basic rotation fails', () => {
    const board = createEmptyBoard();
    // Create a situation where wall kick is needed
    // Place piece at left edge
    const piece: Piece = {
      type: 'T',
      position: { x: 0, y: 5 },
      rotation: 1, // Pointing right
    };

    // Rotation 1->2 might need wall kick at edge
    const rotated = rotatePiece(board, piece, 'cw');

    // Should successfully rotate (possibly with offset)
    expect(rotated.rotation).toBe(2);
  });

  it('should return original piece if all wall kicks fail', () => {
    const board = createEmptyBoard();
    // Fill most of the board
    for (let y = 3; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = 'I';
      }
    }
    // Leave a small space for the piece
    board[4][4] = null;
    board[4][5] = null;
    board[4][6] = null;
    board[5][5] = null;

    const piece: Piece = {
      type: 'T',
      position: { x: 4, y: 4 },
      rotation: 0,
    };

    // Try to rotate - should fail due to blocked spaces
    const rotated = rotatePiece(board, piece, 'cw');

    // Should return original piece unchanged
    expect(rotated).toEqual(piece);
  });

  it('should handle O-piece rotation (no visual change)', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'O',
      position: { x: 4, y: 5 },
      rotation: 0,
    };

    const rotated = rotatePiece(board, piece, 'cw');

    // O-piece has no wall kicks, but rotation state changes
    // Since O-piece looks the same in all rotations, this is fine
    expect(rotated.type).toBe('O');
    expect(rotated.position).toEqual(piece.position);
  });

  it('should rotate counter-clockwise correctly', () => {
    const board = createEmptyBoard();
    const piece: Piece = {
      type: 'J',
      position: { x: 4, y: 5 },
      rotation: 0,
    };

    const rotated = rotatePiece(board, piece, 'ccw');

    expect(rotated.rotation).toBe(3);
  });

  it('should handle I-piece wall kicks (different from JLSTZ)', () => {
    const board = createEmptyBoard();
    // I-piece at right edge
    const piece: Piece = {
      type: 'I',
      position: { x: 6, y: 5 },
      rotation: 0, // Horizontal
    };

    const rotated = rotatePiece(board, piece, 'cw');

    // Should rotate successfully with I-piece specific wall kicks
    expect(rotated.rotation).toBe(1);
  });

  it('should complete full rotation cycle', () => {
    const board = createEmptyBoard();
    let piece: Piece = {
      type: 'S',
      position: { x: 4, y: 5 },
      rotation: 0,
    };

    // Rotate 4 times clockwise to return to original
    piece = rotatePiece(board, piece, 'cw'); // 0 -> 1
    expect(piece.rotation).toBe(1);

    piece = rotatePiece(board, piece, 'cw'); // 1 -> 2
    expect(piece.rotation).toBe(2);

    piece = rotatePiece(board, piece, 'cw'); // 2 -> 3
    expect(piece.rotation).toBe(3);

    piece = rotatePiece(board, piece, 'cw'); // 3 -> 0
    expect(piece.rotation).toBe(0);
  });
});
