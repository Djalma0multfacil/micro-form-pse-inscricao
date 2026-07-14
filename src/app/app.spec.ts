import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { App } from './app';
import { AtualizarInscricaoUseCase } from './core/use-cases/atualizar-inscricao.use-case';
import { BuscarEnderecoPorCepUseCase } from './core/use-cases/buscar-endereco-por-cep.use-case';
import { CriarInscricaoUseCase } from './core/use-cases/criar-inscricao.use-case';
import { ObterInscricaoPorUuidUseCase } from './core/use-cases/obter-inscricao-por-uuid.use-case';
import { SmartFormComponent } from './features/smart-form/smart-form.component';
import {
  RUNTIME_CONFIG_INITIAL,
  RuntimeConfig,
} from './infrastructure/runtime/runtime-config.token';

describe('App', () => {
  const runtimeConfig: RuntimeConfig = {
    apiBaseUrl: '/api/v2',
    viaCepBaseUrl: 'https://viacep.com.br',
    authToken: null,
    requestTimeoutMs: 5000,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: RUNTIME_CONFIG_INITIAL,
          useValue: runtimeConfig,
        },
        {
          provide: CriarInscricaoUseCase,
          useValue: {
            execute: () =>
              of({
                uuid: 'new-uuid',
                nome: 'Maria',
                cpf: '123456789AB',
                email: 'maria@example.com',
              }),
          },
        },
        {
          provide: AtualizarInscricaoUseCase,
          useValue: {
            execute: () =>
              of({
                uuid: 'edit-uuid',
                nome: 'Maria',
                cpf: '123456789AB',
                email: 'maria@example.com',
              }),
          },
        },
        {
          provide: ObterInscricaoPorUuidUseCase,
          useValue: {
            execute: () =>
              of({
                uuid: 'edit-uuid',
                nome: 'Maria',
                cpf: '123456789AB',
                email: 'maria@example.com',
              }),
          },
        },
        {
          provide: BuscarEnderecoPorCepUseCase,
          useValue: {
            execute: () =>
              of({
                cep: '01001-000',
                logradouro: 'Praca da Se',
                complemento: '',
                bairro: 'Se',
                localidade: 'Sao Paulo',
                uf: 'SP',
              }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render form title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Processo Seletivo');
  });

  it('should emit actionSubmit when the smart form submit succeeds', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let emitted: unknown;
    component.actionSubmit.subscribe((value) => {
      emitted = value;
    });

    const smartFormDebugElement = fixture.debugElement.query(By.directive(SmartFormComponent));
    const smartForm = smartFormDebugElement.componentInstance as SmartFormComponent;

    smartForm.form.patchValue({
      cpf: '529.982.247-25',
      dataNascimento: '1990-01-01',
      nome: 'Maria da Silva',
      email: 'maria@example.com',
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
    smartForm.form.controls.documentoRgCnh.setValue(new File(['a'], 'rg.pdf'));
    smartForm.form.controls.comprovanteResidencia.setValue(new File(['a'], 'residencia.pdf'));
    smartForm.form.controls.comprovanteEscolaridade.setValue(new File(['a'], 'escolaridade.pdf'));

    fixture.detectChanges();
    smartForm.submit();

    expect(emitted).toEqual(
      expect.objectContaining({
        success: true,
        mode: 'create',
      }),
    );
  });

  it('should render view mode as readonly and hide save button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentRef.setInput('modo', 'view');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const saveButton = host.querySelector<HTMLButtonElement>('button[mat-flat-button]');
    const nome = host.querySelector<HTMLInputElement>('#nome');

    expect(saveButton).toBeNull();
    expect(nome?.disabled).toBe(true);
  });
});
