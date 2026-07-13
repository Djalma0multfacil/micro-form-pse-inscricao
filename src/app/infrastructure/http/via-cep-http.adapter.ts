import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CepGateway } from '../../core/ports/cep-gateway.port';
import { IntegrationError } from '../../shared/errors/integration-error';
import { mapHttpError } from '../../shared/errors/http-error.mapper';
import { CepAddress } from '../../shared/models/cep-address.model';
import { RuntimeConfigStore } from '../runtime/runtime-config.store';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ViaCepHttpAdapter implements CepGateway {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfigStore = inject(RuntimeConfigStore);

  buscarPorCep(cep: string): Observable<CepAddress> {
    return this.http.get<ViaCepResponse>(this.endpoint(cep)).pipe(
      map((response) => {
        if (response.erro) {
          throw new IntegrationError('CEP nao encontrado.');
        }

        return {
          cep: response.cep,
          logradouro: response.logradouro,
          complemento: response.complemento,
          bairro: response.bairro,
          localidade: response.localidade,
          uf: response.uf,
        };
      }),
      catchError((error) =>
        throwError(() => mapHttpError(error, 'Falha ao consultar endereco pelo CEP.')),
      ),
    );
  }

  private endpoint(cep: string): string {
    const baseUrl = this.runtimeConfigStore.config().viaCepBaseUrl.replace(/\/$/, '');
    const sanitizedCep = cep.replace(/\D/g, '');
    return `${baseUrl}/ws/${sanitizedCep}/json/`;
  }
}
