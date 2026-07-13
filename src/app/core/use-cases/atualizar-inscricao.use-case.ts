import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProcessoSeletivoInscricao,
  ProcessoSeletivoInscricaoPayload,
} from '../domain/processo-seletivo-inscricao.model';
import { INSCRICAO_GATEWAY } from '../ports/inscricao-gateway.port';

@Injectable({ providedIn: 'root' })
export class AtualizarInscricaoUseCase {
  private readonly inscricaoGateway = inject(INSCRICAO_GATEWAY);

  execute(
    uuid: string,
    payload: ProcessoSeletivoInscricaoPayload,
  ): Observable<ProcessoSeletivoInscricao> {
    return this.inscricaoGateway.update(uuid, payload);
  }
}
