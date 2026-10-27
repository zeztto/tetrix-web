import type { TetrisState, Piece, TetrominoType } from '@/types/game';
import { createEmptyBoard, mergePieceToBoard } from './board';
import { isValidPosition, canMoveDown, getGhostPosition } from './collision';
import { rotatePiece } from './rotation';
import { createRandomizer, getNextPiece, peekNextPieces } from './randomizer';
import { clearLines, countClearedLines } from './lineClear';
import { calculateLineClearScore, calculateDropScore, calculateLevel } from './scoring';

function createPiece(type: TetrominoType): Piece {
  return {
    type,
    position: { x: 3, y: -1 },
    rotation: 0,
  };
}

export function createInitialState(seed?: number): TetrisState {
  const randomizer = createRandomizer(seed);
  const nextPieces = peekNextPieces(randomizer, 3);

  return {
    randomizer,
    board: createEmptyBoard(),
    currentPiece: null,
    nextPieces,
    heldPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    backToBack: false,
    gameState: 'idle',
  };
}

export function spawnPiece(state: TetrisState): TetrisState {
  const [pieceType, randomizer] = getNextPiece(state.randomizer);
  const nextPieces = peekNextPieces(randomizer, 3);
  const newPiece = createPiece(pieceType);

  if (!isValidPosition(state.board, newPiece)) {
    return {
      ...state,
      randomizer,
      currentPiece: newPiece,
      nextPieces,
      gameState: 'gameover',
    };
  }

  return {
    ...state,
    randomizer,
    currentPiece: newPiece,
    nextPieces,
    gameState: 'playing',
  };
}

export function movePiece(
  state: TetrisState,
  direction: 'left' | 'right' | 'down'
): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  const offsets = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
  };

  const offset = offsets[direction];
  const newPiece: Piece = {
    ...state.currentPiece,
    position: {
      x: state.currentPiece.position.x + offset.x,
      y: state.currentPiece.position.y + offset.y,
    },
  };

  if (!isValidPosition(state.board, newPiece)) {
    return state;
  }

  return {
    ...state,
    currentPiece: newPiece,
  };
}

export function rotatePieceCW(state: TetrisState): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  const rotatedPiece = rotatePiece(state.board, state.currentPiece, 'cw');

  return {
    ...state,
    currentPiece: rotatedPiece,
  };
}

export function rotatePieceCCW(state: TetrisState): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  const rotatedPiece = rotatePiece(state.board, state.currentPiece, 'ccw');

  return {
    ...state,
    currentPiece: rotatedPiece,
  };
}

export function hardDrop(state: TetrisState): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  const ghostY = getGhostPosition(state.board, state.currentPiece);
  const dropDistance = ghostY - state.currentPiece.position.y;
  const dropScore = calculateDropScore(dropDistance, 'hard');

  const droppedPiece: Piece = {
    ...state.currentPiece,
    position: {
      ...state.currentPiece.position,
      y: ghostY,
    },
  };

  return lockPiece({
    ...state,
    currentPiece: droppedPiece,
    score: state.score + dropScore,
  });
}

export function softDrop(state: TetrisState): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  const newState = movePiece(state, 'down');

  if (newState.currentPiece?.position.y !== state.currentPiece.position.y) {
    return {
      ...newState,
      score: state.score + 1,
    };
  }

  return state;
}

export function holdPiece(state: TetrisState): TetrisState {
  if (!state.currentPiece || !state.canHold) {
    return state;
  }

  const currentType = state.currentPiece.type;

  if (state.heldPiece === null) {
    const [pieceType, randomizer] = getNextPiece(state.randomizer);
    const nextPieces = peekNextPieces(randomizer, 3);
    const piece = createPiece(pieceType);

    return {
      ...state,
      randomizer,
      currentPiece: piece,
      heldPiece: currentType,
      nextPieces,
      canHold: false,
      gameState: isValidPosition(state.board, piece) ? state.gameState : 'gameover',
    };
  }

  const piece = createPiece(state.heldPiece);
  return {
    ...state,
    currentPiece: piece,
    heldPiece: currentType,
    canHold: false,
    gameState: isValidPosition(state.board, piece) ? state.gameState : 'gameover',
  };
}

export function lockPiece(state: TetrisState): TetrisState {
  if (!state.currentPiece) {
    return state;
  }

  let newBoard = mergePieceToBoard(state.board, state.currentPiece);

  const clearedLines = countClearedLines(newBoard);
  newBoard = clearLines(newBoard);

  const newLines = state.lines + clearedLines;
  const newLevel = calculateLevel(newLines);

  const newCombo = clearedLines > 0 ? state.combo + 1 : 0;
  let newBackToBack = state.backToBack;
  let lineScore = 0;

  if (clearedLines > 0) {
    const isTetris = clearedLines === 4;

    if (isTetris) {
      lineScore = calculateLineClearScore(clearedLines, newLevel, newBackToBack, newCombo - 1);
      newBackToBack = true;
    } else {
      lineScore = calculateLineClearScore(clearedLines, newLevel, false, newCombo - 1);
      newBackToBack = false;
    }
  }

  return {
    ...state,
    board: newBoard,
    currentPiece: null,
    score: state.score + lineScore,
    level: newLevel,
    lines: newLines,
    combo: newCombo,
    backToBack: newBackToBack,
    canHold: true,
  };
}

export function tick(state: TetrisState): TetrisState {
  if (state.gameState !== 'playing' || !state.currentPiece) {
    return state;
  }

  if (canMoveDown(state.board, state.currentPiece)) {
    return movePiece(state, 'down');
  }

  return state;
}

export function togglePause(state: TetrisState): TetrisState {
  if (state.gameState === 'gameover' || state.gameState === 'idle') {
    return state;
  }

  return {
    ...state,
    gameState: state.gameState === 'playing' ? 'paused' : 'playing',
  };
}

export function isGameOver(state: TetrisState): boolean {
  return state.gameState === 'gameover';
}
