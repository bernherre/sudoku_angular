import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsComponent } from './controls.component';


describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsComponent]
    }).compileComponents();


    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });


  it('emite sizeKeyChange', () => {
    spyOn(component.sizeKeyChange, 'emit');
    component.sizeKeyChange.emit('6x6');
    expect(component.sizeKeyChange.emit).toHaveBeenCalledWith('6x6');
  });
});
