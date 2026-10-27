import { useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Archive, ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, RotateCcw, RotateCw } from 'lucide-react';
import type { GameAction } from '@/hooks/useGameLoop';

interface ControlsProps {
  dispatch: React.Dispatch<GameAction>;
  disabled?: boolean;
}

const DAS = 133;
const ARR = 50;

export function Controls({ dispatch, disabled = false }: ControlsProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled) clearTimers();
    return () => clearTimers();
  }, [clearTimers, disabled]);

  const handlePressStart = useCallback(
    (action: GameAction, repeat = false) => {
      if (disabled) return;
      clearTimers();
      dispatch(action);

      if (repeat) {
        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            dispatch(action);
          }, ARR);
        }, DAS);
      }
    },
    [dispatch, disabled, clearTimers]
  );

  const handlePressEnd = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const createButtonHandlers = (action: GameAction, repeat = false) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      handlePressStart(action, repeat);
    },
    onPointerUp: handlePressEnd,
    onPointerCancel: handlePressEnd,
    onLostPointerCapture: handlePressEnd,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0) handlePressStart(action);
    },
  });

  return (
    <div className="flex justify-between select-none touch-none">
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 text-2xl"
          disabled={disabled}
          aria-label="홀드"
          title="홀드"
          {...createButtonHandlers({ type: 'HOLD' })}
        >
          <Archive aria-hidden="true" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="왼쪽 이동"
            title="왼쪽 이동"
            {...createButtonHandlers({ type: 'MOVE_LEFT' }, true)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="오른쪽 이동"
            title="오른쪽 이동"
            {...createButtonHandlers({ type: 'MOVE_RIGHT' }, true)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="왼쪽 회전"
            title="왼쪽 회전"
            {...createButtonHandlers({ type: 'ROTATE_CCW' })}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="오른쪽 회전"
            title="오른쪽 회전"
            {...createButtonHandlers({ type: 'ROTATE_CW' })}
          >
            <RotateCw aria-hidden="true" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="소프트 드롭"
            title="소프트 드롭"
            {...createButtonHandlers({ type: 'SOFT_DROP' }, true)}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button
            variant="default"
            size="lg"
            className="w-14 h-14 text-2xl"
            disabled={disabled}
            aria-label="하드 드롭"
            title="하드 드롭"
            {...createButtonHandlers({ type: 'HARD_DROP' })}
          >
            <ChevronsDown aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
