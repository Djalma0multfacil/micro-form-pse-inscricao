import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SmartFormComponent, SmartFormSubmitEvent } from './features/smart-form/smart-form.component';

@Component({
  selector: 'micro-formulario-inscricao',
  imports: [CommonModule, SmartFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly modo = input<'create' | 'edit' | 'view'>('create');
  readonly apiUrl = input<string | undefined>(undefined);
  readonly authToken = input<string | undefined>(undefined);
  readonly processoId = input<string | undefined>(undefined);
  readonly inscricaoUuid = input<string | undefined>(undefined);
  readonly actionSubmit = output<SmartFormSubmitEvent>();

  protected parsedProcessoId(): number | undefined {
    const rawValue = this.processoId();
    if (!rawValue) {
      return undefined;
    }

    const parsed = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  protected onActionSubmit(value: SmartFormSubmitEvent): void {
    this.actionSubmit.emit(value);
  }
}
