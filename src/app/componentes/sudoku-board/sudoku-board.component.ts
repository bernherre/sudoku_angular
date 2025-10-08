import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SudokuConfig } from '../../models/sudoku';

@Component({
  selector: 'sudoku-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board-wrap" [ngClass]="{
      'block-border-9x9': cfg.size===9,
      'block-border-6x6': cfg.size===6,
      'block-border-4x4': cfg.size===4
    }">
      <div class="sudoku" [class.small]="cfg.size===4" [class.medium]="cfg.size===6" [class.large]="cfg.size===9">
        <div *ngFor="let row of grid; let r = index">
          <div *ngFor="let cell of row; let c = index"
               class="cell"
               [class.given]="givenMask[r][c]"
               [class.invalid]="invalidMask[r][c]">
            <input [readOnly]="givenMask[r][c]"
                   [value]="cell ?? ''"
                   (input)="onInput(r,c,$event)"
                   inputmode="numeric" pattern="[0-9]*" maxlength="1" />
          </div>
        </div>
      </div>
      <div class="legend">Consejo: usa 1-9 (o 1-6 / 1-4). Las celdas en rojo tienen conflicto.</div>
    </div>
  `,
  styles: [`
    .board-wrap{ display:inline-block; }
    .sudoku{ display:grid; gap:0; }
    .sudoku > div{ display: contents; }
  `]
})
export class SudokuBoardComponent {
  @Input() grid: (number | null)[][] = [];
  @Input() givenMask: boolean[][] = [];
  @Input() invalidMask: boolean[][] = [];
  @Input() cfg!: SudokuConfig;

  @Output() changeCell = new EventEmitter<{ r: number, c: number, val: number | null }>();
  @Output() hoverCell = new EventEmitter<{ r: number, c: number } | null>();

  onInput(r: number, c: number, e: Event) {
    const el = e.target as HTMLInputElement;
    const val = el.value.trim() === '' ? null : Number(el.value);
    if (val === null || this.cfg.symbols.includes(val)) {
      this.changeCell.emit({ r, c, val });
    } else {
      el.value = '';
      this.changeCell.emit({ r, c, val: null });
    }
  }
}
