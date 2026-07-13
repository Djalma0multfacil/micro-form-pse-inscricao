import { InjectionToken } from '@angular/core';

export interface RuntimeConfig {
  apiBaseUrl: string;
  viaCepBaseUrl: string;
  authToken: string | null;
  processoId?: number;
  requestTimeoutMs: number;
}

declare global {
  interface Window {
    __MICRO_FORM_CONFIG__?: Partial<RuntimeConfig>;
  }
}

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  apiBaseUrl: '/api/v2',
  viaCepBaseUrl: 'https://viacep.com.br',
  authToken: null,
  processoId: undefined,
  requestTimeoutMs: 10000,
};

export const RUNTIME_CONFIG_INITIAL = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG_INITIAL');

export function runtimeConfigFactory(): RuntimeConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_RUNTIME_CONFIG };
  }

  return {
    ...DEFAULT_RUNTIME_CONFIG,
    ...window.__MICRO_FORM_CONFIG__,
  };
}
