import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProcessoSeletivoInscricao,
  ProcessoSeletivoInscricaoPayload,
} from '../domain/processo-seletivo-inscricao.model';
import { INSCRICAO_GATEWAY } from '../ports/inscricao-gateway.port';
import { RuntimeConfigStore } from '../../infrastructure/runtime/runtime-config.store';

@Injectable({ providedIn: 'root' })
export class CriarInscricaoUseCase {
  private readonly inscricaoGateway = inject(INSCRICAO_GATEWAY);
  private readonly runtimeConfigStore: RuntimeConfigStore = inject(RuntimeConfigStore);

  execute(payload: ProcessoSeletivoInscricaoPayload): Observable<ProcessoSeletivoInscricao> {
    const runtimeConfig: ReturnType<RuntimeConfigStore['config']> = this.runtimeConfigStore.config();

    return this.inscricaoGateway.create({
      ...payload,
      tbprocessoSeletivoId: payload.tbprocessoSeletivoId ?? runtimeConfig.processoId,
    });
  }
}
