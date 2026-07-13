import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { IntegrationError } from './integration-error';

export function mapHttpError(error: unknown, fallbackMessage: string): IntegrationError {
  if (error instanceof IntegrationError) {
    return error;
  }

  if (error instanceof TimeoutError) {
    return new IntegrationError('Tempo limite excedido para a requisicao.', undefined, error);
  }

  if (error instanceof HttpErrorResponse) {
    const backendMessage =
      typeof error.error === 'object' && error.error && 'message' in error.error
        ? String(error.error.message)
        : null;

    return new IntegrationError(backendMessage ?? fallbackMessage, error.status, error);
  }

  return new IntegrationError(fallbackMessage, undefined, error);
}
