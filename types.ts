
export interface PuzzlePiece {
  id: number;       // The unique ID of the piece (0 to N-1)
  correctPos: number; // The index where this piece belongs
  currentPos: number | null; // The current grid index (0 to N-1) or null if in the tray
  imageData: string;  // Data URL for this specific piece
  width: number;
  height: number;
  row: number;
  col: number;
}

export interface GameState {
  imageSrc: string;
  pieces: PuzzlePiece[];
  rows: number;
  cols: number;
  isSolved: boolean;
  isPlaying: boolean;
  moves: number;
  secondsElapsed: number;
}

export enum Difficulty {
  EASY = 'かんたん (3x3)',
  MEDIUM = 'ふつう (4x4)',
  HARD = 'むずかしい (5x5)',
  EXPERT = '激ムズ (6x6)'
}

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { rows: 3, cols: 3 },
  [Difficulty.MEDIUM]: { rows: 4, cols: 4 },
  [Difficulty.HARD]: { rows: 5, cols: 5 },
  [Difficulty.EXPERT]: { rows: 6, cols: 6 },
};

export enum AppMode {
  WELCOME = 'WELCOME',
  MENU = 'MENU',
  GAME = 'GAME'
}