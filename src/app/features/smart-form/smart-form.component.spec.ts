import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AtualizarInscricaoUseCase } from '../../core/use-cases/atualizar-inscricao.use-case';
import { BuscarEnderecoPorCepUseCase } from '../../core/use-cases/buscar-endereco-por-cep.use-case';
import { CriarInscricaoUseCase } from '../../core/use-cases/criar-inscricao.use-case';
import { ObterInscricaoPorUuidUseCase } from '../../core/use-cases/obter-inscricao-por-uuid.use-case';
import { RUNTIME_CONFIG_INITIAL, RuntimeConfig } from '../../infrastructure/runtime/runtime-config.token';
import { SmartFormComponent } from './smart-form.component';

describe('SmartFormComponent', () => {
  const criarUseCaseMock = {
    execute: () =>
      of({
        uuid: 'new-uuid',
        nome: 'Maria da Silva',
        cpf: '12345678901',
        email: 'maria@teste.com',
      }),
  };

  const atualizarUseCaseMock = {
    execute: () =>
      of({
        uuid: 'edit-uuid',
        nome: 'Maria Atualizada',
        cpf: '12345678901',
        email: 'maria@teste.com',
      }),
  };

  const obterUseCaseMock = {
    execute: () =>
      of({
        uuid: 'edit-uuid',
        nome: 'Maria',
        cpf: '12345678901',
        email: 'maria@teste.com',
      }),
  };

  const buscarCepUseCaseMock = {
    execute: () =>
      of({
        cep: '01001-000',
        logradouro: 'Praca da Se',
        complemento: '',
        bairro: 'Se',
        localidade: 'Sao Paulo',
        uf: 'SP',
      }),
  };

  const runtimeConfig: RuntimeConfig = {
    apiBaseUrl: '/api/v2',
    viaCepBaseUrl: 'https://viacep.com.br',
    authToken: null,
    requestTimeoutMs: 5000,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartFormComponent],
      providers: [
        {
          provide: RUNTIME_CONFIG_INITIAL,
          useValue: runtimeConfig,
        },
        {
          provide: CriarInscricaoUseCase,
          useValue: criarUseCaseMock,
        },
        {
          provide: AtualizarInscricaoUseCase,
          useValue: atualizarUseCaseMock,
        },
        {
          provide: ObterInscricaoPorUuidUseCase,
          useValue: obterUseCaseMock,
        },
        {
          provide: BuscarEnderecoPorCepUseCase,
          useValue: buscarCepUseCaseMock,
        },
      ],
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

    component.form.patchValue({
      cpf: '12345678901',
      dataNascimento: '1990-01-01',
      nome: 'Joao',
      email: 'joao@email.com',
      estadoCivil: 'Solteiro(a)',
      nacionalidade: 'Brasileira',
      paisOrigem: 'Brasil',
      campoAtuacao: 'Educacao',
      cep: '01001000',
      endereco: 'Praca da Se',
      numero: '100',
      bairro: 'Se',
      cidade: 'Sao Paulo',
      uf: 'SP',
      escolaridade: 'Graduacao',
      cursoFormacao: 'Pedagogia',
    });

    component.form.controls.documentoRgCnh.setValue(new File(['a'], 'rg.pdf'));
    component.form.controls.comprovanteResidencia.setValue(new File(['a'], 'residencia.pdf'));
    component.form.controls.comprovanteEscolaridade.setValue(new File(['a'], 'escolaridade.pdf'));

    component.submit();

    expect(emittedValue).toEqual(
      expect.objectContaining({
        success: true,
        mode: 'create',
      }),
    );
  });

  it('should disable form controls in view mode', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.componentRef.setInput('modo', 'view');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.disabled).toBe(true);
  });

});
