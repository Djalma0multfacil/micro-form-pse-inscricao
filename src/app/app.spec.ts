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
});
