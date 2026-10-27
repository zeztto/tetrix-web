import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { getGhostPosition } from '@/lib/collision';
import { Board } from './game/Board';
import { Piece } from './game/Piece';
import { GhostPiece } from './game/GhostPiece';
import { NextQueue } from './game/NextQueue';
import { HoldDisplay } from './game/HoldDisplay';
import { ScoreBoard } from './game/ScoreBoard';
import { Controls } from './game/Controls';
import { GameOver } from './game/GameOver';
import { Leaderboard } from './game/Leaderboard';
import { Button } from './ui/button';

const CELL_SIZE = 24;
const BOARD_GAP = 1;

export function Tetris() {
  const { state, dispatch, start, restart, pause } = useGameLoop();
  const { leaderboard, addScore, checkHighScore } = useLeaderboard();
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const showGameOver = state.gameState === 'gameover' && !gameOverDismissed;

  useKeyboard({
    dispatch,
    enabled: state.gameState === 'playing',
  });

  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const boardWidth = boardRef.current.offsetWidth;
        const newCellSize = Math.floor((boardWidth - 9 * BOARD_GAP) / 10);
        setCellSize(newCellSize);
      }
    };

    const initialFrame = requestAnimationFrame(updateCellSize);
    window.addEventListener('resize', updateCellSize);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener('resize', updateCellSize);
    };
  }, []);

  const handleRestart = () => {
    setGameOverDismissed(false);
    restart();
  };

  const handleSaveName = (name: string) => {
    return addScore({
      name,
      score: state.score,
      level: state.level,
      lines: state.lines,
    });
  };

  const handleViewLeaderboard = () => {
    setGameOverDismissed(true);
    setShowLeaderboard(true);
  };

  const ghostY = state.currentPiece
    ? getGhostPosition(state.board, state.currentPiece)
    : 0;

  const isPlaying = state.gameState === 'playing';
  const isPaused = state.gameState === 'paused';
  const isIdle = state.gameState === 'idle';

  return (
    <div className="flex flex-col min-h-screen touch-manipulation">
      <header className="py-4 px-4">
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <div className="w-9 h-9 grid grid-cols-2 gap-0.5">
            <div className="bg-cyan-400 rounded-sm" />
            <div className="bg-purple-600 rounded-sm" />
            <div className="bg-yellow-400 rounded-sm" />
            <div className="bg-red-500 rounded-sm" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800">TETRIX</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-44">
        <div className="flex gap-2 items-stretch w-full max-w-md">
          <div className="flex-1 relative" ref={boardRef}>
            <Board board={state.board} />

            {state.currentPiece && (
              <div className="absolute inset-0 pointer-events-none">
                <GhostPiece
                  piece={state.currentPiece}
                  ghostY={ghostY}
                  cellSize={cellSize}
                />
                <Piece piece={state.currentPiece} cellSize={cellSize} />
              </div>
            )}

            {(isPaused || isIdle) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <div className="text-center space-y-3">
                  {isIdle && (
                    <>
                      <Button onClick={start} size="lg" className="text-xl w-full">
                        시작
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowLeaderboard(true)}
                        className="w-full"
                      >
                        <Trophy aria-hidden="true" /> 순위표
                      </Button>
                    </>
                  )}
                  {isPaused && (
                    <div className="space-y-2">
                      <div className="text-white text-2xl font-bold mb-4">일시정지</div>
                      <Button onClick={pause} size="lg">
                        계속하기
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-20">
            <ScoreBoard score={state.score} level={state.level} lines={state.lines} />
            <div className="flex-1" />
            <HoldDisplay heldPiece={state.heldPiece} canHold={state.canHold} />
            <NextQueue nextPieces={state.nextPieces} />
          </div>
        </div>

        {isPlaying && (
          <Button variant="ghost" size="sm" onClick={pause} className="text-neutral-500 mt-2">
            일시정지 (P)
          </Button>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 pb-safe">
        <div className="max-w-md mx-auto">
          <Controls dispatch={dispatch} disabled={!isPlaying} />
        </div>
      </footer>

      <GameOver
        open={showGameOver}
        score={state.score}
        level={state.level}
        lines={state.lines}
        isHighScore={checkHighScore(state.score)}
        onRestart={handleRestart}
        onSaveName={handleSaveName}
        onViewLeaderboard={handleViewLeaderboard}
      />

      <Leaderboard
        open={showLeaderboard}
        onClose={() => {
          setShowLeaderboard(false);
          setGameOverDismissed(false);
        }}
        leaderboard={leaderboard}
      />
    </div>
  );
}
