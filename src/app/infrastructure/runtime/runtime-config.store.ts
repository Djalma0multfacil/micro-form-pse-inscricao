import { computed, inject, Injectable, signal } from '@angular/core';
import { RUNTIME_CONFIG_INITIAL, RuntimeConfig } from './runtime-config.token';

type RuntimeConfigPatch = {
  apiBaseUrl?: string;
  viaCepBaseUrl?: string;
  authToken?: string | null;
  processoId?: number;
  requestTimeoutMs?: number;
};

@Injectable({ providedIn: 'root' })
export class RuntimeConfigStore {
  private readonly state = signal<RuntimeConfig>(inject(RUNTIME_CONFIG_INITIAL));

  readonly config = computed(() => this.state());

  update(patch: RuntimeConfigPatch): void {
    this.state.update((current) => ({
      ...current,
      ...(patch.apiBaseUrl !== undefined ? { apiBaseUrl: patch.apiBaseUrl } : {}),
      ...(patch.viaCepBaseUrl !== undefined ? { viaCepBaseUrl: patch.viaCepBaseUrl } : {}),
      ...(patch.authToken !== undefined ? { authToken: patch.authToken } : {}),
      ...(patch.processoId !== undefined ? { processoId: patch.processoId } : {}),
      ...(patch.requestTimeoutMs !== undefined
        ? { requestTimeoutMs: patch.requestTimeoutMs }
        : {}),
    }));
  }
}
