import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { authTokenInterceptor } from './infrastructure/http/auth-token.interceptor';
import { CEP_GATEWAY } from './core/ports/cep-gateway.port';
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
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: RUNTIME_CONFIG_INITIAL,
          useValue: runtimeConfig,
        },
        {
          provide: CEP_GATEWAY,
          useValue: {
            buscarPorCep: () =>
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

  it('should render shell title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Micro Formulario de Inscricao');
  });

  it('should emit actionSubmit when the smart form is valid', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let emitted: unknown;
    component.actionSubmit.subscribe((value) => {
      emitted = value;
    });

    const host = fixture.nativeElement as HTMLElement;
    const nome = host.querySelector<HTMLInputElement>('#nome');
    const email = host.querySelector<HTMLInputElement>('#email');
    const documento = host.querySelector<HTMLInputElement>('#documento');
    const saveButton = host.querySelector<HTMLButtonElement>('.save-button');

    expect(nome).not.toBeNull();
    expect(email).not.toBeNull();
    expect(documento).not.toBeNull();
    expect(saveButton).not.toBeNull();

    nome!.value = 'Maria da Silva';
    nome!.dispatchEvent(new Event('input'));

    email!.value = 'maria@example.com';
    email!.dispatchEvent(new Event('input'));

    documento!.value = '12345678900';
    documento!.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    saveButton!.click();

    expect(emitted).toEqual({
      nome: 'Maria da Silva',
      email: 'maria@example.com',
      documento: '12345678900',
    });
  });

  it('should render view mode as readonly and hide save button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentRef.setInput('modo', 'view');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const saveButton = host.querySelector<HTMLButtonElement>('.save-button');
    const nome = host.querySelector<HTMLInputElement>('#nome');

    expect(saveButton).toBeNull();
    expect(nome?.disabled).toBe(true);
  });
});
