import { TestBed } from '@angular/core/testing';
import { SudokuService } from './sudoku.service';
import { Difficulty, SizeKey } from '../models/sudoku';


describe('SudokuService', () => {
  let service: SudokuService;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SudokuService);
  });


  const sizes: SizeKey[] = ['4x4', '6x6', '9x9'];
  const diffs: Difficulty[] = ['Fácil', 'Media', 'Difícil', 'Experto'];


  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });


  sizes.forEach(sizeKey => {
    diffs.forEach(diff => {
      it(`genera puzzle único para ${sizeKey} - ${diff}`, () => {
        const p = service.newPuzzle(sizeKey, diff);
        // Validación básica de dimensiones
        expect(p.grid.length).toBe(p.config.size);
        expect(p.solution.length).toBe(p.config.size);
        // Validación de unicidad del generador
        const unique = (service as any).hasUniqueSolution(p.grid, p.config);
        expect(unique).toBeTrue();
      });
    });
  });


  it('checkConflicts marca conflictos simples', () => {
    const p = service.newPuzzle('4x4', 'Fácil');
    const g = p.grid.map(r => r.slice());
    // Fuerza conflicto: duplica el primer valor de la primera fila (si es editable)
    outer: for (let c = 0; c < g.length; c++) {
      if (g[0][c] == null) { g[0][c] = p.solution[0][0]; break outer; }
    }
    const bad = service.checkConflicts(g, p.config);
    // Debe haber al menos un verdadero (conflicto)
    expect(bad.flat().some(Boolean)).toBeTrue();
  });
});
