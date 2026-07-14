### Fase 1: Setup do Projeto e Dependências

Abra o seu terminal na pasta onde deseja criar o projeto, abra o Copilot Chat e use os seguintes prompts para preparar o terreno.

**Prompt 1 (Criação do Projeto):**

> "Gere os comandos do Angular CLI para criar um novo projeto Angular chamado `micro-forms` com a flag `--standalone`. Em seguida, mostre o comando para adicionar o pacote `@angular/elements` a este projeto."

### Fase 2: Criação dos Componentes de Formulário (Dumb & Smart)

Agora, vamos pedir ao Copilot para criar a estrutura dos formulários usando Formulários Reativos.

**Prompt 2 (O Componente de Apresentação / Dumb Component):**

> "Crie um componente Angular Standalone chamado `FormEditComponent`. Ele deve receber um `@Input()` chamado `parentForm` do tipo `FormGroup` (do `@angular/forms`). No template HTML, crie os campos de input para 'Nome', 'Email' e 'Documento', vinculando-os ao `parentForm` usando `formControlName`. Inclua estilização CSS básica."

**Prompt 3 (O Componente Inteligente / Smart Component):**

> "Crie um componente Angular Standalone chamado `SmartFormComponent`.
> 
> 1. Ele deve instanciar um `FormGroup` usando `FormBuilder` com os campos 'nome', 'email' e 'documento' (todos obrigatórios).
>     
> 2. Crie um `@Input()` chamado `modo` que aceita as strings 'create', 'edit' ou 'view'.
>     
> 3. Crie um `@Output()` chamado `actionSubmit` que emite o valor do formulário quando ele for válido.
>     
> 4. No template, use a diretiva `@switch` (ou `*ngSwitch`) baseada na variável `modo` para renderizar o `<app-form-edit>` passando o `FormGroup` via `@Input`. Adicione um botão de 'Salvar' que dispara o `@Output`."
>     

### Fase 3: Registro do Web Component (Angular Elements)

Esta é a parte crucial onde encapsulamos o Angular dentro de uma tag HTML genérica. Peça ao Copilot para configurar o ponto de entrada da aplicação.

**Prompt 4 (Transformando em Custom Element):**

> "Modifique o arquivo `main.ts` (ou o arquivo de bootstrap da aplicação Angular) para usar o `@angular/elements`.
> 
> Escreva o código para pegar o `SmartFormComponent`, passá-lo na função `createCustomElement` injetando o `EnvironmentInjector`, e então registrá-lo no DOM usando `customElements.define` com a tag `<micro-formulario-ps-inscricao>`. Lembre-se de remover o bootstrap padrão do `AppComponent`, pois este projeto servirá apenas para expor o web component."

### Fase 4: Build e Empacotamento

Por padrão, o Angular gera vários arquivos `.js` (main, polyfills, runtime). Para facilitar o uso nos portais, precisamos empacotar tudo em um único arquivo.

**Prompt 5 (Script de Build Unificado):**

> "Crie um script em Node.js ou um script de terminal (bash/powershell) que execute o `ng build` do projeto e, após a conclusão, concatene os arquivos gerados na pasta `dist` (como `runtime.js`, `polyfills.js` e `main.js`) em um único arquivo chamado `micro-form-bundle.js`. Inclua as instruções de como adicionar esse script no `package.json`."

### Fase 5: Consumo nos Portais (Professor / Comunidade)

Após gerar e hospedar o seu arquivo `micro-form-bundle.js`, você precisará integrar isso nos portais existentes. Abra o repositório do Portal do Professor (ou da Comunidade) e use este prompt no Copilot:

**Prompt 6 (Integração com o Hospedeiro):**

> "Tenho um Web Component customizado com a tag `<micro-formulario-ps-inscricao modo="create"></micro-formulario-ps-inscricao>`.
> 
> 1. Mostre como adicionar o `CUSTOM_ELEMENTS_SCHEMA` no meu componente Angular Standalone (ou NgModule) para que o Angular não lance erro sobre essa tag desconhecida.
>     
> 2. Mostre no template HTML como escutar um evento customizado nativo (CustomEvent) chamado `actionSubmit` vindo dessa tag e como tratá-lo no arquivo TypeScript (exibindo os dados no console)."
>     

Seguindo esses prompts sequencialmente, o Copilot terá o contexto exato do que você quer construir em cada camada da arquitetura, gerando um código muito mais limpo e direcionado ao seu desafio.
