# Dependências do Projeto

## Frontend (Angular)

### Dependências de Produção

| Pacote | Versão | Finalidade |
|---|---|---|
| `@angular/core` | ^21.2.0 | Core do framework Angular |
| `@angular/common` | ^21.2.0 | Diretivas e pipes comuns |
| `@angular/compiler` | ^21.2.0 | Compilador Angular |
| `@angular/elements` | ^21.2.18 | Converte componentes Angular em Web Components (`customElements.define`) — pacote central do projeto |
| `@angular/forms` | ^21.2.0 | Formulários Reativos (`FormGroup`, `FormBuilder`, `Validators`) |
| `@angular/platform-browser` | ^21.2.0 | Plataforma de renderização browser |
| `@angular/platform-server` | ^21.2.0 | Renderização server-side (SSR) |
| `@angular/router` | ^21.2.0 | Roteamento |
| `@angular/ssr` | ^21.2.8 | Server-Side Rendering (Angular Universal) |
| `@angular/material` | ^21.x | Componentes de UI Material Design (`mat-form-field`, `mat-select`, `mat-datepicker`, `mat-button`, `mat-fab`, `mat-autocomplete`, `mat-error`) — ver seção abaixo |
| `@angular/cdk` | ^21.x | Primitivos de acessibilidade e comportamento (instalado junto com `@angular/material`) |
| `@angular/animations` | ^21.x | Animações dos componentes Material (instalado junto com `@angular/material`) |
| `express` | ^5.1.0 | Servidor Node.js para SSR |
| `rxjs` | ~7.8.0 | Programação reativa (Observables, operadores) |
| `tslib` | ^2.3.0 | Helpers de runtime do TypeScript |

### Dependências de Desenvolvimento

| Pacote | Versão | Finalidade |
|---|---|---|
| `@angular/build` | ^21.2.8 | Tooling de build (esbuild) |
| `@angular/cli` | ^21.2.8 | CLI do Angular (`ng serve`, `ng build`, `ng add`) |
| `@angular/compiler-cli` | ^21.2.0 | Compilação ahead-of-time (AOT) |
| `tailwindcss` | ^4.1.12 | Utilitários CSS (usado em conjunto com Angular Material) |
| `@tailwindcss/postcss` | ^4.1.12 | Integração do Tailwind com PostCSS |
| `postcss` | ^8.5.3 | Processador CSS |
| `typescript` | ~5.9.2 | Linguagem principal |
| `vitest` | ^4.0.8 | Framework de testes unitários |
| `jsdom` | ^28.0.0 | DOM virtual para ambiente de testes |
| `prettier` | ^3.8.1 | Formatador de código |
| `@types/express` | ^5.0.1 | Tipos TypeScript para Express |
| `@types/node` | ^20.17.19 | Tipos TypeScript para Node.js |

---

## Instalação do Angular Elements

O `@angular/elements` é a dependência responsável por expor componentes Angular como Web Components, o que sustenta a estratégia do projeto de publicar o micro-frontend como custom element.

Instalação via npm:

```bash
npm install @angular/elements
```

Após a instalação, a dependência fica registrada em `dependencies` do `package.json` e pode ser usada com `createCustomElement` para registrar tags customizadas como `micro-formulario-inscricao`.

---

## Instalação do Angular Material

O Angular Material **não está instalado por padrão** e deve ser adicionado via schematic oficial:

```bash
ng add @angular/material
```

O comando acima instala e configura automaticamente:
- `@angular/material` — biblioteca de componentes
- `@angular/cdk` — Component Dev Kit (dependência do Material)
- `@angular/animations` — suporte a animações dos componentes

Durante a execução, o CLI irá perguntar:
1. **Tema:** escolher um tema pré-built (ex: `Azure/Blue`, `Rose/Red`) ou `Custom`
2. **Tipografia global:** se deseja aplicar a tipografia Material à aplicação
3. **Animações:** habilitar `BrowserAnimationsModule` ou `NoopAnimationsModule`

### Componentes utilizados no projeto

Conforme definido no mockup do formulário multi-step:

| Componente | Uso |
|---|---|
| `MatFormFieldModule` | Wrapper de todos os campos do formulário (`appearance="outline"`) |
| `MatInputModule` | Campos de texto (nome, CPF, email, endereço, etc.) |
| `MatSelectModule` | Dropdowns (estado civil, nacionalidade, país, UF) |
| `MatDatepickerModule` | Seletor de data de nascimento |
| `MatButtonModule` | Botões de ação (`mat-raised-button`, `mat-stroked-button`) |
| `MatIconModule` | Ícones prefixados nos campos e nos FABs |
| `MatAutocompleteModule` | Campo de "Campo de atuação" com filtragem |
| `MatRadioModule` | Radio buttons (PCD / Afrodescendente) |
| `MatTooltipModule` | Tooltips informativos nas vagas |
| `MatFabButton` | Botões flutuantes (WhatsApp, voltar ao topo) |

---

## Backend (API Laravel — referência)

Dependências do servidor que este micro-frontend consome. Não fazem parte deste repositório.

| Pacote PHP | Finalidade |
|---|---|
| `spatie/laravel-model-states` | Máquina de estados (`DeferimentoState`) para inscrições, avaliações e certificados |
| `spatie/laravel-query-builder` | Filtros, ordenação e includes via query string |

---

## Instalação completa

```bash
# Instalar dependências do projeto
npm install

# Adicionar Angular Elements (caso ainda não esteja presente)
npm install @angular/elements

# Adicionar Angular Material (executar uma única vez)
ng add @angular/material
```
