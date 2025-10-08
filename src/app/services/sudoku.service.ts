import { Injectable } from '@angular/core';
import { Difficulty, Puzzle, SizeKey, SudokuConfig } from '../models/sudoku';

@Injectable({ providedIn: 'root' })
export class SudokuService {
  private configs: Record<SizeKey, SudokuConfig> = {
    '4x4': { size: 4, boxR: 2, boxC: 2, symbols: [1, 2, 3, 4] },
    '6x6': { size: 6, boxR: 2, boxC: 3, symbols: [1, 2, 3, 4, 5, 6] },
    '9x9': { size: 9, boxR: 3, boxC: 3, symbols: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  };

  getConfig(key: SizeKey): SudokuConfig {
    return this.configs[key];
  }

  newPuzzle(sizeKey: SizeKey, difficulty: Difficulty): Puzzle {
    const cfg = this.getConfig(sizeKey);
    const full = this.makeSolved(cfg);
    const grid = this.carve(full, cfg, difficulty);
    return { sizeKey, config: cfg, grid, solution: full };
  }

  clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
  }

  // ---------- Solver (backtracking) ----------
  private makeSolved(cfg: SudokuConfig): number[][] {
    const grid: number[][] = Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0));
    this.solveRecursive(grid, cfg);
    return grid;
  }

  private solveRecursive(grid: number[][], cfg: SudokuConfig): boolean {
    const n = cfg.size;
    let r = -1, c = -1, found = false;

    for (let i = 0; i < n && !found; i++) {
      for (let j = 0; j < n && !found; j++) {
        if (grid[i][j] === 0) { r = i; c = j; found = true; }
      }
    }
    if (!found) return true;

    const candidates = this.shuffle(cfg.symbols.slice());
    for (const val of candidates) {
      if (this.isSafe(grid, r, c, val, cfg)) {
        grid[r][c] = val;
        if (this.solveRecursive(grid, cfg)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  private isSafe(grid: number[][], r: number, c: number, val: number, cfg: SudokuConfig): boolean {
    const n = cfg.size, br = cfg.boxR, bc = cfg.boxC;
    for (let i = 0; i < n; i++) {
      if (grid[r][i] === val || grid[i][c] === val) return false;
    }
    const r0 = Math.floor(r / br) * br;
    const c0 = Math.floor(c / bc) * bc;
    for (let i = 0; i < br; i++) {
      for (let j = 0; j < bc; j++) {
        if (grid[r0 + i][c0 + j] === val) return false;
      }
    }
    return true;
  }

  private shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Generación con unicidad ----------
  private carve(full: number[][], cfg: SudokuConfig, difficulty: Difficulty): (number | null)[][] {
    const n = cfg.size;
    const grid: (number | null)[][] = full.map(row => row.map(v => v as number | null));

    const clueTarget: Record<Difficulty, number> = {
      'Fácil': Math.ceil(n * n * 0.55),
      'Media': Math.ceil(n * n * 0.45),
      'Difícil': Math.ceil(n * n * 0.38),
      'Experto': Math.ceil(n * n * 0.32),
    };

    const cells = Array.from({ length: n * n }, (_, k) => k);
    this.shuffle(cells);

    const minClues = clueTarget[difficulty];
    for (const idx of cells) {
      const r = Math.floor(idx / n), c = idx % n;
      const backup = grid[r][c];
      if (backup === null) continue;
      grid[r][c] = null;

      if (!this.hasUniqueSolution(grid, cfg)) {
        grid[r][c] = backup; // revertimos si perdemos unicidad
      }

      const cluesLeft = grid.flat().filter(v => v !== null).length;
      if (cluesLeft <= minClues) break;
    }
    return grid;
  }

  private hasUniqueSolution(grid: (number | null)[][], cfg: SudokuConfig): boolean {
    const work: number[][] = grid.map(r => r.map(v => v ?? 0));
    let count = 0;

    const dfs = (g: number[][]): void => {
      if (count > 1) return;
      const n = cfg.size;
      let r = -1, c = -1, found = false;

      for (let i = 0; i < n && !found; i++) {
        for (let j = 0; j < n && !found; j++) {
          if (g[i][j] === 0) { r = i; c = j; found = true; }
        }
      }
      if (!found) { count++; return; }

      for (const val of cfg.symbols) {
        if (this.isSafe(g, r, c, val, cfg)) {
          g[r][c] = val;
          dfs(g);
          g[r][c] = 0;
          if (count > 1) return;
        }
      }
    };

    dfs(work);
    return count === 1;
  }

  // ---------- Helpers públicos ----------
  isValidMove(grid: (number | null)[][], r: number, c: number, val: number | null, cfg: SudokuConfig): boolean {
    if (val === null) return true;
    const temp = grid.map(row => row.slice());
    temp[r][c] = 0; // ignorar el propio valor al validar
    return this.isSafe(temp as number[][], r, c, val, cfg);
  }

  checkConflicts(grid: (number | null)[][], cfg: SudokuConfig): boolean[][] {
    const n = cfg.size;
    const bad: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = grid[r][c];
        if (v == null) continue;
        const ok = this.isValidMove(grid, r, c, v, cfg);
        bad[r][c] = !ok;
      }
    }
    return bad;
  }

  giveHint(grid: (number | null)[][], solution: number[][]): { r: number, c: number, val: number } | null {
    const empties: { r: number, c: number }[] = [];
    const n = grid.length;

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] == null) empties.push({ r, c });
      }
    }
    if (empties.length === 0) return null;

    const k = Math.floor(Math.random() * empties.length);
    const { r, c } = empties[k];
    return { r, c, val: solution[r][c] };
  }
}
