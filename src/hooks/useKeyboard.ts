import { useEffect, useCallback, useRef } from 'react';
import type { GameAction } from './useGameLoop';

interface UseKeyboardOptions {
  dispatch: React.Dispatch<GameAction>;
  enabled?: boolean;
}

const KEY_MAP: Record<string, GameAction['type']> = {
  ArrowLeft: 'MOVE_LEFT',
  ArrowRight: 'MOVE_RIGHT',
  ArrowDown: 'SOFT_DROP',
  ArrowUp: 'ROTATE_CW',
  KeyX: 'ROTATE_CW',
  KeyZ: 'ROTATE_CCW',
  Space: 'HARD_DROP',
  KeyC: 'HOLD',
  ShiftLeft: 'HOLD',
  ShiftRight: 'HOLD',
  KeyP: 'TOGGLE_PAUSE',
  Escape: 'TOGGLE_PAUSE',
};

const DAS = 133;
const ARR = 10;

export function useKeyboard({ dispatch, enabled = true }: UseKeyboardOptions) {
  const pressedKeys = useRef<Set<string>>(new Set());
  const dasTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const arrIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const clearKeyTimers = useCallback((code: string) => {
    const dasTimer = dasTimers.current.get(code);
    if (dasTimer) {
      clearTimeout(dasTimer);
      dasTimers.current.delete(code);
    }

    const arrInterval = arrIntervals.current.get(code);
    if (arrInterval) {
      clearInterval(arrInterval);
      arrIntervals.current.delete(code);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const actionType = KEY_MAP[e.code];
      if (!actionType) return;
      if (!enabled && actionType !== 'TOGGLE_PAUSE') return;
      const target = e.target;
      if (target instanceof HTMLElement
        && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (target instanceof Element && (e.code === 'Space' || e.code === 'Enter')
        && target.closest('button, a[href], summary, [role="button"], [role="link"]')) return;

      e.preventDefault();

      if (pressedKeys.current.has(e.code)) return;
      pressedKeys.current.add(e.code);

      dispatch({ type: actionType } as GameAction);

      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        const dasTimer = setTimeout(() => {
          if (pressedKeys.current.has(e.code)) {
            const arrInterval = setInterval(() => {
              if (pressedKeys.current.has(e.code)) {
                dispatch({ type: actionType } as GameAction);
              }
            }, ARR);
            arrIntervals.current.set(e.code, arrInterval);
          }
        }, DAS);
        dasTimers.current.set(e.code, dasTimer);
      }
    },
    [dispatch, enabled]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!KEY_MAP[e.code]) return;

      pressedKeys.current.delete(e.code);
      clearKeyTimers(e.code);
    },
    [clearKeyTimers]
  );

  useEffect(() => {
    const keys = pressedKeys.current;
    const timeouts = dasTimers.current;
    const intervals = arrIntervals.current;
    const reset = () => {
      keys.clear();
      timeouts.forEach((timer) => clearTimeout(timer));
      intervals.forEach((interval) => clearInterval(interval));
      timeouts.clear();
      intervals.clear();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', reset);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', reset);
      reset();
    };
  }, [handleKeyDown, handleKeyUp]);
}
