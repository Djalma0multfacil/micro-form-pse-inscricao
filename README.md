# MicroFormPseInscricao

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Building the Web Component Bundle

This project is published as a custom element (`<micro-formulario-ps-inscricao>`) consumed by host Angular portals. To generate a single distributable JS file, run:

```bash
npm run build:bundle
```

The command executes `ng build --configuration=production` and then concatenates all browser JS chunks (in the exact load order declared in `index.html`) into:

```
dist/micro-form-bundle.js
```

> **Note:** Angular 21 outputs JS files with content-hash names (e.g. `main-HLENQT3V.js`, `chunk-IXP6G6YN.js`). The script reads `dist/micro-form-pse-inscricao/browser/index.html` as the source of truth for chunk order — no hardcoded filenames are needed.

### Deployment artefacts

After the build, distribute the following files together:

| File | Description |
|---|---|
| `dist/micro-form-bundle.js` | Single JS bundle — register and execute the custom element |
| `dist/micro-form-pse-inscricao/browser/styles-*.css` | Global styles (Material theme + application styles) |

### Host portal integration example

```html
<!-- 1. Load the bundle and styles -->
<link rel="stylesheet" href="styles-B5QEH473.css" />
<script src="micro-form-bundle.js"></script>

<!-- 2. Use the custom element -->
<micro-formulario-ps-inscricao
  modo="create"
  api-url="https://api.example.com/api/v2"
  auth-token="<JWT>"
  processo-id="1"
></micro-formulario-ps-inscricao>
```

For Angular host portals, add `CUSTOM_ELEMENTS_SCHEMA` to the component's schemas array to suppress unknown-element warnings:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

@Component({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HostComponent {}
```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
