import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, holdPiece, spawnPiece } from '../lib/engine';
import { createRandomizer, getNextPiece } from '../lib/randomizer';
import { gameReducer, type GameAction } from '../hooks/useGameLoop';
import { clearLeaderboard, getLeaderboard, isHighScore, saveScore } from '../lib/storage';

const entry = { name: 'Player', score: 100, level: 1, lines: 2, date: '2026-10-27' };

describe('game-state-owned piece generation', () => {
  it('replays the same spawn transition without consuming a shared queue', () => {
    const state = createInitialState();
    const original = structuredClone(state);
    expect(spawnPiece(state)).toEqual(spawnPiece(state));
    expect(state).toEqual(original);
  });

  it('keeps an existing game queue independent of another game initialization', () => {
    const state = createInitialState(123);
    const expectedType = state.nextPieces[0];
    createInitialState(456);
    expect(spawnPiece(state).currentPiece?.type).toBe(expectedType);
  });

  it('replays hold without mutating the piece queue', () => {
    const state = spawnPiece(createInitialState());
    const expected = holdPiece(state);
    expect(holdPiece(state)).toEqual(expected);
    expect(state.canHold).toBe(true);
  });

  it('replays bag refill without consuming external randomness', () => {
    let state = createRandomizer();
    for (let i = 0; i < 6; i++) [, state] = getNextPiece(state);
    const original = structuredClone(state);
    expect(getNextPiece(state)).toEqual(getNextPiece(state));
    expect(state).toEqual(original);
  });

  it('replays reducer actions including restart and refill without external randomness', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues');
    let state = createInitialState(12345);
    const actions: GameAction[] = [{ type: 'START' }, { type: 'HOLD' },
      ...Array.from({ length: 18 }, (): GameAction => ({ type: 'HARD_DROP' })),
      { type: 'RESTART', seed: 987 }, { type: 'RESTART' }];
    spy.mockClear();
    for (const action of actions) {
      expect(gameReducer(state, action)).toEqual(gameReducer(state, action));
      state = gameReducer(state, action);
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('preserves complete seven-bag permutations over many seeded refills', () => {
    let state = createRandomizer(42);
    for (let bag = 0; bag < 100; bag++) {
      const pieces = [];
      for (let i = 0; i < 7; i++) {
        const [piece, next] = getNextPiece(state);
        pieces.push(piece);
        state = next;
      }
      expect([...pieces].sort()).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
    }
  });

  it.each([false, true])('ends a blocked hold spawn without changing board (swap=%s)', (swap) => {
    const state = spawnPiece(createInitialState(42));
    state.currentPiece = { type: 'I', rotation: 0, position: { x: 3, y: 10 } };
    state.board[0][4] = 'Z';
    if (swap) state.heldPiece = 'O';
    else state.randomizer.pieces[state.randomizer.index] = 'O';
    const originalBoard = structuredClone(state.board);
    const result = gameReducer(state, { type: 'HOLD' });
    expect(result.gameState).toBe('gameover');
    expect(result.board).toEqual(originalBoard);
    expect(state.board).toEqual(originalBoard);
    expect(gameReducer(result, { type: 'HARD_DROP' })).toBe(result);
    expect(gameReducer(result, { type: 'LOCK' })).toBe(result);
  });
});

describe('untrusted local leaderboard data', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it.each(['{}', 'null', '42', '"text"'])('ignores non-array JSON %s', (value) => {
    localStorage.setItem('tetris_leaderboard', value);
    expect(getLeaderboard()).toEqual([]);
    expect(() => saveScore(entry)).not.toThrow();
  });

  it('filters malformed entries and sorts and caps valid saved entries', () => {
    localStorage.setItem('tetris_leaderboard', JSON.stringify([
      null, {}, { ...entry, score: -1 }, { ...entry, name: '<script>unbounded-name</script>' },
      { ...entry, level: 0 }, { ...entry, lines: 1.5 }, { ...entry, date: 'invalid' },
      { ...entry, score: 150 }, entry,
    ]));
    expect(getLeaderboard()).toEqual([{ ...entry, score: 150 }, entry]);
  });

  it('ignores invalid score candidates', () => {
    for (const score of [NaN, Infinity, -1, 1.5]) expect(isHighScore(score)).toBe(false);
    saveScore({ ...entry, score: Infinity });
    expect(getLeaderboard()).toEqual([]);
  });

  it('does not throw when persistence is denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full'); });
    expect(saveScore(entry)).toBe(false);
  });

  it('does not throw when reads or clear are denied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new DOMException('denied'); });
    expect(getLeaderboard()).toEqual([]);
    expect(() => clearLeaderboard()).not.toThrow();
  });

  it('rejects oversized stored data without parsing it', () => {
    localStorage.setItem('tetris_leaderboard', ' '.repeat(16_385));
    expect(getLeaderboard()).toEqual([]);
  });
});
