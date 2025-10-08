import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SudokuBoardComponent } from './sudoku-board.component';


describe('SudokuBoardComponent', () => {
  let component: SudokuBoardComponent;
  let fixture: ComponentFixture<SudokuBoardComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SudokuBoardComponent]
    }).compileComponents();


    fixture = TestBed.createComponent(SudokuBoardComponent);
    component = fixture.componentInstance;
    component.cfg = { size: 4, boxR: 2, boxC: 2, symbols: [1, 2, 3, 4] };
    component.grid = Array.from({ length: 4 }, () => Array(4).fill(null));
    component.givenMask = Array.from({ length: 4 }, () => Array(4).fill(false));
    component.invalidMask = Array.from({ length: 4 }, () => Array(4).fill(false));
    fixture.detectChanges();
  });


  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });


  it('emite cambios en onInput', () => {
    spyOn(component.changeCell, 'emit');
    const input = document.createElement('input');
    (input as any).value = '2';
    component.onInput(0, 0, { target: input } as any);
    expect(component.changeCell.emit).toHaveBeenCalledWith({ r: 0, c: 0, val: 2 });
  });
});
