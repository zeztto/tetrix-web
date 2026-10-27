export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrominoType;
  position: Position;
  rotation: RotationState;
}

export type Cell = TetrominoType | null;

export type Board = Cell[][];

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export interface RandomizerState {
  pieces: TetrominoType[];
  index: number;
  seed: number;
}

export interface TetrisState {
  randomizer: RandomizerState;
  board: Board;
  currentPiece: Piece | null;
  nextPieces: TetrominoType[];
  heldPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean;
  gameState: GameState;
}
