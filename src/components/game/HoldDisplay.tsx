import type { TetrominoType } from '@/types/game';
import { getTetrominoShape, getTetrominoColor } from '@/lib/tetrominos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HoldDisplayProps {
  heldPiece: TetrominoType | null;
  canHold: boolean;
}

function MiniPiece({ type, disabled }: { type: TetrominoType; disabled?: boolean }) {
  const shape = getTetrominoShape(type, 0);
  const color = getTetrominoColor(type);

  let minX = shape[0].length;
  let maxX = 0;
  let minY = shape.length;
  let maxY = 0;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  return (
    <div
      className={cn('grid gap-0.5', disabled && 'opacity-40')}
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        width: width * 14,
        height: height * 14,
      }}
    >
      {shape.slice(minY, maxY + 1).flatMap((row, y) =>
        row.slice(minX, maxX + 1).map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: 12,
              height: 12,
              backgroundColor: cell ? (disabled ? '#999' : color) : 'transparent',
              boxShadow: cell ? 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.2)' : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}

export function HoldDisplay({ heldPiece, canHold }: HoldDisplayProps) {
  return (
    <Card className="w-20">
      <CardHeader className="p-2 pb-1">
        <CardTitle className="text-xs text-center font-bold text-neutral-600">홀드</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 h-12 flex items-center justify-center">
        {heldPiece ? (
          <MiniPiece type={heldPiece} disabled={!canHold} />
        ) : (
          <div className="w-14 h-10 border border-dashed border-neutral-300 rounded" />
        )}
      </CardContent>
    </Card>
  );
}
