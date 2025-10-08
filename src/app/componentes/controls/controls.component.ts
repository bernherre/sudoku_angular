import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Difficulty, SizeKey } from '../../models/sudoku';

@Component({
  selector: 'sudoku-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel controls">
      <div class="brand">
        <div class="dot"></div>
        <h1>Sudoku Angular</h1>
      </div>

      <label>
        Tamaño
        <select #sizeSel class="select" [value]="sizeKey" (change)="onSizeChange(sizeSel.value)">
          <option value="4x4">4x4</option>
          <option value="6x6">6x6</option>
          <option value="9x9">9x9</option>
        </select>
      </label>

      <label>
        Dificultad
        <select #diffSel class="select" [value]="difficulty" (change)="onDifficultyChange(diffSel.value)">
          <option value="Fácil">Fácil</option>
          <option value="Media">Media</option>
          <option value="Difícil">Difícil</option>
          <option value="Experto">Experto</option>
        </select>
      </label>

      <button class="btn primary" (click)="action.emit('nuevo')">Nuevo</button>
      <button class="btn" (click)="action.emit('revisar')">Revisar</button>
      <button class="btn" (click)="action.emit('pista')">Pista</button>
      <button class="btn ok" (click)="action.emit('solucion')">Solución</button>
      <button class="btn danger" (click)="action.emit('limpiar')">Limpiar</button>

      <span class="legend" *ngIf="solved">✔ Resuelto</span>
    </div>
  `,
  styles: [`
    .controls h1{ margin:0; }
    .controls label{ display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--muted); }
    .controls .select{ min-width: 100px; }
  `]
})
export class ControlsComponent {
  @Input() sizeKey: SizeKey = '9x9';
  @Input() difficulty: Difficulty = 'Media';
  @Input() solved = false;

  @Output() sizeKeyChange = new EventEmitter<SizeKey>();
  @Output() difficultyChange = new EventEmitter<Difficulty>();
  @Output() action = new EventEmitter<'nuevo' | 'revisar' | 'pista' | 'solucion' | 'limpiar'>();

  onSizeChange(v: string) { this.sizeKeyChange.emit(v as SizeKey); }
  onDifficultyChange(v: string) { this.difficultyChange.emit(v as Difficulty); }
}
