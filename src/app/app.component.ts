import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { ControlsComponent } from './componentes/controls/controls.component';
import { SudokuBoardComponent } from './componentes/sudoku-board/sudoku-board.component';
import { Difficulty, SizeKey } from './models/sudoku';
import { SudokuService } from './services/sudoku.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ControlsComponent, SudokuBoardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sizeKey = signal<SizeKey>('9x9');
  difficulty = signal<Difficulty>('Media');

  grid = signal<(number | null)[][]>([]);
  solution = signal<number[][]>([]);
  givenMask = signal<boolean[][]>([]);
  invalidMask = signal<boolean[][]>([]);

  solved = computed(() => this.grid().flat().every(v => v !== null));

  constructor(public sdk: SudokuService) {
    this.newGame();
    effect(() => { this.sizeKey(); this.difficulty(); });
  }

  private createGivenMask(g: (number | null)[][]): boolean[][] {
    return g.map(row => row.map(v => v !== null));
  }

  newGame(): void {
    const p = this.sdk.newPuzzle(this.sizeKey(), this.difficulty());
    this.grid.set(p.grid);
    this.solution.set(p.solution);
    this.givenMask.set(this.createGivenMask(p.grid));
    this.invalidMask.set(p.grid.map(r => r.map(() => false)));
  }

  onChangeCell(e: { r: number, c: number, val: number | null }): void {
    const g = this.grid().map(row => row.slice());
    if (this.givenMask()[e.r][e.c]) return;
    g[e.r][e.c] = e.val;
    this.grid.set(g);
  }

  onAction(act: 'nuevo' | 'revisar' | 'pista' | 'solucion' | 'limpiar'): void {
    if (act === 'nuevo') { this.newGame(); return; }

    if (act === 'revisar') {
      const bad = this.sdk.checkConflicts(this.grid(), this.sdk.getConfig(this.sizeKey()));
      this.invalidMask.set(bad);
      return;
    }

    if (act === 'pista') {
      const hint = this.sdk.giveHint(this.grid(), this.solution());
      if (!hint) return;
      const g = this.grid().map(row => row.slice());
      g[hint.r][hint.c] = hint.val;
      this.grid.set(g);
      return;
    }

    if (act === 'solucion') {
      const sol = this.solution();
      const g = sol.map(r => r.map(v => v as number | null));
      this.grid.set(g);
      return;
    }

    if (act === 'limpiar') {
      const g = this.grid().map(row => row.slice());
      const given = this.givenMask();
      for (let r = 0; r < g.length; r++) {
        for (let c = 0; c < g.length; c++) {
          if (!given[r][c]) g[r][c] = null;
        }
      }
      this.grid.set(g);
      this.invalidMask.set(g.map(row => row.map(() => false)));
      return;
    }
  }

  onSizeKeyChange(k: SizeKey): void {
    this.sizeKey.set(k);
    this.newGame();
  }

  onDifficultyChange(d: Difficulty): void {
    this.difficulty.set(d);
    this.newGame();
  }
}
