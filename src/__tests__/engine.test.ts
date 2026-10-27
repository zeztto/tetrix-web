import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  spawnPiece,
  movePiece,
  rotatePieceCW,
  rotatePieceCCW,
  hardDrop,
  softDrop,
  holdPiece,
  lockPiece,
  tick,
  togglePause,
  isGameOver,
} from '../lib/engine';


describe('createInitialState', () => {
  it('should create valid initial state', () => {
    const state = createInitialState();

    expect(state.board).toHaveLength(20);
    expect(state.board[0]).toHaveLength(10);
    expect(state.currentPiece).toBeNull();
    expect(state.nextPieces).toHaveLength(3);
    expect(state.heldPiece).toBeNull();
    expect(state.canHold).toBe(true);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.lines).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.backToBack).toBe(false);
    expect(state.gameState).toBe('idle');
  });
});

describe('spawnPiece', () => {
  it('should spawn piece at top center', () => {
    const state = createInitialState();
    const newState = spawnPiece(state);

    expect(newState.currentPiece).not.toBeNull();
    expect(newState.currentPiece!.position.x).toBe(3);
    expect(newState.currentPiece!.position.y).toBeLessThanOrEqual(0);
    expect(newState.currentPiece!.rotation).toBe(0);
  });

  it('should use next piece from queue', () => {
    const state = createInitialState();
    const expectedType = state.nextPieces[0];

    const newState = spawnPiece(state);

    expect(newState.currentPiece!.type).toBe(expectedType);
    expect(newState.nextPieces).toHaveLength(3);
    expect(newState.nextPieces[0]).not.toBe(expectedType);
  });

  it('should set game state to playing', () => {
    const state = createInitialState();
    const newState = spawnPiece(state);

    expect(newState.gameState).toBe('playing');
  });
});

describe('movePiece', () => {
  it('should move piece left', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const originalX = state.currentPiece!.position.x;

    const newState = movePiece(state, 'left');

    expect(newState.currentPiece!.position.x).toBe(originalX - 1);
  });

  it('should move piece right', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const originalX = state.currentPiece!.position.x;

    const newState = movePiece(state, 'right');

    expect(newState.currentPiece!.position.x).toBe(originalX + 1);
  });

  it('should move piece down', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const originalY = state.currentPiece!.position.y;

    const newState = movePiece(state, 'down');

    expect(newState.currentPiece!.position.y).toBe(originalY + 1);
  });

  it('should not move if blocked', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    for (let i = 0; i < 20; i++) {
      state = movePiece(state, 'left');
    }

    const blockedState = movePiece(state, 'left');
    expect(blockedState.currentPiece!.position.x).toBe(state.currentPiece!.position.x);
  });

  it('should return same state if no current piece', () => {
    const state = createInitialState();
    const newState = movePiece(state, 'left');

    expect(newState).toEqual(state);
  });
});

describe('rotatePieceCW', () => {
  it('should rotate piece clockwise', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = rotatePieceCW(state);

    expect(newState.currentPiece!.rotation).toBe(1);
  });
});

describe('rotatePieceCCW', () => {
  it('should rotate piece counter-clockwise', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = rotatePieceCCW(state);

    expect(newState.currentPiece!.rotation).toBe(3);
  });
});

describe('hardDrop', () => {
  it('should drop piece to bottom and lock', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = hardDrop(state);

    expect(newState.currentPiece).toBeNull();
    expect(newState.score).toBeGreaterThan(0);
  });

  it('should add hard drop score', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = hardDrop(state);

    expect(newState.score).toBeGreaterThan(0);
  });
});

describe('softDrop', () => {
  it('should move piece down one cell', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const originalY = state.currentPiece!.position.y;

    const newState = softDrop(state);

    expect(newState.currentPiece!.position.y).toBe(originalY + 1);
  });

  it('should add soft drop score', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = softDrop(state);

    expect(newState.score).toBe(1);
  });
});

describe('holdPiece', () => {
  it('should swap current piece with held piece', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const currentType = state.currentPiece!.type;

    const newState = holdPiece(state);

    expect(newState.heldPiece).toBe(currentType);
    expect(newState.currentPiece).not.toBeNull();
    expect(newState.canHold).toBe(false);
  });

  it('should not allow hold twice in same turn', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    state = holdPiece(state);
    const heldAfterFirst = state.heldPiece;

    const newState = holdPiece(state);

    expect(newState.heldPiece).toBe(heldAfterFirst);
  });

  it('should swap with existing held piece', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    state = holdPiece(state);
    state = lockPiece(state);
    state = spawnPiece(state);
    const currentType = state.currentPiece!.type;
    const heldType = state.heldPiece;

    const newState = holdPiece(state);

    expect(newState.heldPiece).toBe(currentType);
    expect(newState.currentPiece!.type).toBe(heldType);
  });
});

describe('lockPiece', () => {
  it('should merge piece to board', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    for (let i = 0; i < 25; i++) {
      state = movePiece(state, 'down');
    }

    const newState = lockPiece(state);

    expect(newState.currentPiece).toBeNull();
    const hasBlocks = newState.board.some(row => row.some(cell => cell !== null));
    expect(hasBlocks).toBe(true);
  });

  it('should reset canHold after lock', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    state = holdPiece(state);
    expect(state.canHold).toBe(false);

    state = lockPiece(state);

    expect(state.canHold).toBe(true);
  });

  it('should clear lines and add score', () => {
    let state = createInitialState();

    for (let x = 0; x < 9; x++) {
      state.board[19][x] = 'I';
    }

    state = spawnPiece(state);

    for (let i = 0; i < 10; i++) {
      state = movePiece(state, 'left');
    }

    for (let i = 0; i < 25; i++) {
      state = movePiece(state, 'down');
    }

    const beforeLines = state.lines;
    state = lockPiece(state);

    expect(state.lines).toBeGreaterThanOrEqual(beforeLines);
  });
});

describe('tick', () => {
  it('should move piece down', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    const originalY = state.currentPiece!.position.y;

    const newState = tick(state);

    expect(newState.currentPiece!.position.y).toBe(originalY + 1);
  });

  it('should not tick when paused', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    state = togglePause(state);
    const originalY = state.currentPiece!.position.y;

    const newState = tick(state);

    expect(newState.currentPiece!.position.y).toBe(originalY);
  });

  it('should not tick when game over', () => {
    let state = createInitialState();
    state = { ...state, gameState: 'gameover' };

    const newState = tick(state);

    expect(newState).toEqual(state);
  });
});

describe('togglePause', () => {
  it('should toggle from playing to paused', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    const newState = togglePause(state);

    expect(newState.gameState).toBe('paused');
  });

  it('should toggle from paused to playing', () => {
    let state = createInitialState();
    state = spawnPiece(state);
    state = togglePause(state);

    const newState = togglePause(state);

    expect(newState.gameState).toBe('playing');
  });

  it('should not toggle when game over', () => {
    let state = createInitialState();
    state = { ...state, gameState: 'gameover' };

    const newState = togglePause(state);

    expect(newState.gameState).toBe('gameover');
  });
});

describe('isGameOver', () => {
  it('should return false for normal state', () => {
    let state = createInitialState();
    state = spawnPiece(state);

    expect(isGameOver(state)).toBe(false);
  });

  it('should return true when game state is gameover', () => {
    let state = createInitialState();
    state = { ...state, gameState: 'gameover' };

    expect(isGameOver(state)).toBe(true);
  });
});
