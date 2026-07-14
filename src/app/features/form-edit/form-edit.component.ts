import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { formatPhoneForDisplay } from '../../shared/models/personal-data-format.util';

export type FormEditFormGroup = FormGroup<{
  cpf: FormControl<string>;
  dataNascimento: FormControl<string>;
  nome: FormControl<string>;
  telefone: FormControl<string>;
  email: FormControl<string>;
  estadoCivil: FormControl<string>;
  nacionalidade: FormControl<string>;
  paisOrigem: FormControl<string>;
  campoAtuacao: FormControl<string>;
  cep: FormControl<string>;
  endereco: FormControl<string>;
  numero: FormControl<string>;
  complemento: FormControl<string>;
  bairro: FormControl<string>;
  cidade: FormControl<string>;
  uf: FormControl<string>;
  vagaAfrodescendente: FormControl<boolean>;
  vagaPcd: FormControl<boolean>;
  descricaoPcd: FormControl<string>;
  escolaridade: FormControl<string>;
  cursoFormacao: FormControl<string>;
  instituicaoEnsino: FormControl<string>;
  anoConclusao: FormControl<string>;
  possuiExperiencia: FormControl<boolean>;
  experienciaCargo: FormControl<string>;
  experienciaEmpresa: FormControl<string>;
  experienciaInicio: FormControl<string>;
  experienciaFim: FormControl<string>;
  experienciaDescricao: FormControl<string>;
  documentoRgCnh: FormControl<File | null>;
  comprovanteResidencia: FormControl<File | null>;
  comprovanteEscolaridade: FormControl<File | null>;
  laudoMedicoPcd: FormControl<File | null>;
}>;

@Component({
  selector: 'app-form-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMaskDirective,
  ],
  templateUrl: './form-edit.component.html',
  styleUrl: './form-edit.component.css',
  providers: [provideNgxMask()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEditComponent {
  readonly modo = input<'create' | 'edit' | 'view'>('create');
  readonly parentForm = input.required<FormEditFormGroup>();
  readonly readonlyMode = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);

  readonly submitClicked = output<void>();
  readonly clearClicked = output<void>();

  readonly estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viuvo(a)', 'Uniao estavel'];
  readonly escolaridades = [
    'Ensino Fundamental',
    'Ensino Medio',
    'Ensino Tecnico',
    'Graduacao',
    'Pos-graduacao',
    'Mestrado',
    'Doutorado',
  ];
  readonly ufs = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  onTelefoneInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (!inputElement) {
      return;
    }

    const maskedPhone = formatPhoneForDisplay(inputElement.value);
    inputElement.value = maskedPhone;
    this.parentForm().controls.telefone.setValue(maskedPhone);
  }

  onFileSelected(controlName: keyof FormEditFormGroup['controls'], event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedFile = inputElement.files?.item(0) ?? null;

    const control = this.parentForm().controls[controlName] as FormControl<File | null>;
    control.setValue(selectedFile);
    control.markAsDirty();
    control.markAsTouched();
  }

  fileName(controlName: keyof FormEditFormGroup['controls']): string {
    const control = this.parentForm().controls[controlName];
    if (control instanceof FormControl && control.value instanceof File) {
      return control.value.name;
    }

    return 'Nenhum arquivo selecionado';
  }

  hasError(controlName: keyof FormEditFormGroup['controls'], errorName = 'required'): boolean {
    const control = this.parentForm().controls[controlName];
    if (!(control instanceof FormControl)) {
      return false;
    }

    return control.hasError(errorName) && (control.touched || control.dirty);
  }
}
