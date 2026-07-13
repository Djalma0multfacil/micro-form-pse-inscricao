import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CepAddress } from '../../shared/models/cep-address.model';

export interface CepGateway {
  buscarPorCep(cep: string): Observable<CepAddress>;
}

export const CEP_GATEWAY = new InjectionToken<CepGateway>('CEP_GATEWAY');
