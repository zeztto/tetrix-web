/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from '../hooks/useGameLoop';

describe('useGameLoop', () => {
  it('should create initial state', () => {
    const { result } = renderHook(() => useGameLoop());

    expect(result.current.state.gameState).toBe('idle');
    expect(result.current.state.currentPiece).toBeNull();
    expect(result.current.state.score).toBe(0);
    expect(result.current.state.level).toBe(1);
  });

  it('should start game when start is called', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    expect(result.current.state.gameState).toBe('playing');
    expect(result.current.state.currentPiece).not.toBeNull();
  });

  it('should restart game when restart is called', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.dispatch({ type: 'MOVE_LEFT' });
      result.current.dispatch({ type: 'MOVE_LEFT' });
    });

    act(() => {
      result.current.restart();
    });

    expect(result.current.state.gameState).toBe('playing');
    expect(result.current.state.score).toBe(0);
  });

  it('should toggle pause', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    expect(result.current.state.gameState).toBe('playing');

    act(() => {
      result.current.pause();
    });

    expect(result.current.state.gameState).toBe('paused');

    act(() => {
      result.current.pause();
    });

    expect(result.current.state.gameState).toBe('playing');
  });

  it('should move piece left on MOVE_LEFT', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    const initialX = result.current.state.currentPiece!.position.x;

    act(() => {
      result.current.dispatch({ type: 'MOVE_LEFT' });
    });

    expect(result.current.state.currentPiece!.position.x).toBe(initialX - 1);
  });

  it('should move piece right on MOVE_RIGHT', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    const initialX = result.current.state.currentPiece!.position.x;

    act(() => {
      result.current.dispatch({ type: 'MOVE_RIGHT' });
    });

    expect(result.current.state.currentPiece!.position.x).toBe(initialX + 1);
  });

  it('should rotate piece on ROTATE_CW', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    const initialRotation = result.current.state.currentPiece!.rotation;

    act(() => {
      result.current.dispatch({ type: 'ROTATE_CW' });
    });

    expect(result.current.state.currentPiece!.rotation).toBe((initialRotation + 1) % 4);
  });

  it('should not process actions when paused', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    const positionBeforePause = result.current.state.currentPiece!.position.x;

    act(() => {
      result.current.dispatch({ type: 'MOVE_LEFT' });
    });

    expect(result.current.state.currentPiece!.position.x).toBe(positionBeforePause);
  });

  it('should hard drop and spawn new piece', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.dispatch({ type: 'HARD_DROP' });
    });

    expect(result.current.state.currentPiece).not.toBeNull();
    expect(result.current.state.score).toBeGreaterThan(0);
  });

  it('should hold piece', () => {
    const { result } = renderHook(() => useGameLoop());

    act(() => {
      result.current.start();
    });

    const currentType = result.current.state.currentPiece!.type;

    act(() => {
      result.current.dispatch({ type: 'HOLD' });
    });

    expect(result.current.state.heldPiece).toBe(currentType);
    expect(result.current.state.canHold).toBe(false);
  });
});
