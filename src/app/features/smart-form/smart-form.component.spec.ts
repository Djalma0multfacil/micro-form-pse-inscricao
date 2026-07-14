import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AtualizarInscricaoUseCase } from '../../core/use-cases/atualizar-inscricao.use-case';
import { BuscarEnderecoPorCepUseCase } from '../../core/use-cases/buscar-endereco-por-cep.use-case';
import { CriarInscricaoUseCase } from '../../core/use-cases/criar-inscricao.use-case';
import { ObterInscricaoPorUuidUseCase } from '../../core/use-cases/obter-inscricao-por-uuid.use-case';
import { RUNTIME_CONFIG_INITIAL, RuntimeConfig } from '../../infrastructure/runtime/runtime-config.token';
import { SmartFormComponent } from './smart-form.component';

describe('SmartFormComponent', () => {
  let criarPayloadRecebido: unknown;
  let buscarCepChamadas = 0;

  const criarUseCaseMock = {
    execute: (payload: unknown) => {
      criarPayloadRecebido = payload;

      return of({
        uuid: 'new-uuid',
        nome: 'Maria da Silva',
        cpf: '52998224725',
        email: 'maria@teste.com',
      });
    },
  };

  const atualizarUseCaseMock = {
    execute: () =>
      of({
        uuid: 'edit-uuid',
        nome: 'Maria Atualizada',
        cpf: '52998224725',
        email: 'maria@teste.com',
      }),
  };

  const obterUseCaseMock = {
    execute: () =>
      of({
        uuid: 'edit-uuid',
        nome: 'Maria',
        cpf: '52998224725',
        telefone: '11912345678',
        dataNascimento: '1990-01-01',
        email: 'maria@teste.com',
      }),
  };

  const buscarCepUseCaseMock = {
    execute: () => {
      buscarCepChamadas += 1;

      return of({
        cep: '01001-000',
        logradouro: 'Praca da Se',
        complemento: '',
        bairro: 'Se',
        localidade: 'Sao Paulo',
        uf: 'SP',
      });
    },
  };

  const runtimeConfig: RuntimeConfig = {
    apiBaseUrl: '/api/v2',
    viaCepBaseUrl: 'https://viacep.com.br',
    authToken: null,
    requestTimeoutMs: 5000,
  };

  beforeEach(async () => {
    buscarCepChamadas = 0;

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
      cpf: '529.982.247-25',
      dataNascimento: '1990-01-01',
      nome: 'Joao',
      telefone: '(11) 91234-5678',
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

    expect(criarPayloadRecebido).toEqual(
      expect.objectContaining({
        cpf: '52998224725',
        telefone: '11912345678',
        dataNascimento: '1990-01-01',
      }),
    );
  });

  it('should disable form controls in view mode', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.componentRef.setInput('modo', 'view');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.disabled).toBe(true);
  });

  it('should load masked cpf and telefone when editing inscricao', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.componentRef.setInput('modo', 'edit');
    fixture.componentRef.setInput('inscricaoUuid', 'edit-uuid');
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.form.controls.cpf.value).toBe('529.982.247-25');
    expect(component.form.controls.telefone.value).toBe('(11) 91234-5678');
    expect(component.form.controls.dataNascimento.value).toBe('1990-01-01');
  });

  it('should keep form invalid when cpf format is incomplete', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.form.patchValue({
      cpf: '123.456.789-12',
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

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.cpf.hasError('cpfInvalido')).toBe(true);
  });

  it('should keep cpf invalid when digits are repeated', () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.form.controls.cpf.setValue('111.111.111-11');

    expect(component.form.controls.cpf.hasError('cpfInvalido')).toBe(true);
  });

  it('should fetch and fill endereco automatically when cep has 8 digits', async () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.controls.cep.setValue('01001000');
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(buscarCepChamadas).toBe(1);
    expect(component.form.controls.endereco.value).toBe('Praca da Se');
    expect(component.form.controls.bairro.value).toBe('Se');
    expect(component.form.controls.cidade.value).toBe('Sao Paulo');
    expect(component.form.controls.uf.value).toBe('SP');
  });

  it('should not fetch endereco automatically when cep is incomplete', async () => {
    const fixture = TestBed.createComponent(SmartFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.form.controls.cep.setValue('01001');
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(buscarCepChamadas).toBe(0);
  });

});

