## Descrição de Mockup: Formulário Único Contínuo — "Processo Seletivo"

---

### 1. Estrutura Geral da Página

A tela representa um formulário de inscrição em processo seletivo público, organizado em **um único formulário contínuo e scrollável**, sem divisão em etapas. Todas as seções (Dados Pessoais, Endereço, Informações Adicionais, Formação, Experiência e Documentos) são exibidas na mesma página, uma abaixo da outra. O layout é centralizado em um container de largura máxima (~1100px), com fundo branco/cinza claro para a área de conteúdo e fundo branco puro no cabeçalho. A página tem scroll vertical.

---

### 2. Cabeçalho (Header / Navbar)

- **Posição:** fixo no topo, fundo branco, sem sombra evidente.
- **Logomarca:** lado esquerdo — logotipo colorido "educa Franco da Rocha" com ícone de escola/chapéu. Texto em duas linhas, fonte pequena.
- **Menu de Navegação:** centralizado/direita, itens dispostos em linha horizontal com espaçamento generoso. Cada item tem **ícone acima do texto** (estilo icon-top nav):
  - **HOME** — ícone de casa
  - **CONTATO** — ícone de envelope
  - **GESTÃO EDUCACIONAL** — ícone de chapéu de formatura; possui subtítulo menor "Consultar Inscrição" em cinza
  - **PORTAL DO ALUNO** — ícone de estudante com chapéu
  - **PORTAL DO CEJA** — ícone de prédio/escola
  - **CENTRAL DE VAGAS** — ícone de grupo de pessoas
