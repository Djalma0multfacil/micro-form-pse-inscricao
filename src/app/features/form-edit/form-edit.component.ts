import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export type FormEditFormGroup = FormGroup<{
  nome: FormControl<string>;
  email: FormControl<string>;
  documento: FormControl<string>;
}>;

@Component({
  selector: 'app-form-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './form-edit.component.html',
  styleUrl: './form-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEditComponent {
  readonly parentForm = input.required<FormEditFormGroup>();
  readonly readonlyMode = input<boolean>(false);
}
