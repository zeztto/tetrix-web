import type { Board, Piece } from '@/types/game';

const LINE_CLEAR_BASE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const TSPIN_BASE: Record<number, number> = {
  1: 800,
  2: 1200,
  3: 1600,
};

export function calculateLineClearScore(
  lines: number,
  level: number,
  backToBack: boolean,
  combo: number
): number {
  const base = (LINE_CLEAR_BASE[lines] ?? 0) * level;
  const b2bMultiplier = backToBack ? 1.5 : 1;
  const comboBonus = 50 * combo * level;

  return Math.floor(base * b2bMultiplier) + comboBonus;
}

export function calculateTSpinScore(
  lines: number,
  level: number,
  backToBack: boolean
): number {
  const base = (TSPIN_BASE[lines] ?? 0) * level;
  const b2bMultiplier = backToBack ? 1.5 : 1;

  return Math.floor(base * b2bMultiplier);
}

export function calculateDropScore(
  cells: number,
  type: 'soft' | 'hard'
): number {
  return type === 'hard' ? cells * 2 : cells;
}

export function calculateLevel(totalLines: number): number {
  const level = Math.floor(totalLines / 10) + 1;
  return Math.min(level, 15);
}

export function detectTSpin(
  board: Board,
  piece: Piece,
  lastAction: 'rotate' | 'move' | 'drop'
): boolean {
  if (piece.type !== 'T') {
    return false;
  }

  if (lastAction !== 'rotate') {
    return false;
  }

  const { x, y } = piece.position;

  const corners = [
    { dx: 0, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: 2, dy: 2 },
  ];

  let filledCorners = 0;

  for (const corner of corners) {
    const cx = x + corner.dx;
    const cy = y + corner.dy;

    const isOutOfBounds = cx < 0 || cx >= 10 || cy < 0 || cy >= 20;
    const isFilled = !isOutOfBounds && board[cy]?.[cx] !== null;

    if (isOutOfBounds || isFilled) {
      filledCorners++;
    }
  }

  return filledCorners >= 3;
}
