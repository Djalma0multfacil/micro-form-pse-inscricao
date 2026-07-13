import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProcessoSeletivoInscricao } from '../domain/processo-seletivo-inscricao.model';
import { INSCRICAO_GATEWAY } from '../ports/inscricao-gateway.port';

@Injectable({ providedIn: 'root' })
export class ObterInscricaoPorUuidUseCase {
  private readonly inscricaoGateway = inject(INSCRICAO_GATEWAY);

  execute(uuid: string): Observable<ProcessoSeletivoInscricao> {
    return this.inscricaoGateway.findByUuid(uuid);
  }
}
