import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  ProcessoSeletivoInscricao,
  ProcessoSeletivoInscricaoPayload,
} from '../../core/domain/processo-seletivo-inscricao.model';
import { InscricaoGateway } from '../../core/ports/inscricao-gateway.port';
import { mapHttpError } from '../../shared/errors/http-error.mapper';
import { RuntimeConfigStore } from '../runtime/runtime-config.store';

interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InscricaoApiHttpAdapter implements InscricaoGateway {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfigStore = inject(RuntimeConfigStore);

  create(payload: ProcessoSeletivoInscricaoPayload): Observable<ProcessoSeletivoInscricao> {
    return this.http
      .post<ApiEnvelope<ProcessoSeletivoInscricao>>(this.endpoint(), payload)
      .pipe(
        map((response) => response.data),
        catchError((error) =>
          throwError(() => mapHttpError(error, 'Falha ao criar inscricao.')),
        ),
      );
  }

  findByUuid(uuid: string): Observable<ProcessoSeletivoInscricao> {
    return this.http
      .get<ApiEnvelope<ProcessoSeletivoInscricao>>(this.endpoint(`/${uuid}`))
      .pipe(
        map((response) => response.data),
        catchError((error) =>
          throwError(() => mapHttpError(error, 'Falha ao carregar inscricao.')),
        ),
      );
  }

  update(
    uuid: string,
    payload: ProcessoSeletivoInscricaoPayload,
  ): Observable<ProcessoSeletivoInscricao> {
    return this.http
      .put<ApiEnvelope<ProcessoSeletivoInscricao>>(this.endpoint(`/${uuid}`), payload)
      .pipe(
        map((response) => response.data),
        catchError((error) =>
          throwError(() => mapHttpError(error, 'Falha ao atualizar inscricao.')),
        ),
      );
  }

  private endpoint(path = ''): string {
    const baseApiUrl = this.runtimeConfigStore.config().apiBaseUrl.replace(/\/$/, '');
    return `${baseApiUrl}/processo-seletivo/inscricoes${path}`;
  }
}
