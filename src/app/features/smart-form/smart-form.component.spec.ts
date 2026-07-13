import { TestBed } from '@angular/core/testing';
import { SmartFormComponent } from './smart-form.component';

describe('SmartFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartFormComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not emit actionSubmit when form is invalid', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let emitted = false;
    component.actionSubmit.subscribe(() => {
      emitted = true;
    });

    component.submit();

    expect(emitted).toBe(false);
  });

  it('should emit actionSubmit when form is valid', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let emittedValue: unknown;
    component.actionSubmit.subscribe((value) => {
      emittedValue = value;
    });

    component.form.setValue({
      nome: 'Joao',
      email: 'joao@email.com',
      documento: '123',
    });

    component.submit();

    expect(emittedValue).toEqual({
      nome: 'Joao',
      email: 'joao@email.com',
      documento: '123',
    });
  });

  it('should disable form controls in view mode', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.componentRef.setInput('modo', 'view');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.disabled).toBe(true);
  });
});
