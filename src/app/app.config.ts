import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { CEP_GATEWAY } from './core/ports/cep-gateway.port';
import { INSCRICAO_GATEWAY } from './core/ports/inscricao-gateway.port';
import { authTokenInterceptor } from './infrastructure/http/auth-token.interceptor';
import { InscricaoApiHttpAdapter } from './infrastructure/http/inscricao-api-http.adapter';
import {
  RUNTIME_CONFIG_INITIAL,
  runtimeConfigFactory,
} from './infrastructure/runtime/runtime-config.token';
import { ViaCepHttpAdapter } from './infrastructure/http/via-cep-http.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor])),
    {
      provide: RUNTIME_CONFIG_INITIAL,
      useFactory: runtimeConfigFactory,
    },
    {
      provide: INSCRICAO_GATEWAY,
      useExisting: InscricaoApiHttpAdapter,
    },
    {
      provide: CEP_GATEWAY,
      useExisting: ViaCepHttpAdapter,
    },
  ],
};
