import { describe, it, expect } from 'vitest';
import { getTetrominoShape, getTetrominoColor, getWallKickOffsets } from '@/lib/tetrominos';
import type { TetrominoType } from '@/types/game';

describe('Tetrominos', () => {
  describe('getTetrominoShape', () => {
    it('should return correct shape for T piece at rotation 0', () => {
      const shape = getTetrominoShape('T', 0);
      expect(shape).toEqual([
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });

    it('should have shapes for all 7 tetromino types', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

      types.forEach(type => {
        const shape = getTetrominoShape(type, 0);
        expect(shape).toBeDefined();
        expect(shape.length).toBe(4);
        expect(shape[0].length).toBe(4);
      });
    });

    it('should have 4 rotation states for each piece', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

      types.forEach(type => {
        for (let rotation = 0; rotation < 4; rotation++) {
          const shape = getTetrominoShape(type, rotation as 0 | 1 | 2 | 3);
          expect(shape).toBeDefined();
        }
      });
    });
  });

  describe('getTetrominoColor', () => {
    it('should return correct colors for each piece', () => {
      expect(getTetrominoColor('I')).toBe('#00FFFF');
      expect(getTetrominoColor('O')).toBe('#FFFF00');
      expect(getTetrominoColor('T')).toBe('#800080');
      expect(getTetrominoColor('S')).toBe('#00FF00');
      expect(getTetrominoColor('Z')).toBe('#FF0000');
      expect(getTetrominoColor('J')).toBe('#0000FF');
      expect(getTetrominoColor('L')).toBe('#FFA500');
    });
  });

  describe('getWallKickOffsets', () => {
    it('should return 5 offset tests for JLSTZ pieces', () => {
      const offsets = getWallKickOffsets('T', 0, 1);
      expect(offsets).toBeDefined();
      expect(offsets.length).toBe(5);
      offsets.forEach(offset => {
        expect(offset).toHaveProperty('x');
        expect(offset).toHaveProperty('y');
      });
    });

    it('should have different offsets for I piece vs JLSTZ', () => {
      const tOffsets = getWallKickOffsets('T', 0, 1);
      const iOffsets = getWallKickOffsets('I', 0, 1);

      expect(tOffsets).not.toEqual(iOffsets);
    });

    it('should return empty array for O piece (no wall kicks)', () => {
      const offsets = getWallKickOffsets('O', 0, 1);
      expect(offsets).toEqual([]);
    });
  });
});
