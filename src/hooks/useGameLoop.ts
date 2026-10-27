import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { TetrisState } from '@/types/game';
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
} from '@/lib/engine';
import { canMoveDown } from '@/lib/collision';
import { createSeed } from '@/lib/randomizer';

export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'HARD_DROP' }
  | { type: 'SOFT_DROP' }
  | { type: 'HOLD' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESTART'; seed?: number }
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'LOCK' };

const GRAVITY_FRAMES: Record<number, number> = {
  1: 1000,
  2: 793,
  3: 618,
  4: 473,
  5: 355,
  6: 262,
  7: 190,
  8: 135,
  9: 94,
  10: 64,
  11: 43,
  12: 28,
  13: 18,
  14: 11,
  15: 7,
};

function getDropInterval(level: number): number {
  const cappedLevel = Math.min(level, 15);
  return GRAVITY_FRAMES[cappedLevel] ?? 1000;
}

export function gameReducer(state: TetrisState, action: GameAction): TetrisState {
  switch (action.type) {
    case 'START':
      if (state.gameState === 'idle') {
        return spawnPiece(state);
      }
      return state;

    case 'RESTART': {
      const newState = createInitialState(action.seed ?? state.randomizer.seed);
      return spawnPiece(newState);
    }

    case 'MOVE_LEFT':
      if (state.gameState !== 'playing') return state;
      return movePiece(state, 'left');

    case 'MOVE_RIGHT':
      if (state.gameState !== 'playing') return state;
      return movePiece(state, 'right');

    case 'MOVE_DOWN':
      if (state.gameState !== 'playing') return state;
      return movePiece(state, 'down');

    case 'ROTATE_CW':
      if (state.gameState !== 'playing') return state;
      return rotatePieceCW(state);

    case 'ROTATE_CCW':
      if (state.gameState !== 'playing') return state;
      return rotatePieceCCW(state);

    case 'HARD_DROP': {
      if (state.gameState !== 'playing') return state;
      const afterDrop = hardDrop(state);
      if (afterDrop.gameState === 'gameover') return afterDrop;
      return spawnPiece(afterDrop);
    }

    case 'SOFT_DROP':
      if (state.gameState !== 'playing') return state;
      return softDrop(state);

    case 'HOLD':
      if (state.gameState !== 'playing') return state;
      return holdPiece(state);

    case 'TOGGLE_PAUSE':
      return togglePause(state);

    case 'TICK':
      if (state.gameState !== 'playing' || !state.currentPiece) return state;
      return tick(state);

    case 'LOCK': {
      if (state.gameState !== 'playing' || !state.currentPiece) return state;
      const locked = lockPiece(state);
      if (locked.gameState === 'gameover') return locked;
      return spawnPiece(locked);
    }

    default:
      return state;
  }
}

interface UseGameLoopReturn {
  state: TetrisState;
  dispatch: React.Dispatch<GameAction>;
  start: () => void;
  restart: () => void;
  pause: () => void;
}

export function useGameLoop(): UseGameLoopReturn {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const lastDropTime = useRef<number>(0);
  const lockDelayTime = useRef<number>(0);
  const lockMoveCount = useRef<number>(0);
  const isOnGround = useRef<boolean>(false);

  const LOCK_DELAY = 500;
  const MAX_LOCK_MOVES = 15;

  useEffect(() => {
    if (state.gameState !== 'playing') return;

    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const dropInterval = getDropInterval(state.level);

      if (state.currentPiece) {
        const onGround = !canMoveDown(state.board, state.currentPiece);

        if (onGround) {
          if (!isOnGround.current) {
            isOnGround.current = true;
            lockDelayTime.current = currentTime;
            lockMoveCount.current = 0;
          }

          if (currentTime - lockDelayTime.current >= LOCK_DELAY ||
              lockMoveCount.current >= MAX_LOCK_MOVES) {
            dispatch({ type: 'LOCK' });
            isOnGround.current = false;
            lastDropTime.current = currentTime;
          }
        } else {
          isOnGround.current = false;

          if (currentTime - lastDropTime.current >= dropInterval) {
            dispatch({ type: 'TICK' });
            lastDropTime.current = currentTime;
          }
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state.gameState, state.level, state.currentPiece, state.board]);

  const start = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART', seed: createSeed() });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  }, []);

  return { state, dispatch, start, restart, pause };
}
