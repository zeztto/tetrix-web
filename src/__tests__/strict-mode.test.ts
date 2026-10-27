import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGameLoop } from '../hooks/useGameLoop';

describe('StrictMode piece transitions', () => {
  it('consumes one previewed piece per start and hold action', () => {
    const { result } = renderHook(useGameLoop, { wrapper: StrictMode });
    const firstPiece = result.current.state.nextPieces[0];
    act(() => result.current.start());
    expect(result.current.state.currentPiece?.type).toBe(firstPiece);
    const nextPiece = result.current.state.nextPieces[0];
    act(() => result.current.dispatch({ type: 'HOLD' }));
    expect(result.current.state.currentPiece?.type).toBe(nextPiece);
    expect(result.current.state.heldPiece).toBe(firstPiece);
  });

  it('does not disturb a second mounted game', () => {
    const first = renderHook(useGameLoop, { wrapper: StrictMode });
    const second = renderHook(useGameLoop, { wrapper: StrictMode });
    const expected = second.result.current.state.nextPieces[0];
    act(() => first.result.current.start());
    act(() => first.result.current.dispatch({ type: 'HOLD' }));
    act(() => second.result.current.start());
    expect(second.result.current.state.currentPiece?.type).toBe(expected);
  });
});
