export type SizeKey = '4x4' | '6x6' | '9x9';
export type Difficulty = 'Fácil' | 'Media' | 'Difícil' | 'Experto';


export interface SudokuConfig {
  size: number; // 4, 6, 9
  boxR: number; // filas por bloque
  boxC: number; // cols por bloque
  symbols: number[]; // [1..n]
}


export interface Cell {
  r: number; c: number; value: number | null; given: boolean;
}


export interface Puzzle {
  sizeKey: SizeKey; config: SudokuConfig; grid: (number | null)[][]; solution: number[][];
}
