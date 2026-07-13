import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BuscarEnderecoPorCepUseCase } from './core/use-cases/buscar-endereco-por-cep.use-case';
import { CepAddress } from './shared/models/cep-address.model';
import { RuntimeConfigStore } from './infrastructure/runtime/runtime-config.store';

@Component({
  selector: 'micro-formulario-inscricao',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly modo = input<'create' | 'edit' | 'view'>('create');
  readonly apiUrl = input<string | undefined>(undefined);
  readonly authToken = input<string | undefined>(undefined);
  readonly processoId = input<string | undefined>(undefined);
  readonly inscricaoUuid = input<string | undefined>(undefined);

  protected readonly cep = signal('');
  protected readonly endereco = signal<CepAddress | null>(null);
  protected readonly erroCep = signal<string | null>(null);
  protected readonly carregandoCep = signal(false);

  private readonly runtimeConfigStore = inject(RuntimeConfigStore);
  private readonly buscarEnderecoPorCep = inject(BuscarEnderecoPorCepUseCase);

  protected readonly runtimeConfig = computed(() => this.runtimeConfigStore.config());

  constructor() {
    effect(() => {
      const parsedProcessoId = this.parseProcessoId(this.processoId());

      this.runtimeConfigStore.update({
        apiBaseUrl: this.apiUrl(),
        authToken: this.authToken(),
        processoId: parsedProcessoId,
      });
    });
  }

  protected atualizarCep(value: string): void {
    this.cep.set(value);
  }

  protected async buscarCep(): Promise<void> {
    this.carregandoCep.set(true);
    this.erroCep.set(null);

    try {
      const endereco = await firstValueFrom(this.buscarEnderecoPorCep.execute(this.cep()));
      this.endereco.set(endereco);
    } catch (error) {
      this.endereco.set(null);
      this.erroCep.set(error instanceof Error ? error.message : 'Falha ao buscar o CEP.');
    } finally {
      this.carregandoCep.set(false);
    }
  }

  private parseProcessoId(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
