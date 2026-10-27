import type { Piece as PieceType } from '@/types/game';
import { getTetrominoShape, getTetrominoColor } from '@/lib/tetrominos';

interface PieceProps {
  piece: PieceType;
  cellSize: number;
  opacity?: number;
}

export function Piece({ piece, cellSize, opacity = 1 }: PieceProps) {
  const shape = getTetrominoShape(piece.type, piece.rotation);
  const color = getTetrominoColor(piece.type);

  const blocks: { x: number; y: number }[] = [];
  shape.forEach((row, dy) => {
    row.forEach((cell, dx) => {
      if (cell) {
        blocks.push({
          x: piece.position.x + dx,
          y: piece.position.y + dy,
        });
      }
    });
  });

  return (
    <>
      {blocks.map(({ x, y }, i) => {
        if (y < 0) return null;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              width: cellSize,
              height: cellSize,
              left: x * cellSize + x,
              top: y * cellSize + y,
              backgroundColor: color,
              opacity,
              boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.2)',
            }}
          />
        );
      })}
    </>
  );
}
