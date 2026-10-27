import type { TetrominoType } from '@/types/game';
import { getTetrominoShape, getTetrominoColor } from '@/lib/tetrominos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NextQueueProps {
  nextPieces: TetrominoType[];
}

function MiniPiece({ type }: { type: TetrominoType }) {
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
      className="grid gap-0.5"
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
              backgroundColor: cell ? color : 'transparent',
              boxShadow: cell ? 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.2)' : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}

export function NextQueue({ nextPieces }: NextQueueProps) {
  return (
    <Card className="w-20">
      <CardHeader className="p-2 pb-1">
        <CardTitle className="text-xs text-center font-bold text-neutral-600">다음</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 flex flex-col items-center gap-2">
        {nextPieces.slice(0, 3).map((type, i) => (
          <div key={i} className="h-12 flex items-center justify-center">
            <MiniPiece type={type} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
