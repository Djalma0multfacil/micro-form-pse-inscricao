import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout } from 'rxjs';
import { RuntimeConfigStore } from '../runtime/runtime-config.store';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const runtimeConfig = inject(RuntimeConfigStore).config();

  const requestWithAuth = runtimeConfig.authToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${runtimeConfig.authToken}`,
        },
      })
    : req;

  const timeoutMs = runtimeConfig.requestTimeoutMs;
  if (!timeoutMs || timeoutMs <= 0) {
    return next(requestWithAuth);
  }

  return next(requestWithAuth).pipe(timeout({ first: timeoutMs }));
};
