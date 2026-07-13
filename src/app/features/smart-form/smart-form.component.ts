import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, EMPTY, map, switchMap, tap, catchError } from 'rxjs';
import {
  ProcessoSeletivoInscricao,
  ProcessoSeletivoInscricaoPayload,
} from '../../core/domain/processo-seletivo-inscricao.model';
import { AtualizarInscricaoUseCase } from '../../core/use-cases/atualizar-inscricao.use-case';
import { BuscarEnderecoPorCepUseCase } from '../../core/use-cases/buscar-endereco-por-cep.use-case';
import { CriarInscricaoUseCase } from '../../core/use-cases/criar-inscricao.use-case';
import { ObterInscricaoPorUuidUseCase } from '../../core/use-cases/obter-inscricao-por-uuid.use-case';
import { RuntimeConfigStore } from '../../infrastructure/runtime/runtime-config.store';
import { FormEditComponent, FormEditFormGroup } from '../form-edit/form-edit.component';

export type FormMode = 'create' | 'edit' | 'view';

export type SmartFormSubmitEvent = {
  success: boolean;
  mode: 'create' | 'edit';
  data?: ProcessoSeletivoInscricao;
  error?: string;
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
  readonly apiUrl = input<string | undefined>(undefined);
  readonly authToken = input<string | undefined>(undefined);
  readonly processoId = input<number | undefined>(undefined);
  readonly inscricaoUuid = input<string | undefined>(undefined);
  readonly actionSubmit = output<SmartFormSubmitEvent>();

  readonly form: FormEditFormGroup;
  readonly isSubmitting = signal(false);
  readonly isLoadingInscricao = signal(false);
  readonly isLoadingCep = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly cepError = signal<string | null>(null);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly runtimeConfigStore = inject(RuntimeConfigStore);
  private readonly criarInscricaoUseCase = inject(CriarInscricaoUseCase);
  private readonly atualizarInscricaoUseCase = inject(AtualizarInscricaoUseCase);
  private readonly obterInscricaoPorUuidUseCase = inject(ObterInscricaoPorUuidUseCase);
  private readonly buscarEnderecoPorCepUseCase = inject(BuscarEnderecoPorCepUseCase);

  constructor() {
    this.form = this.formBuilder.group({
      cpf: this.formBuilder.control('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
      dataNascimento: this.formBuilder.control('', [Validators.required]),
      nome: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
      telefone: this.formBuilder.control(''),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      estadoCivil: this.formBuilder.control('', [Validators.required]),
      nacionalidade: this.formBuilder.control('Brasileira', [Validators.required]),
      paisOrigem: this.formBuilder.control('Brasil', [Validators.required]),
      campoAtuacao: this.formBuilder.control('', [Validators.required]),
      cep: this.formBuilder.control('', [Validators.required, Validators.pattern(/^\d{8}$/)]),
      endereco: this.formBuilder.control('', [Validators.required]),
      numero: this.formBuilder.control('', [Validators.required]),
      complemento: this.formBuilder.control(''),
      bairro: this.formBuilder.control('', [Validators.required]),
      cidade: this.formBuilder.control('', [Validators.required]),
      uf: this.formBuilder.control('', [Validators.required]),
      vagaAfrodescendente: this.formBuilder.control(false),
      vagaPcd: this.formBuilder.control(false),
      descricaoPcd: this.formBuilder.control(''),
      escolaridade: this.formBuilder.control('', [Validators.required]),
      cursoFormacao: this.formBuilder.control('', [Validators.required]),
      instituicaoEnsino: this.formBuilder.control(''),
      anoConclusao: this.formBuilder.control('', [Validators.pattern(/^\d{4}$/)]),
      possuiExperiencia: this.formBuilder.control(false),
      experienciaCargo: this.formBuilder.control(''),
      experienciaEmpresa: this.formBuilder.control(''),
      experienciaInicio: this.formBuilder.control(''),
      experienciaFim: this.formBuilder.control(''),
      experienciaDescricao: this.formBuilder.control(''),
      documentoRgCnh: new FormControl<File | null>(null, {
        validators: [Validators.required],
        nonNullable: false,
      }),
      comprovanteResidencia: new FormControl<File | null>(null, {
        validators: [Validators.required],
        nonNullable: false,
      }),
      comprovanteEscolaridade: new FormControl<File | null>(null, {
        validators: [Validators.required],
        nonNullable: false,
      }),
      laudoMedicoPcd: new FormControl<File | null>(null, {
        nonNullable: false,
      }),
    });

    this.watchCepChanges();
    this.watchConditionalFields();

    effect(() => {
      this.runtimeConfigStore.update({
        apiBaseUrl: this.apiUrl(),
        authToken: this.authToken(),
        processoId: this.processoId(),
      });
    });

    effect(() => {
      if (this.modo() === 'view') {
        this.form.disable({ emitEvent: false });
        return;
      }

      this.form.enable({ emitEvent: false });

      if (this.modo() === 'edit') {
        this.form.controls.cpf.disable({ emitEvent: false });
      }
    });

    effect(() => {
      const modo = this.modo();
      const uuid = this.inscricaoUuid();

      if ((modo === 'edit' || modo === 'view') && uuid) {
        this.loadInscricao(uuid);
        return;
      }

      if (modo === 'create') {
        this.resetCreateDefaults();
      }
    });
  }

  submit(): void {
    if (this.modo() === 'view') {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    this.submitError.set(null);
    this.isSubmitting.set(true);

    const payload = this.toPayload();
    const mode = this.modo();

    const request$ =
      mode === 'edit' && this.inscricaoUuid()
        ? this.atualizarInscricaoUseCase.execute(this.inscricaoUuid()!, payload)
        : this.criarInscricaoUseCase.execute(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.actionSubmit.emit({
          success: true,
          mode: mode === 'edit' ? 'edit' : 'create',
          data: response,
        });
      },
      error: (error) => {
        const message = error instanceof Error ? error.message : 'Falha ao enviar inscricao.';
        this.isSubmitting.set(false);
        this.submitError.set(message);
        this.actionSubmit.emit({
          success: false,
          mode: mode === 'edit' ? 'edit' : 'create',
          error: message,
        });
      },
    });
  }

  clearForm(): void {
    this.form.reset();
    this.resetCreateDefaults();
    this.submitError.set(null);
    this.cepError.set(null);
  }

  buscarEnderecoPorCep(): void {
    const cepSanitizado = this.form.controls.cep.value.replace(/\D/g, '');
    if (cepSanitizado.length !== 8) {
      this.cepError.set('CEP invalido. Informe 8 digitos.');
      return;
    }

    this.buscarCep(cepSanitizado);
  }

  private watchCepChanges(): void {
    this.form.controls.cep.valueChanges
      .pipe(
        map((value) => value.replace(/\D/g, '')),
        distinctUntilChanged(),
        debounceTime(400),
        tap(() => this.cepError.set(null)),
        switchMap((cep) => {
          if (cep.length !== 8) {
            return EMPTY;
          }

          return this.buscarEnderecoPorCepUseCase.execute(cep).pipe(
            tap((endereco) => {
              this.form.patchValue(
                {
                  endereco: endereco.logradouro,
                  bairro: endereco.bairro,
                  cidade: endereco.localidade,
                  uf: endereco.uf,
                  complemento: endereco.complemento || this.form.controls.complemento.value,
                },
                { emitEvent: false },
              );
            }),
            catchError((error) => {
              this.cepError.set(
                error instanceof Error ? error.message : 'Falha ao consultar endereco por CEP.',
              );
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private watchConditionalFields(): void {
    this.form.controls.vagaPcd.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isPcd) => {
        this.setConditionalRequired(this.form.controls.laudoMedicoPcd, isPcd);
      });

    this.form.controls.possuiExperiencia.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasExperience) => {
        this.setConditionalRequired(this.form.controls.experienciaCargo, hasExperience);
        this.setConditionalRequired(this.form.controls.experienciaEmpresa, hasExperience);
        this.setConditionalRequired(this.form.controls.experienciaInicio, hasExperience);
      });

    this.setConditionalRequired(this.form.controls.laudoMedicoPcd, this.form.controls.vagaPcd.value);
    this.setConditionalRequired(
      this.form.controls.experienciaCargo,
      this.form.controls.possuiExperiencia.value,
    );
    this.setConditionalRequired(
      this.form.controls.experienciaEmpresa,
      this.form.controls.possuiExperiencia.value,
    );
    this.setConditionalRequired(
      this.form.controls.experienciaInicio,
      this.form.controls.possuiExperiencia.value,
    );
  }

  private setConditionalRequired(
    control: FormControl<string> | FormControl<File | null>,
    required: boolean,
  ): void {
    if (required) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  private buscarCep(cep: string): void {
    this.isLoadingCep.set(true);
    this.cepError.set(null);

    this.buscarEnderecoPorCepUseCase
      .execute(cep)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (endereco) => {
          this.isLoadingCep.set(false);
          this.form.patchValue(
            {
              endereco: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              uf: endereco.uf,
              complemento: endereco.complemento || this.form.controls.complemento.value,
            },
            { emitEvent: false },
          );
        },
        error: (error) => {
          this.isLoadingCep.set(false);
          this.cepError.set(
            error instanceof Error ? error.message : 'Falha ao consultar endereco por CEP.',
          );
        },
      });
  }

  private loadInscricao(uuid: string): void {
    this.isLoadingInscricao.set(true);
    this.submitError.set(null);

    this.obterInscricaoPorUuidUseCase
      .execute(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (inscricao) => {
          this.isLoadingInscricao.set(false);
          this.form.patchValue(
            {
              cpf: inscricao.cpf ?? '',
              dataNascimento: inscricao.dataNascimento ?? '',
              nome: inscricao.nome ?? '',
              telefone: inscricao.telefone ?? '',
              email: inscricao.email ?? '',
              estadoCivil: inscricao.estadoCivil ?? '',
              nacionalidade: inscricao.nacionalidade ?? 'Brasileira',
              paisOrigem: inscricao.paisOrigem ?? 'Brasil',
              campoAtuacao: inscricao.campoAtuacao ?? '',
              cep: inscricao.cep ?? '',
              endereco: inscricao.endereco ?? '',
              numero: inscricao.numero ?? '',
              complemento: inscricao.complemento ?? '',
              bairro: inscricao.bairro ?? '',
              cidade: inscricao.cidade ?? '',
              uf: inscricao.uf ?? '',
              vagaAfrodescendente: inscricao.afrodescendente ?? false,
              vagaPcd: inscricao.pcd ?? false,
              descricaoPcd: inscricao.descricaoPcd ?? '',
              escolaridade: inscricao.escolaridade ?? '',
              cursoFormacao: inscricao.cursoFormacao ?? '',
              instituicaoEnsino: inscricao.instituicaoEnsino ?? '',
              anoConclusao: inscricao.anoConclusao ?? '',
              possuiExperiencia: inscricao.possuiExperiencia ?? false,
              experienciaCargo: inscricao.experienciaCargo ?? '',
              experienciaEmpresa: inscricao.experienciaEmpresa ?? '',
              experienciaInicio: inscricao.experienciaInicio ?? '',
              experienciaFim: inscricao.experienciaFim ?? '',
              experienciaDescricao: inscricao.experienciaDescricao ?? '',
            },
            { emitEvent: false },
          );
        },
        error: (error) => {
          this.isLoadingInscricao.set(false);
          this.submitError.set(
            error instanceof Error ? error.message : 'Falha ao carregar inscricao.',
          );
        },
      });
  }

  private toPayload(): ProcessoSeletivoInscricaoPayload {
    const raw = this.form.getRawValue();

    return {
      nome: raw.nome,
      cpf: raw.cpf,
      email: raw.email,
      dataNascimento: raw.dataNascimento,
      estadoCivil: raw.estadoCivil,
      nacionalidade: raw.nacionalidade,
      paisOrigem: raw.paisOrigem,
      campoAtuacao: raw.campoAtuacao,
      telefone: raw.telefone,
      cep: raw.cep,
      endereco: raw.endereco,
      numero: raw.numero,
      complemento: raw.complemento,
      bairro: raw.bairro,
      cidade: raw.cidade,
      uf: raw.uf,
      pcd: raw.vagaPcd,
      descricaoPcd: raw.descricaoPcd,
      afrodescendente: raw.vagaAfrodescendente,
      escolaridade: raw.escolaridade,
      cursoFormacao: raw.cursoFormacao,
      instituicaoEnsino: raw.instituicaoEnsino,
      anoConclusao: raw.anoConclusao,
      possuiExperiencia: raw.possuiExperiencia,
      experienciaCargo: raw.experienciaCargo,
      experienciaEmpresa: raw.experienciaEmpresa,
      experienciaInicio: raw.experienciaInicio,
      experienciaFim: raw.experienciaFim,
      experienciaDescricao: raw.experienciaDescricao,
      documentoRgCnh: raw.documentoRgCnh,
      comprovanteResidencia: raw.comprovanteResidencia,
      comprovanteEscolaridade: raw.comprovanteEscolaridade,
      laudoMedicoPcd: raw.laudoMedicoPcd,
      tbprocessoSeletivoId: this.processoId(),
    };
  }

  private resetCreateDefaults(): void {
    this.form.patchValue(
      {
        nacionalidade: 'Brasileira',
        paisOrigem: 'Brasil',
        vagaAfrodescendente: false,
        vagaPcd: false,
        possuiExperiencia: false,
      },
      { emitEvent: false },
    );
  }

  private scrollToFirstInvalidControl(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const firstInvalidControl = document.querySelector<HTMLElement>('[formcontrolname].ng-invalid');

    if (!firstInvalidControl) {
      return;
    }

    if (typeof firstInvalidControl.scrollIntoView === 'function') {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (typeof firstInvalidControl.focus === 'function') {
      firstInvalidControl.focus();
    }
  }
}
