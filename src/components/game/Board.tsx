import type { Board as BoardType } from '@/types/game';
import { getTetrominoColor } from '@/lib/tetrominos';
import { cn } from '@/lib/utils';

interface BoardProps {
  board: BoardType;
  className?: string;
}

export function Board({ board, className }: BoardProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-10 gap-px bg-neutral-300 border-2 border-neutral-400 rounded',
        className
      )}
      style={{
        aspectRatio: '10 / 20',
      }}
    >
      {board.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="aspect-square"
            style={{
              backgroundColor: cell ? getTetrominoColor(cell) : '#f5f5f5',
              boxShadow: cell ? 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.2)' : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}
