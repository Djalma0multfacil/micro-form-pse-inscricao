import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CEP_GATEWAY } from '../ports/cep-gateway.port';
import { CepAddress } from '../../shared/models/cep-address.model';
import { IntegrationError } from '../../shared/errors/integration-error';

@Injectable({ providedIn: 'root' })
export class BuscarEnderecoPorCepUseCase {
  private readonly cepGateway = inject(CEP_GATEWAY);

  execute(cep: string): Observable<CepAddress> {
    const sanitizedCep = cep.replace(/\D/g, '');

    if (sanitizedCep.length !== 8) {
      return throwError(() => new IntegrationError('CEP invalido. Informe 8 digitos.'));
    }

    return this.cepGateway.buscarPorCep(sanitizedCep);
  }
}