- **Tipografia dos itens:** maiúsculas, fonte pequena (~13px), cor escura (#333 ou similar).
- **Sem barra de busca, sem avatar de usuário logado** visível nesta tela.

---

### 3. Área de Título da Página

- **Layout:** linha horizontal com ícone circular à esquerda + bloco de texto + badge informativo à direita.
- **Ícone circular:** círculo sólido azul (~60px), contém ícone branco de pessoa (silhueta de usuário).
- **Título:** "Processo Seletivo" — fonte grande (~28–32px), negrito, cor preta/muito escura.
- **Subtítulo:** "Preencha todos os seus dados para concluir a inscrição" — fonte menor (~14–15px), cor cinza médio, logo abaixo do título.
- **Badge à direita:** retângulo azul claro (background `#e8f4fd` ou similar), borda arredondada, ícone de info (círculo com "i") azul à esquerda + texto "Todos os campos com * são obrigatórios." em azul escuro, fonte ~13px.

---

### 4. Índice Visual de Seções (Âncoras)

- **Posição:** opcional — barra lateral fixa ou linha horizontal de âncoras de navegação rápida abaixo do título da página.
- **Estrutura:** lista de links que levam diretamente à seção correspondente ao clicar (scroll suave).
- **Itens:** Dados Pessoais · Endereço · Informações Adicionais · Formação · Experiência · Documentos.
- **Estilo:** links em cinza, com realce azul para a seção atualmente visível no viewport (comportamento de `scrollspy`).
- **É opcional:** pode ser omitido em favor de um layout puramente scrollável sem navegação lateral.

---

### 5. Card Principal do Formulário

- **Container:** card com fundo branco, bordas suavemente arredondadas (4–8px), leve sombra (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`), padding interno generoso (~24–32px).
- Dividido em **6 seções com cabeçalho de seção** cada, exibidas sequencialmente na mesma página: Dados Pessoais, Endereço, Informações Adicionais, Formação, Experiência e Documentos.
- Cada seção é separada da seguinte por um `<mat-divider>` ou espaçamento generoso (`mb-10`).

---

### 5.1 Seção: DADOS PESSOAIS

**Cabeçalho da seção:**
- Ícone azul de pessoa/usuário à esquerda.
- Texto "DADOS PESSOAIS" em maiúsculas, fonte ~13px, cor azul médio (`#1565C0` ou `#1976D2`), negrito.
- Linha separadora ou espaçamento abaixo.

**Layout dos campos em grid responsivo (colunas):**

**Linha 1:** 2 colunas (50% / 50%)
- **CPF *** — `mat-form-field` com `appearance="outline"`. Label flutuante "CPF". Ícone de pessoa (material icon `person` ou similar) prefixado à esquerda. Placeholder: "Digite seu CPF". Campo obrigatório (asterisco).
- **Data de nascimento *** — `mat-form-field` com `appearance="outline"`. Label flutuante "Data de nascimento". Ícone de calendário prefixado. Placeholder: "dd/mm/aaaa". Ícone de calendário sufixado à direita (botão de abertura do datepicker). Campo obrigatório.

**Linha 2:** 1 coluna (100%)
- **Nome Completo *** — `mat-form-field` com `appearance="outline"`. Label flutuante "Nome Completo". Ícone de pessoa prefixado. Placeholder: "Digite seu nome completo". Campo obrigatório.

**Linha 3:** 2 colunas (50% / 50%)
- **Telefone** — `mat-form-field` com `appearance="outline"`. Label flutuante "Telefone". Ícone de telefone prefixado. Placeholder: "(11) 99999-9999". Campo **não obrigatório** (sem asterisco).
- **Email *** — `mat-form-field` com `appearance="outline"`. Label flutuante "Email". Ícone de envelope prefixado. Placeholder: "Digite seu e-mail". Campo obrigatório.

**Linha 4:** 3 colunas (33% / 33% / 33%)
- **Estado Civil *** — `mat-select` dentro de `mat-form-field outline`. Label flutuante "Estado Civil". Ícone de coração/perfil prefixado. Valor padrão: "Selecione". Seta dropdown à direita. Obrigatório.
- **Nacionalidade *** — `mat-select` com `mat-form-field outline`. Label flutuante "Nacionalidade". Ícone de globo prefixado. Valor padrão pré-selecionado: **"Brasileira"**. Obrigatório.
- **País de origem *** — `mat-select` com `mat-form-field outline`. Label flutuante "País de origem". Ícone de globo prefixado. Valor padrão pré-selecionado: **"Brasil"**. Obrigatório.

**Linha 5:** 1 coluna (100%)
- **Campo de atuação *** — `mat-select` (ou autocomplete com `mat-autocomplete`) dentro de `mat-form-field outline`. Label flutuante "Campo de atuação". Ícone de pasta/briefcase prefixado. Placeholder: "Selecione ou digite sua área de atuação". Comportamento de autocomplete (digitação filtra opções). Obrigatório.

---

### 5.2 Seção: ENDEREÇO

**Cabeçalho da seção:**
- Ícone de localização (pin/map-marker) azul à esquerda.
- Texto "ENDEREÇO" em maiúsculas, mesma estilização da seção anterior.

**Linha 1:** 3 colunas (~25% / ~45% / ~30%)
- **CEP *** — `mat-form-field outline`. Label "CEP". Ícone de prédio/mapa prefixado. Placeholder: "Digite o CEP". Ao lado do input, botão secundário: **"Buscar endereço"** com ícone de lupa à esquerda. Estilo: `outlined button` azul (`mat-stroked-button` com cor primária). Obrigatório.
- **Rua *** — `mat-form-field outline`. Label "Rua". Ícone de casa prefixado. Placeholder: "Digite o nome da rua". Obrigatório.
- **Número *** — `mat-form-field outline`. Label "Número". Ícone de `#` (hashtag) prefixado. Placeholder: "Digite o número". Obrigatório.

**Linha 2:** 4 colunas (~25% / ~25% / ~20% / ~30%)
- **Bairro *** — `mat-form-field outline`. Label "Bairro". Ícone de mapa/bairro prefixado. Placeholder: "Digite o nome do bairro". Obrigatório.
- **Cidade *** — `mat-form-field outline`. Label "Cidade". Ícone de cidade prefixado. Placeholder: "Digite o nome da cidade". Obrigatório.
- **UF *** — `mat-select` com `mat-form-field outline`. Label "UF". Placeholder: "Selecione". Obrigatório.
- **Complemento** — `mat-form-field outline`. Label "Complemento". Ícone prefixado. Placeholder: "Opcional". **Não obrigatório**.

---

### 5.3 Seção: INFORMAÇÕES ADICIONAIS

**Cabeçalho da seção:**
- Ícone de info ou configurações azul à esquerda.
- Texto "INFORMAÇÕES ADICIONAIS" em maiúsculas.

**Linha 1:** 2 grupos (50% / 50%)

- **Vaga Afrodescendente** — Label com ícone de info (tooltip) ao lado do texto. Abaixo: grupo de radio buttons em linha:
  - `Não` — selecionado por padrão (preenchido/azul)
  - `Sim` — não selecionado
- **Vaga PCD** — Label com ícone de info (tooltip) ao lado. Abaixo: mesmo padrão de radio buttons:
  - `Não` — selecionado por padrão
  - `Sim` — não selecionado

**Bloco de aviso (Alert/Banner):**
- **Background:** rosa claro/vermelho claro (`#fff3cd` ou `#fdecea`) — destaque de atenção.
- **Borda:** sem borda evidente ou borda esquerda vermelha.
- **Texto:** em vermelho escuro ou cinza escuro, fonte ~12–13px, itálico ou normal:
  > *"* Todos os candidatos que optem por concorrer na condição de Pessoa com Deficiência (PcD) deverão enviar, no ato da inscrição, parecer emitido por especialista da área de sua deficiência ou condição diferenciada (Laudo médico com CID e data de emissão não superior a 180 dias)."*
- Ocupa 100% da largura da seção.

---

### 5.4 Seção: FORMAÇÃO

**Cabeçalho da seção:**
- Ícone de chapéu de formatura azul à esquerda.
- Texto "FORMAÇÃO" em maiúsculas, mesma estilização das seções anteriores.

**Linha 1:** 2 colunas (50% / 50%)
- **Escolaridade *** — `mat-select` dentro de `mat-form-field outline`. Label "Escolaridade". Ícone de diploma prefixado. Obrigatório.
- **Curso/Área de Formação *** — `mat-form-field outline`. Label "Curso / Área de Formação". Ícone de pasta prefixado. Placeholder: "Ex.: Pedagogia, Administração…". Obrigatório.

**Linha 2:** 2 colunas (50% / 50%)
- **Instituição de Ensino** — `mat-form-field outline`. Label "Instituição de Ensino". Ícone de prédio prefixado. Placeholder: "Nome da instituição". Campo não obrigatório.
- **Ano de Conclusão** — `mat-form-field outline`. Label "Ano de Conclusão". Ícone de calendário prefixado. Placeholder: "AAAA". Campo não obrigatório.

---

### 5.5 Seção: EXPERIÊNCIA

**Cabeçalho da seção:**
- Ícone de maleta/briefcase azul à esquerda.
- Texto "EXPERIÊNCIA" em maiúsculas.

**Linha 1:** 1 coluna (100%)
- **Possui experiência na área?** — grupo de radio buttons em linha:
  - `Não` — selecionado por padrão
  - `Sim` — exibe campos adicionais abaixo ao ser selecionado (expansão condicional)

**Campos condicionais (visíveis apenas quando "Sim" selecionado):**

**Linha 2:** 2 colunas (50% / 50%)
- **Cargo/Função *** — `mat-form-field outline`. Label "Cargo / Função". Ícone de pessoa prefixado. Obrigatório.
- **Empresa/Instituição *** — `mat-form-field outline`. Label "Empresa / Instituição". Ícone de prédio prefixado. Obrigatório.

**Linha 3:** 2 colunas (50% / 50%)
- **Período de início *** — `mat-form-field outline`. Label "Início". Ícone de calendário prefixado. Placeholder: "mm/aaaa". Obrigatório.
- **Período de término** — `mat-form-field outline`. Label "Término". Ícone de calendário prefixado. Placeholder: "mm/aaaa ou "atual"". Não obrigatório.

**Linha 4:** 1 coluna (100%)
- **Descrição das atividades** — `mat-form-field outline` com `textarea`. Label "Descrição das atividades". Placeholder: "Descreva brevemente as principais atividades desempenhadas". Não obrigatório.

---

### 5.6 Seção: DOCUMENTOS

**Cabeçalho da seção:**
- Ícone de documento/arquivo azul à esquerda.
- Texto "DOCUMENTOS" em maiúsculas.

**Bloco de instrução:**
- Texto informativo em cinza escuro: "Anexe os documentos obrigatórios nos formatos PDF, JPG ou PNG (tamanho máximo: 5 MB por arquivo)."

**Linha 1:** 1 coluna (100%)
- **RG ou CNH (frente) *** — componente de upload de arquivo (`input type=file` estilizado ou `mat-form-field` com botão). Ícone de upload. Texto: "Selecionar arquivo" + nome do arquivo após seleção. Obrigatório.

**Linha 2:** 1 coluna (100%)
- **Comprovante de residência *** — mesmo componente de upload. Obrigatório.

**Linha 3:** 1 coluna (100%)
- **Comprovante de escolaridade *** — mesmo componente de upload. Obrigatório.

**Linha 4 (condicional — visível apenas se PCD = Sim):** 1 coluna (100%)
- **Laudo médico (PcD) *** — mesmo componente de upload. Obrigatório quando PcD selecionado.

---

### 6. Rodapé do Formulário (Ações)

- **Layout:** linha horizontal, `space-between` ou equivalente — botão secundário à esquerda, botão primário à direita.
- **Botão esquerdo — "Limpar formulário":**
  - Estilo: `mat-stroked-button` (outlined) ou botão fantasma, sem fundo colorido.
  - Ícone de refresh/seta circular (`refresh`) à esquerda do texto.
  - Texto: "Limpar formulário".
  - Cor: cinza ou cor neutra.
- **Botão direito — "Enviar inscrição":**
  - Estilo: `mat-raised-button` ou `mat-flat-button` com cor primária (azul sólido `#1976D2`).
  - Texto: "Enviar inscrição" com ícone `send` ou `check` sufixado.
  - Padding generoso (botão largo, ~180–200px).
  - Ao clicar, executa validação completa de todo o formulário antes de submeter; em caso de erro, faz scroll automático até o primeiro campo inválido e o destaca.

---

### 7. Botões Flutuantes (FABs — Floating Action Buttons)

- **Posição:** canto inferior direito da tela, empilhados verticalmente com ~8px de gap.
- **FAB 1 — WhatsApp:** círculo verde (~50–56px de diâmetro), ícone de chat/WhatsApp branco centralizado. `mat-fab` com cor customizada verde.
- **FAB 2 — Voltar ao topo:** círculo azul (~50–56px), ícone de seta apontando para cima (`arrow_upward`). `mat-mini-fab` ou `mat-fab` com cor primária.

---

### 8. Especificações de Design System (para Angular Material + Tailwind)

| Token | Valor sugerido |
|---|---|
| Cor primária | `#1565C0` / `#1976D2` |
| Cor de perigo/alerta | `#d32f2f` |
| Fundo do card | `#ffffff` |
| Fundo da página | `#f5f5f5` ou `#fafafa` |
| Border-radius dos campos | `4px` |
| `mat-form-field` appearance | `outline` |
| Tipografia título | `mat-headline-4` ou equivalente |
| Tipografia seção | `text-xs font-bold uppercase tracking-widest` (Tailwind) |
| Espaçamento entre seções | `gap-6` ou `mb-8` |
| Grid de campos | CSS Grid com `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` e variações por linha |

---

### 9. Comportamentos e Interações Esperados

1. **Formulário único:** todas as seções são exibidas na mesma página sem paginação ou navegação entre etapas. O usuário rola a página normalmente para preencher todo o formulário.
2. **Buscar endereço (CEP):** ao clicar, chama API de CEP (ex: ViaCEP), preenche automaticamente Rua, Bairro, Cidade e UF.
3. **Campo de atuação:** autocomplete com filtragem ao digitar.
4. **Tooltip nas vagas (PCD/Afro):** ao hover/click no ícone "i", exibe tooltip com informação adicional.
5. **Validação reativa:** todos os campos `*` com validators obrigatórios; mensagens de erro abaixo do campo (`mat-error`). Ao submeter, todos os campos inválidos são destacados simultaneamente.
6. **Scroll automático ao erro:** ao clicar em "Enviar inscrição" com erros de validação, a página faz scroll até o primeiro campo inválido.
7. **Campos condicionais:** a seção de upload do laudo médico (PcD) e os campos de detalhamento de experiência são exibidos/ocultados de forma reativa com base nas seleções do usuário.
8. **Limpar formulário:** reset completo do `FormGroup` (todas as seções) e reset do estado visual de todos os campos.
9. **Responsividade:** em mobile, as colunas colapsam para layout de 1 coluna em todas as seções.

Created 2 todos
