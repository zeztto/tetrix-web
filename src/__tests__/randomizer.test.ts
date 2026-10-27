import { describe, it, expect } from 'vitest';
import {
  createBag,
  createRandomizer,
  getNextPiece,
  peekNextPieces,
} from '../lib/randomizer';
import type { TetrominoType } from '@/types/game';

const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

describe('createBag', () => {
  it('should return array of 7 unique tetromino types', () => {
    const bag = createBag();

    expect(bag).toHaveLength(7);
    expect(new Set(bag).size).toBe(7);
    ALL_TYPES.forEach(type => {
      expect(bag).toContain(type);
    });
  });

  it('should return shuffled bags (not always same order)', () => {
    const bags: TetrominoType[][] = [];
    for (let i = 0; i < 10; i++) {
      bags.push(createBag());
    }

    const uniqueOrders = new Set(bags.map(b => b.join(',')));
    expect(uniqueOrders.size).toBeGreaterThan(1);
  });
});

describe('createRandomizer', () => {
  it('should create randomizer with 14 pieces (2 bags)', () => {
    const randomizer = createRandomizer();

    expect(randomizer.pieces).toHaveLength(14);
    expect(randomizer.index).toBe(0);
  });

  it('should contain each type exactly twice in initial state', () => {
    const randomizer = createRandomizer();

    ALL_TYPES.forEach(type => {
      const count = randomizer.pieces.filter(p => p === type).length;
      expect(count).toBe(2);
    });
  });
});

describe('getNextPiece', () => {
  it('should return first piece and advance index', () => {
    const randomizer = createRandomizer();
    const firstPiece = randomizer.pieces[0];

    const [piece, newRandomizer] = getNextPiece(randomizer);

    expect(piece).toBe(firstPiece);
    expect(newRandomizer.index).toBe(1);
  });

  it('should return all 7 unique types in first 7 draws', () => {
    let randomizer = createRandomizer();
    const drawn: TetrominoType[] = [];

    for (let i = 0; i < 7; i++) {
      const [piece, newRandomizer] = getNextPiece(randomizer);
      drawn.push(piece);
      randomizer = newRandomizer;
    }

    expect(new Set(drawn).size).toBe(7);
    ALL_TYPES.forEach(type => {
      expect(drawn).toContain(type);
    });
  });

  it('should refill bag when reaching end', () => {
    let randomizer = createRandomizer();

    for (let i = 0; i < 14; i++) {
      const [, newRandomizer] = getNextPiece(randomizer);
      randomizer = newRandomizer;
    }

    expect(randomizer.pieces.length).toBe(14);
    expect(randomizer.index).toBe(0);
  });

  it('should never have same piece 3 times in a row', () => {
    let randomizer = createRandomizer();
    const drawn: TetrominoType[] = [];

    for (let i = 0; i < 100; i++) {
      const [piece, newRandomizer] = getNextPiece(randomizer);
      drawn.push(piece);
      randomizer = newRandomizer;
    }

    for (let i = 2; i < drawn.length; i++) {
      const threeInARow = drawn[i] === drawn[i-1] && drawn[i-1] === drawn[i-2];
      expect(threeInARow).toBe(false);
    }
  });
});

describe('peekNextPieces', () => {
  it('should return next N pieces without changing state', () => {
    const randomizer = createRandomizer();
    const expected = randomizer.pieces.slice(0, 3);

    const peeked = peekNextPieces(randomizer, 3);

    expect(peeked).toEqual(expected);
    expect(randomizer.index).toBe(0);
  });

  it('should return correct pieces after some draws', () => {
    let randomizer = createRandomizer();

    const [, newRandomizer] = getNextPiece(randomizer);
    randomizer = newRandomizer;

    const expected = randomizer.pieces.slice(1, 4);
    const peeked = peekNextPieces(randomizer, 3);

    expect(peeked).toEqual(expected);
  });

  it('should handle peek across bag boundary', () => {
    let randomizer = createRandomizer();

    for (let i = 0; i < 6; i++) {
      const [, newRandomizer] = getNextPiece(randomizer);
      randomizer = newRandomizer;
    }

    const peeked = peekNextPieces(randomizer, 3);

    expect(peeked).toHaveLength(3);
    peeked.forEach(piece => {
      expect(ALL_TYPES).toContain(piece);
    });
  });

  it('should return empty array for count 0', () => {
    const randomizer = createRandomizer();

    const peeked = peekNextPieces(randomizer, 0);

    expect(peeked).toEqual([]);
  });
});
