import type { Board, Piece } from '@/types/game';
import { getTetrominoShape } from './tetrominos';

export function isValidPosition(board: Board, piece: Piece): boolean {
  const shape = getTetrominoShape(piece.type, piece.rotation);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;

        if (boardX < 0 || boardX >= 10 || boardY >= 20) {
          return false;
        }

        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

export function canMoveLeft(board: Board, piece: Piece): boolean {
  const newPiece: Piece = {
    ...piece,
    position: { ...piece.position, x: piece.position.x - 1 },
  };
  return isValidPosition(board, newPiece);
}

export function canMoveRight(board: Board, piece: Piece): boolean {
  const newPiece: Piece = {
    ...piece,
    position: { ...piece.position, x: piece.position.x + 1 },
  };
  return isValidPosition(board, newPiece);
}

export function canMoveDown(board: Board, piece: Piece): boolean {
  const newPiece: Piece = {
    ...piece,
    position: { ...piece.position, y: piece.position.y + 1 },
  };
  return isValidPosition(board, newPiece);
}

export function getGhostPosition(board: Board, piece: Piece): number {
  let ghostY = piece.position.y;

  while (true) {
    const testPiece: Piece = {
      ...piece,
      position: { ...piece.position, y: ghostY + 1 },
    };

    if (!isValidPosition(board, testPiece)) {
      break;
    }

    ghostY++;
  }

  return ghostY;
}
