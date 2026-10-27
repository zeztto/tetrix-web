import type { Board, Piece, RotationState, Position } from '@/types/game';
import { getWallKickOffsets } from './tetrominos';
import { isValidPosition } from './collision';

export function getRotatedPiece(piece: Piece, direction: 'cw' | 'ccw'): Piece {
  const newRotation: RotationState = direction === 'cw'
    ? ((piece.rotation + 1) % 4) as RotationState
    : ((piece.rotation + 3) % 4) as RotationState;

  return {
    ...piece,
    rotation: newRotation,
  };
}

export function tryWallKicks(
  board: Board,
  piece: Piece,
  newRotation: RotationState,
  offsets: Position[]
): Piece | null {
  if (offsets.length === 0) {
    return null;
  }

  for (const offset of offsets) {
    const testPiece: Piece = {
      type: piece.type,
      rotation: newRotation,
      position: {
        x: piece.position.x + offset.x,
        y: piece.position.y - offset.y,
      },
    };

    if (isValidPosition(board, testPiece)) {
      return testPiece;
    }
  }

  return null;
}

export function rotatePiece(
  board: Board,
  piece: Piece,
  direction: 'cw' | 'ccw'
): Piece {
  const rotatedPiece = getRotatedPiece(piece, direction);
  const offsets = getWallKickOffsets(piece.type, piece.rotation, rotatedPiece.rotation);

  if (offsets.length === 0) {
    if (isValidPosition(board, rotatedPiece)) {
      return rotatedPiece;
    }
    return piece;
  }

  const result = tryWallKicks(board, piece, rotatedPiece.rotation, offsets);
  return result ?? piece;
}
