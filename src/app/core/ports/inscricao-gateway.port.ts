import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProcessoSeletivoInscricao,
  ProcessoSeletivoInscricaoPayload,
} from '../domain/processo-seletivo-inscricao.model';

export interface InscricaoGateway {
  create(payload: ProcessoSeletivoInscricaoPayload): Observable<ProcessoSeletivoInscricao>;
  findByUuid(uuid: string): Observable<ProcessoSeletivoInscricao>;
  update(
    uuid: string,
    payload: ProcessoSeletivoInscricaoPayload,
  ): Observable<ProcessoSeletivoInscricao>;
}

export const INSCRICAO_GATEWAY = new InjectionToken<InscricaoGateway>('INSCRICAO_GATEWAY');
