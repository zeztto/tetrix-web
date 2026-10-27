import type { Board } from '@/types/game';
import { isRowFull, createEmptyBoard } from './board';

export function findFullRows(board: Board): number[] {
  const fullRows: number[] = [];

  for (let y = 0; y < 20; y++) {
    if (isRowFull(board, y)) {
      fullRows.push(y);
    }
  }

  return fullRows;
}

export function clearLines(board: Board): Board {
  const fullRows = findFullRows(board);

  if (fullRows.length === 0) {
    return board;
  }

  const newBoard = createEmptyBoard();
  let newY = 19;

  for (let y = 19; y >= 0; y--) {
    if (!fullRows.includes(y)) {
      for (let x = 0; x < 10; x++) {
        newBoard[newY][x] = board[y][x];
      }
      newY--;
    }
  }

  return newBoard;
}

export function countClearedLines(board: Board): number {
  return findFullRows(board).length;
}
