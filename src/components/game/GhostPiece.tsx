import type { Piece as PieceType } from '@/types/game';
import { Piece } from './Piece';

interface GhostPieceProps {
  piece: PieceType;
  ghostY: number;
  cellSize: number;
}

export function GhostPiece({ piece, ghostY, cellSize }: GhostPieceProps) {
  const ghostPiece: PieceType = {
    ...piece,
    position: {
      ...piece.position,
      y: ghostY,
    },
  };

  return <Piece piece={ghostPiece} cellSize={cellSize} opacity={0.3} />;
}
