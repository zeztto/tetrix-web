import type { TetrominoType, RandomizerState } from '@/types/game';

export type { RandomizerState } from '@/types/game';

const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export function createSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

function createSeededBag(seed: number): [TetrominoType[], number] {
  const result = [...ALL_TYPES];
  let nextSeed = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    // A state-owned LCG keeps reducer replay deterministic; it is not a security RNG.
    nextSeed = (Math.imul(nextSeed, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((nextSeed / 0x100000000) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return [result, nextSeed];
}

export function createBag(seed = createSeed()): TetrominoType[] {
  return createSeededBag(seed)[0];
}

export function createRandomizer(seed = createSeed()): RandomizerState {
  const [first, nextSeed] = createSeededBag(seed);
  const [second, finalSeed] = createSeededBag(nextSeed);
  return {
    pieces: [...first, ...second],
    index: 0,
    seed: finalSeed,
  };
}

export function getNextPiece(state: RandomizerState): [TetrominoType, RandomizerState] {
  const piece = state.pieces[state.index];
  let newPieces = state.pieces;
  let newIndex = state.index + 1;
  let seed = state.seed;

  if (newIndex >= 7) {
    const [bag, nextSeed] = createSeededBag(seed);
    newPieces = [...state.pieces.slice(7), ...bag];
    seed = nextSeed;
    newIndex = newIndex - 7;
  }

  return [
    piece,
    {
      pieces: newPieces,
      index: newIndex,
      seed,
    },
  ];
}

export function peekNextPieces(state: RandomizerState, count: number): TetrominoType[] {
  if (count <= 0) {
    return [];
  }

  return state.pieces.slice(state.index, state.index + count);
}
