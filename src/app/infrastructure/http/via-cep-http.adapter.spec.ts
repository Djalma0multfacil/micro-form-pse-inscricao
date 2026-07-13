import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IntegrationError } from '../../shared/errors/integration-error';
import { authTokenInterceptor } from './auth-token.interceptor';
import { ViaCepHttpAdapter } from './via-cep-http.adapter';
import { RUNTIME_CONFIG_INITIAL, RuntimeConfig } from '../runtime/runtime-config.token';

describe('ViaCepHttpAdapter', () => {
  let adapter: ViaCepHttpAdapter;
  let httpMock: HttpTestingController;

  const runtimeConfig: RuntimeConfig = {
    apiBaseUrl: '/api/v2',
    viaCepBaseUrl: 'https://viacep.com.br',
    authToken: null,
    requestTimeoutMs: 5000,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        ViaCepHttpAdapter,
        {
          provide: RUNTIME_CONFIG_INITIAL,
          useValue: runtimeConfig,
        },
      ],
    });

    adapter = TestBed.inject(ViaCepHttpAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve consultar e mapear endereco pelo CEP', () => {
    adapter.buscarPorCep('01001-000').subscribe((endereco) => {
      expect(endereco.uf).toBe('SP');
      expect(endereco.localidade).toBe('Sao Paulo');
      expect(endereco.logradouro).toBe('Praca da Se');
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    expect(request.request.method).toBe('GET');

    request.flush({
      cep: '01001-000',
      logradouro: 'Praca da Se',
      complemento: 'lado impar',
      bairro: 'Se',
      localidade: 'Sao Paulo',
      uf: 'SP',
    });
  });

  it('deve retornar erro de integracao quando CEP nao existir', () => {
    adapter.buscarPorCep('99999999').subscribe({
      next: () => {
        throw new Error('Era esperado erro para CEP inexistente');
      },
      error: (error: unknown) => {
        expect(error instanceof IntegrationError).toBe(true);
      },
    });

    const request = httpMock.expectOne('https://viacep.com.br/ws/99999999/json/');
    request.flush({ erro: true }, { status: 200, statusText: 'OK' });
  });
});
