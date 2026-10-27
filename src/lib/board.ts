import type { Board, Cell, Piece } from '@/types/game';
import { getTetrominoShape } from './tetrominos';

export function createEmptyBoard(): Board {
  return Array.from({ length: 20 }, () => Array(10).fill(null));
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function getCellAt(board: Board, x: number, y: number): Cell {
  if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) {
    return null;
  }
  return board[y][x];
}

export function setCellAt(board: Board, x: number, y: number, value: Cell): Board {
  const newBoard = cloneBoard(board);
  if (y >= 0 && y < newBoard.length && x >= 0 && x < newBoard[0].length) {
    newBoard[y][x] = value;
  }
  return newBoard;
}

export function mergePieceToBoard(board: Board, piece: Piece): Board {
  const newBoard = cloneBoard(board);
  const shape = getTetrominoShape(piece.type, piece.rotation);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;

        if (boardY >= 0 && boardY < newBoard.length &&
            boardX >= 0 && boardX < newBoard[0].length) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

export function isRowFull(board: Board, row: number): boolean {
  if (row < 0 || row >= board.length) {
    return false;
  }
  return board[row].every(cell => cell !== null);
}

export function isRowEmpty(board: Board, row: number): boolean {
  if (row < 0 || row >= board.length) {
    return false;
  }
  return board[row].every(cell => cell === null);
}
