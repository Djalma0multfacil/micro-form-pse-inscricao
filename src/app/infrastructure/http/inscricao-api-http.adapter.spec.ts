import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProcessoSeletivoInscricao } from '../../core/domain/processo-seletivo-inscricao.model';
import { authTokenInterceptor } from './auth-token.interceptor';
import { InscricaoApiHttpAdapter } from './inscricao-api-http.adapter';
import { RUNTIME_CONFIG_INITIAL, RuntimeConfig } from '../runtime/runtime-config.token';

describe('InscricaoApiHttpAdapter', () => {
  let adapter: InscricaoApiHttpAdapter;
  let httpMock: HttpTestingController;

  const runtimeConfig: RuntimeConfig = {
    apiBaseUrl: 'https://api.exemplo.test/api/v2',
    viaCepBaseUrl: 'https://viacep.com.br',
    authToken: 'token-123',
    requestTimeoutMs: 5000,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        InscricaoApiHttpAdapter,
        {
          provide: RUNTIME_CONFIG_INITIAL,
          useValue: runtimeConfig,
        },
      ],
    });

    adapter = TestBed.inject(InscricaoApiHttpAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar inscricao por uuid e mapear o payload da API', () => {
    const expected: ProcessoSeletivoInscricao = {
      uuid: 'abc-123',
      nome: 'Candidato Teste',
      cpf: '12345678901',
      email: 'candidato@teste.com',
    };

    adapter.findByUuid('abc-123').subscribe((response) => {
      expect(response).toEqual(expected);
    });

    const request = httpMock.expectOne(
      'https://api.exemplo.test/api/v2/processo-seletivo/inscricoes/abc-123',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');

    request.flush({
      success: true,
      message: 'ok',
      data: expected,
    });
  });
});
