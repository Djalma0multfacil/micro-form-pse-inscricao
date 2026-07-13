import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const CUSTOM_ELEMENT_TAG = 'micro-formulario-inscricao';

async function bootstrap(): Promise<void> {
  const app = await createApplication(appConfig);

  if (!customElements.get(CUSTOM_ELEMENT_TAG)) {
    const element = createCustomElement(App, { injector: app.injector });
    customElements.define(CUSTOM_ELEMENT_TAG, element);
  }
}

bootstrap().catch((err) => console.error(err));
