import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { Controls } from '../components/game/Controls';
import { GameOver } from '../components/game/GameOver';
import { useKeyboard } from '../hooks/useKeyboard';
import { Tetris } from '../components/Tetris';
import * as gameLoop from '../hooks/useGameLoop';
import { createInitialState } from '../lib/engine';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('input controls', () => {
  it('accepts keyboard-activated control buttons', () => {
    const dispatch = vi.fn();
    render(<Controls dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: '하드 드롭' }), { detail: 0 });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'HARD_DROP' });
  });

  it('stops pointer repeat after cancellation and disable', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const { rerender } = render(<Controls dispatch={dispatch} />);
    const left = screen.getByRole('button', { name: '왼쪽 이동' });
    fireEvent.pointerDown(left, { pointerId: 1, pointerType: 'touch' });
    act(() => vi.advanceTimersByTime(200));
    expect(dispatch.mock.calls.length).toBeGreaterThan(1);
    fireEvent.pointerCancel(left);
    const count = dispatch.mock.calls.length;
    act(() => vi.advanceTimersByTime(500));
    expect(dispatch).toHaveBeenCalledTimes(count);
    fireEvent.pointerDown(left, { pointerId: 2, pointerType: 'touch' });
    rerender(<Controls dispatch={dispatch} disabled />);
    const disabledCount = dispatch.mock.calls.length;
    act(() => vi.advanceTimersByTime(500));
    expect(dispatch).toHaveBeenCalledTimes(disabledCount);
  });

  it('allows pause keyboard shortcuts to resume while movement is disabled', () => {
    const dispatch = vi.fn();
    renderHook(() => useKeyboard({ dispatch, enabled: false }));
    fireEvent.keyDown(window, { code: 'ArrowLeft' });
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { code: 'KeyP' });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'TOGGLE_PAUSE' });
  });

  it('does not intercept text-field input or keep repeating after window blur', () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    renderHook(() => useKeyboard({ dispatch, enabled: true }));
    render(<input aria-label="이름" />);
    fireEvent.keyDown(screen.getByRole('textbox'), { code: 'KeyP' });
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { code: 'ArrowLeft' });
    fireEvent.blur(window);
    act(() => vi.advanceTimersByTime(500));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('keeps focused control Space activation native instead of hard-dropping', () => {
    const dispatch = vi.fn();
    renderHook(() => useKeyboard({ dispatch, enabled: true }));
    render(<Controls dispatch={dispatch} />);
    const left = screen.getByRole('button', { name: '왼쪽 이동' });
    left.focus();
    const event = new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true });
    left.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
    fireEvent.click(left, { detail: 0 });
    expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: 'MOVE_LEFT' });
  });
});

describe('score persistence result', () => {
  it('reports failure instead of claiming a rejected save succeeded', () => {
    render(<GameOver open score={100} level={1} lines={0} isHighScore
      onRestart={vi.fn()} onSaveName={() => false} onViewLeaderboard={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('이름을 입력하세요'), { target: { value: 'Player' } });
    fireEvent.click(screen.getByRole('button', { name: '점수 저장' }));
    expect(screen.getByRole('alert')).toHaveTextContent('저장하지 못했습니다');
    expect(screen.queryByText('점수 저장 완료!')).not.toBeInTheDocument();
  });

  it('restores the game-over restart route after viewing and closing leaderboard', () => {
    vi.spyOn(gameLoop, 'useGameLoop').mockReturnValue({
      state: { ...createInitialState(42), gameState: 'gameover' },
      dispatch: vi.fn(), start: vi.fn(), restart: vi.fn(), pause: vi.fn(),
    });
    render(<Tetris />);
    fireEvent.click(screen.getByRole('button', { name: '순위표 보기' }));
    expect(screen.queryByRole('button', { name: '다시 하기' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByRole('button', { name: '다시 하기' })).toBeInTheDocument();
  });
});
