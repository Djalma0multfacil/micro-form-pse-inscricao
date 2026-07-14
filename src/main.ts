import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { SmartFormComponent } from './app/features/smart-form/smart-form.component';

const CUSTOM_ELEMENT_TAG = 'micro-formulario-ps-inscricao';

async function bootstrap(): Promise<void> {
  const app = await createApplication(appConfig);

  if (!customElements.get(CUSTOM_ELEMENT_TAG)) {
    const element = createCustomElement(SmartFormComponent, { injector: app.injector });
    customElements.define(CUSTOM_ELEMENT_TAG, element);
  }
}

bootstrap().catch((err) => console.error(err));
