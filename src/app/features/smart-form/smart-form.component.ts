import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { FormEditComponent, FormEditFormGroup } from '../form-edit/form-edit.component';

export type FormMode = 'create' | 'edit' | 'view';

export type SmartFormValue = {
  nome: string;
  email: string;
  documento: string;
};

@Component({
  selector: 'app-smart-form',
  imports: [ReactiveFormsModule, FormEditComponent],
  templateUrl: './smart-form.component.html',
  styleUrl: './smart-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartFormComponent {
  readonly modo = input<FormMode>('create');
  readonly actionSubmit = output<SmartFormValue>();

  readonly form: FormEditFormGroup;

  private readonly formBuilder = inject(NonNullableFormBuilder);

  constructor() {
    this.form = this.formBuilder.group({
      nome: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      documento: this.formBuilder.control('', [Validators.required]),
    });

    effect(() => {
      if (this.modo() === 'view') {
        this.form.disable({ emitEvent: false });
        return;
      }

      this.form.enable({ emitEvent: false });
    });
  }

  submit(): void {
    if (this.form.invalid || this.modo() === 'view') {
      this.form.markAllAsTouched();
      return;
    }

    this.actionSubmit.emit(this.form.getRawValue());
  }

  hasError(fieldName: 'nome' | 'email' | 'documento'): boolean {
    const control = this.form.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }

  errorMessage(fieldName: 'nome' | 'email' | 'documento'): string {
    const control = this.form.controls[fieldName];

    if (control.hasError('required')) {
      return 'Campo obrigatorio.';
    }

    if (fieldName === 'email' && control.hasError('email')) {
      return 'Informe um email valido.';
    }

    return 'Campo invalido.';
  }
}
