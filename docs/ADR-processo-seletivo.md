# ADR: Módulo de Processo Seletivo (RH)

**Status:** Ativo  
**Data:** 2026-07-09  
**Área:** Recursos Humanos  
**Base URL:** `/api/v2/processo-seletivo`  
**Middleware:** `logRoute` (sem autenticação obrigatória no grupo — verificada por Gate em cada ação)

---

## Contexto

O módulo de Processo Seletivo permite cadastrar e gerenciar processos seletivos internos, as inscrições de candidatos e os documentos associados (laudos, avaliações, certificados). O ciclo de vida de uma inscrição é controlado por uma máquina de estados (`DeferimentoState`), que também se aplica às avaliações e aos certificados individualmente.

---

## Modelo de Domínio

### Hierarquia de entidades

```
ProcessoSeletivo (1) ──── (N) ProcessoSeletivoInscricao
                                  │
                                  ├── (N) ProcessoSeletivoLaudoAnexos   (laudos médicos, obrigatório para PCD)
                                  ├── (1) ProcessoSeletivoAvaliacao     (notas e condições especiais)
                                  └── (N) ProcessoSeletivoCertificado
                                              └── (N) ProcessoSeletivoCertificadoAnexos

ProcessoSeletivo ─── BelongsToMany ─── Cargo   (tabela pivot: tbprocesso_seletivo_cargos)
ProcessoSeletivo ─── MorphOne      ─── Processo (polimórfico, entidade do módulo de processos)
```

### `ProcessoSeletivo`

| Campo       | Tipo    | Obrigatório | Descrição                              |
|-------------|---------|-------------|----------------------------------------|
| `id`        | integer | —           | PK (`tbprocesso_seletivo_id`)          |
| `titulo`    | string  | sim         | Título do processo (máx. 255)          |
| `descricao` | string  | sim         | Descrição (máx. 255)                   |
| `ano`       | integer | sim         | Ano de referência                      |
| `ativo`     | boolean | não         | Se o processo está aberto              |
| `cargos`    | array   | —           | Relacionamento com cargos (incluso via `?include=cargos`) |

Suporta **soft delete**.

---

### `ProcessoSeletivoInscricao`

Identificada por **UUID** (todas as rotas usam `{uuid}`, não ID numérico).

| Campo                 | Tipo    | Obrigatório | Descrição                                         |
|-----------------------|---------|-------------|---------------------------------------------------|
| `uuid`                | string  | —           | Identificador público (gerado automaticamente)    |
| `numero_inscricao`    | integer | —           | Número sequencial (gerado automaticamente)        |
| `status`              | string  | —           | Estado atual (ver Máquina de Estados)             |
| `tbprocesso_seletivo_id` | integer | sim      | FK para `ProcessoSeletivo`                        |
| `nome`                | string  | sim         | Nome completo do candidato                        |
| `data_nascimento`     | date    | sim         | Formato `YYYY-MM-DD`                              |
| `tbcargos_id`         | integer | sim         | FK para `Cargo`                                   |
| `email`               | string  | sim         | E-mail                                            |
| `cpf`                 | string  | sim         | Apenas dígitos, máx. 11 caracteres                |
| `filhos`              | integer | sim         | Número de filhos                                  |
| `rg`                  | string  | sim         | Apenas dígitos, máx. 9 caracteres                 |
| `rg_orgao_emissor`    | string  | sim         | Ex: `SSP`                                         |
| `rg_uf_orgao_emissor` | string  | sim         | Sigla do estado, ex: `SP`                         |
| `telefone`            | string  | sim         | Apenas dígitos                                    |
| `nacionalidade`       | string  | sim         | Ex: `Brasileira`                                  |
| `tbpaises_id`         | integer | sim         | FK para `Paises`                                  |
| `cep`                 | string  | sim         | Apenas dígitos, máx. 8 caracteres                 |
| `estado`              | string  | sim         | Nome do estado                                    |
| `cidade`              | string  | sim         | Nome da cidade                                    |
| `bairro`              | string  | sim         | Nome do bairro                                    |
| `endereco`            | string  | sim         | Logradouro                                        |
| `numero`              | string  | sim         | Número do endereço                                |
| `complemento`         | string  | não         | Complemento do endereço                           |
| `estado_civil`        | string  | sim         | Ex: `Solteiro`, `Casado`                          |
| `pcd`                 | boolean | sim         | Pessoa com Deficiência                            |
| `descricao_pcd`       | string  | não         | Descrição da deficiência (quando `pcd=true`)      |
| `afrodescendente`     | boolean | sim         | Autodeclaração étnico-racial                      |
| `notificacao`         | boolean | não         | Habilita notificações para o candidato            |

Suporta **soft delete**.

---

### `ProcessoSeletivoAvaliacao`

Uma inscrição tem **no máximo uma** avaliação (`hasOne`).

| Campo                         | Tipo    | Obrigatório | Descrição                            |
|-------------------------------|---------|-------------|--------------------------------------|
| `id`                          | integer | —           | PK                                   |
| `nota`                        | float   | não         | Nota obtida na avaliação             |
| `status`                      | string  | —           | Estado próprio (DeferimentoState)    |
| `condicao_especial`           | string  | não         | Indicação de condição especial       |
| `observacao`                  | string  | não         | Observações livres                   |

Suporta **soft delete**.

---

### `ProcessoSeletivoCertificado`

Uma inscrição pode ter **múltiplos** certificados (`hasMany`).

| Campo             | Tipo    | Obrigatório | Descrição                         |
|-------------------|---------|-------------|-----------------------------------|
| `id`              | integer | —           | PK                                |
| `tipo`            | string  | sim         | Tipo do certificado, ex: `Graduação` |
| `experiencia`     | decimal | não         | Experiência profissional          |
| `assiduidade`     | decimal | não         | Nível de assiduidade              |
| `pontuacao_final` | decimal | não         | Pontuação final calculada         |
| `status`          | string  | —           | Estado próprio (DeferimentoState) |
| `anexos`          | array   | —           | Arquivos do certificado (ver abaixo) |

Suporta **soft delete**.

---

### `ProcessoSeletivoLaudoAnexos`

Arquivos de laudo médico vinculados à inscrição (obrigatórios quando `pcd=true`).

| Campo         | Tipo   | Obrigatório | Descrição                          |
|---------------|--------|-------------|------------------------------------|
| `id`          | integer | —          | PK                                 |
| `data`        | date   | sim         | Data do laudo (`YYYY-MM-DD`)       |
| `filename`    | string | sim         | Nome original do arquivo           |
| `filetype`    | string | sim         | MIME type, ex: `application/pdf`   |
| `remote_path` | string | —           | Caminho no armazenamento remoto    |
| `file`        | binary | sim (store) | Arquivo em Base64 ou multipart     |

Suporta **soft delete**.

---

### `ProcessoSeletivoCertificadoAnexos`

Arquivos vinculados a um certificado.

| Campo         | Tipo   | Obrigatório | Descrição                       |
|---------------|--------|-------------|---------------------------------|
| `id`          | integer | —          | PK                              |
| `filename`    | string | sim         | Nome original do arquivo        |
| `filetype`    | string | sim         | MIME type                       |
| `remote_path` | string | —           | Caminho no armazenamento remoto |
| `file`        | binary | sim (store) | Arquivo em Base64 ou multipart  |

Suporta **soft delete**.

---

## Máquina de Estados (`DeferimentoState`)

O `status` de inscrições, avaliações e certificados é controlado pela mesma máquina de estados.

### Estados

| Valor                  | Label                 | Cor       | Ícone (FA)              |
|------------------------|-----------------------|-----------|-------------------------|
| `aguardando_conferencia` | Aguardando Conferência | `#868e96` | `fa fa-folder-open`   |
| `deferida`             | Deferido(a)           | `#0cc27e` | `fa fa-check-circle-o`  |
| `indeferida`           | Indeferido(a)         | `#ff586b` | `fa fa-times-circle-o`  |
| `consolidada`          | Consolidado(a)        | `#009da0` | `fa fa-folder`          |

**Estado padrão:** `aguardando_conferencia`

### Transições permitidas

```
aguardando_conferencia ──► deferida
aguardando_conferencia ──► indeferida
deferida               ──► aguardando_conferencia
deferida               ──► indeferida
deferida               ──► consolidada       ← apenas inscrições (via rota dedicada)
indeferida             ──► aguardando_conferencia
indeferida             ──► deferida
consolidada            ──► aguardando_conferencia
consolidada            ──► deferida
consolidada            ──► indeferida
```

> **Nota sobre inscrições:** A rota de consolidação (`PATCH /inscricoes/{uuid}/consolidar`) só existe para inscrições. Avaliações e certificados não possuem essa transição via rota.

### Objeto `status` retornado na API

```json
{
  "status": {
    "descricao": "Aguardando Conferência",
    "cor": "#868e96",
    "icone": "fa fa-folder-open",
    "badge": "badge badge-secondary",
    "btn": "btn btn-secondary"
  }
}
```

---

## Endpoints — Processo Seletivo

### `GET /api/v2/processo-seletivo`

Lista processos seletivos paginados.

**Query params:**

| Parâmetro                  | Tipo     | Descrição                                  |
|----------------------------|----------|--------------------------------------------|
| `filtro[titulo]`           | string   | Busca parcial por título                   |
| `filtro[descricao]`        | string   | Busca parcial por descrição                |
| `filtro[ano]`              | integer  | Ano exato                                  |
| `filtro[ativo]`            | boolean  | Status ativo                               |
| `filtro[created_at_ini]`   | datetime | Criado após (Y-m-d H:i:s)                  |
| `filtro[created_at_fim]`   | datetime | Criado antes de (Y-m-d H:i:s)              |
| `filtro[updated_at_ini]`   | datetime | Atualizado após                            |
| `filtro[updated_at_fim]`   | datetime | Atualizado antes                           |
| `filtro[deleted_at_ini]`   | datetime | Excluído após                              |
| `filtro[deleted_at_fim]`   | datetime | Excluído antes                             |
| `filtro[only_trashed]`     | boolean  | Apenas registros excluídos (soft deleted)  |
| `include`                  | string   | Relacionamentos: `cargos`                  |
| `sort`                     | string   | `titulo`, `-titulo`, `ano`, `-ano`, `ativo`, `-ativo`, `created_at`, `-created_at`, `updated_at`, `-updated_at`, `deleted_at`, `-deleted_at` |

**Resposta 200:**
```json
{
  "data": [/* ProcessoSeletivoResource[] */],
  "links": {},
  "meta": {}
}
```

---

### `POST /api/v2/processo-seletivo`

Cria um novo processo seletivo.

**Body (JSON):**
```json
{
  "titulo": "Processo Seletivo 2025",
  "descricao": "Contratação de professores",
  "ano": 2025,
  "ativo": true,
  "cargos": [1, 2, 3]
}
```

| Campo     | Obrigatório | Regras                              |
|-----------|-------------|-------------------------------------|
| `titulo`  | sim         | string, máx. 255                    |
| `descricao` | sim       | string, máx. 255                    |
| `ano`     | sim         | integer                             |
| `ativo`   | não         | boolean                             |
| `cargos`  | sim         | array de IDs existentes em `tbcargos` |

**Resposta 201:**
```json
{
  "message": "Processo seletivo criado com sucesso!",
  "data": { /* ProcessoSeletivoResource */ }
}
```

---

### `GET /api/v2/processo-seletivo/{id}`

Retorna um processo seletivo específico.

**Resposta 200:**
```json
{
  "message": "Processo seletivo encontrado!",
  "data": { /* ProcessoSeletivoResource */ }
}
```

---

### `PUT /api/v2/processo-seletivo/{id}`

Atualiza um processo seletivo. Todos os campos são opcionais (`sometimes`).

**Body (JSON):** mesmos campos do `POST`, todos opcionais.

**Resposta 200:**
```json
{
  "message": "Processo seletivo atualizado com sucesso!",
  "data": { /* ProcessoSeletivoResource */ }
}
```

---

### `DELETE /api/v2/processo-seletivo/{id}`

Soft delete de um processo seletivo.

**Resposta 200:**
```json
{ "message": "Processo seletivo excluído com sucesso!" }
```

---

### `PATCH /api/v2/processo-seletivo/{id}/restaurar`

Restaura um processo seletivo excluído.

**Resposta 200:**
```json
{ "message": "Processo seletivo restaurado com sucesso!" }
```

---

### `GET /api/v2/processo-seletivo/{id}/cargos`

Lista os cargos associados a um processo seletivo específico.

**Resposta 200:**
```json
{
  "success": true,
  "message": "Cargos do processo seletivo retornados com sucesso!",
  "data": [
    { "id": 1, "descricao": "Médico Clínico Geral" }
  ]
}
```

---

### `GET /api/v2/processo-seletivo/cargos`

Lista **todos** os cargos disponíveis no sistema.

**Resposta 200:**
```json
{
  "message": "Cargos retornados com sucesso!",
  "data": [
    { "id": 1, "descricao": "Médico Clínico Geral" }
  ]
}
```

---

### `GET /api/v2/processo-seletivo/paises`

Lista todos os países disponíveis.

**Resposta 200:**
```json
{
  "message": "Países listados com sucesso!",
  "data": [
    { "id": 1, "descricao": "Brasil" }
  ]
}
```

---

### `GET /api/v2/processo-seletivo/estados`

Lista todos os estados (UFs) disponíveis.

**Resposta 200:**
```json
{
  "message": "Estados listados com sucesso!",
  "data": [
    { "id": 1, "descricao": "São Paulo" }
  ]
}
```

---

## Endpoints — Inscrições

### `GET /api/v2/processo-seletivo/inscricoes`

Lista inscrições paginadas com suporte a filtros, ordenação e inclusão de relacionamentos.

**Query params:**

| Parâmetro                        | Tipo     | Descrição                                   |
|----------------------------------|----------|---------------------------------------------|
| `include`                        | string   | Relacionamentos: `processoSeletivo`, `cargo`, `pais`, `laudo`, `avaliacao`, `certificados.anexos` (separados por vírgula) |
| `sort`                           | string   | `nome`, `-nome`, `data_nascimento`, `-data_nascimento`, `created_at`, `-created_at`, etc. (prefixo `-` = decrescente) |
| `filtro[id]`                     | integer  | ID exato                                    |
| `filtro[status]`                 | string   | Estado exato (ex: `deferida`)               |
| `filtro[nome]`                   | string   | Nome exato                                  |
| `filtro[email]`                  | string   | Busca parcial por e-mail                    |
| `filtro[cpf]`                    | string   | Busca parcial por CPF                       |
| `filtro[rg]`                     | string   | Busca parcial por RG                        |
| `filtro[telefone]`               | string   | Busca parcial por telefone                  |
| `filtro[numero_inscricao]`       | integer  | Número exato de inscrição                   |
| `filtro[pcd]`                    | boolean  | PCD                                         |
| `filtro[afrodescendente]`        | boolean  | Afrodescendente                             |
| `filtro[data_nascimento_ini]`    | date     | Data de nascimento a partir de (YYYY-MM-DD) |
| `filtro[data_nascimento_fim]`    | date     | Data de nascimento até (YYYY-MM-DD)         |
| `filtro[created_at_ini]`         | datetime | Criado após                                 |
| `filtro[created_at_fim]`         | datetime | Criado antes                                |
| `filtro[only_trashed]`           | boolean  | Apenas registros excluídos (soft deleted)   |

**Resposta 200:**
```json
{
  "data": [/* ProcessoSeletivoInscricaoResource[] */],
  "links": {},
  "meta": {}
}
```

---

### `POST /api/v2/processo-seletivo/inscricoes`

Cria uma nova inscrição incluindo documentos.

**Body (JSON):**
```json
{
  "tbprocesso_seletivo_id": 1,
  "notificacao": true,
  "nome": "João da Silva",
  "data_nascimento": "1990-01-01",
  "tbcargos_id": 2,
  "email": "joao@email.com",
  "cpf": "12345678901",
  "filhos": 0,
  "rg": "123456789",
  "rg_orgao_emissor": "SSP",
  "rg_uf_orgao_emissor": "SP",
  "telefone": "11987654321",
  "nacionalidade": "Brasileira",
  "tbpaises_id": 1,
  "cep": "12345678",
  "estado": "São Paulo",
  "cidade": "São Paulo",
  "bairro": "Centro",
  "endereco": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 45",
  "estado_civil": "Solteiro",
  "pcd": false,
  "descricao_pcd": null,
  "afrodescendente": false,
  "laudos": [
    {
      "data": "2023-01-01",
      "file": "<base64>",
      "filename": "laudo.pdf",
      "filetype": "application/pdf"
    }
  ],
  "avaliacao": [
    {
      "nota": 8.5,
      "condicao_especial": false,
      "descricao_condicao_especial": null,
      "observacao": "Candidato com bom desempenho"
    }
  ],
  "certificados": [
    {
      "tipo": "Graduação",
      "anexos": [
        {
          "file": "<base64>",
          "filename": "diploma.pdf",
          "filetype": "application/pdf"
        }
      ]
    }
  ]
}
```

> **Regra:** `laudos` é obrigatório quando `pcd = true`.

**Resposta 201:**
```json
{
  "message": "Inscrição criada com sucesso!",
  "data": { /* ProcessoSeletivoInscricaoResource */ }
}
```

---

### `GET /api/v2/processo-seletivo/inscricoes/{uuid}`

Retorna os detalhes completos de uma inscrição incluindo todos os relacionamentos.

**Resposta 200:**
```json
{
  "message": "Inscrição encontrada com sucesso!",
  "data": { /* ProcessoSeletivoInscricaoResource */ }
}
```

---

### `PUT /api/v2/processo-seletivo/inscricoes/{uuid}`

Atualiza uma inscrição. Todos os campos são opcionais (`sometimes`).

Para laudos, avaliações e certificados existentes, envie o `id` correspondente para atualizar; omita o `id` para criar novos registros.

**Body (JSON):**
```json
{
  "nome": "João da Silva Atualizado",
  "laudos": [
    {
      "tbprocesso_seletivo_laudo_anexos_id": 1,
      "data": "2023-06-01",
      "file": "<base64>",
      "filename": "laudo_novo.pdf",
      "filetype": "application/pdf"
    }
  ],
  "avaliacao": [
    {
      "tbprocesso_seletivo_avaliacao_id": 1,
      "nota": 9.0
    }
  ],
  "certificados": [
    {
      "tbprocesso_seletivo_certificados_id": 1,
      "tipo": "Pós-Graduação",
      "anexos": [
        {
          "tbprocesso_seletivo_certificados_anexos_id": 1,
          "file": "<base64>",
          "filename": "certificado.pdf",
          "filetype": "application/pdf"
        }
      ]
    }
  ]
}
```

**Resposta 200:**
```json
{
  "message": "Inscrição atualizada com sucesso!",
  "data": { /* ProcessoSeletivoInscricaoResource */ }
}
```

---

### `DELETE /api/v2/processo-seletivo/inscricoes/{uuid}`

Soft delete de uma inscrição.

**Resposta 200:**
```json
{ "message": "Inscrição excluída com sucesso!" }
```

---

### `PATCH /api/v2/processo-seletivo/inscricoes/{uuid}/restaurar`

Restaura uma inscrição excluída.

**Resposta 200:**
```json
{ "message": "Inscrição restaurada com sucesso!" }
```

---

## Endpoints — Alteração de Estado

### Estados disponíveis para inscrições

```
GET /api/v2/processo-seletivo/inscricoes/status
```

Retorna todos os estados possíveis com suas propriedades visuais.

**Resposta 200:**
```json
{
  "success": true,
  "message": "Estados de inscrição encontrados com sucesso!",
  "data": [
    {
      "valor": "aguardando_conferencia",
      "descricao": "Aguardando Conferência",
      "cor": "#868e96",
      "icone": "fa fa-folder-open",
      "badge": "badge badge-secondary",
      "btn": "btn btn-secondary"
    },
    {
      "valor": "deferida",
      "descricao": "Deferido(a)",
      "cor": "#0cc27e",
      "icone": "fa fa-check-circle-o",
      "badge": "badge badge-success",
      "btn": "btn btn-success"
    },
    {
      "valor": "indeferida",
      "descricao": "Indeferido(a)",
      "cor": "#ff586b",
      "icone": "fa fa-times-circle-o",
      "badge": "badge badge-danger",
      "btn": "btn btn-danger"
    }
  ]
}
```

> Nota: `consolidada` não é listada no endpoint `status` pois é usada apenas internamente via rota dedicada.

---

### Alterar estado de uma inscrição (individual)

Rotas dedicadas por transição — cada rota representa uma ação explícita:

| Método | Endpoint                                                        | Transição para          |
|--------|-----------------------------------------------------------------|-------------------------|
| PATCH  | `/inscricoes/{uuid}/aguardando-conferencia`                     | `aguardando_conferencia` |
| PATCH  | `/inscricoes/{uuid}/deferir`                                    | `deferida`              |
| PATCH  | `/inscricoes/{uuid}/indeferir`                                  | `indeferida`            |
| PATCH  | `/inscricoes/{uuid}/consolidar`                                 | `consolidada`           |

**Resposta 200:**
```json
{
  "success": true,
  "message": "Inscrição alterada para Deferida com sucesso!"
}
```

---

### Alterar estado em lote (inscrições)

```
PATCH /api/v2/processo-seletivo/inscricoes/alterar-status
```

Altera o estado de múltiplas inscrições em uma única operação.

**Body (JSON):**
```json
{
  "estado": "deferida",
  "inscricoes": [1, 2, 3]
}
```

| Campo       | Obrigatório | Regras                                                    |
|-------------|-------------|-----------------------------------------------------------|
| `estado`    | sim         | string; um dos valores de `DeferimentoState`              |
| `inscricoes` | sim        | array de IDs inteiros existentes em `tbprocesso_seletivo_inscricao` |

**Resposta 200:**
```json
{ "message": "Inscrições alteradas com sucesso!" }
```

---

### Alterar estado de uma avaliação

| Método | Endpoint                                                                   | Transição para          |
|--------|----------------------------------------------------------------------------|-------------------------|
| PATCH  | `/inscricoes/avaliacao/{avaliacao}/aguardando-conferencia`                 | `aguardando_conferencia` |
| PATCH  | `/inscricoes/avaliacao/{avaliacao}/deferir`                                | `deferida`              |
| PATCH  | `/inscricoes/avaliacao/{avaliacao}/indeferir`                              | `indeferida`            |

Parâmetro `{avaliacao}` = ID numérico da avaliação.

**Resposta 200:**
```json
{
  "success": true,
  "message": "Avaliação alterada para Deferida com sucesso!",
  "data": {
    "avaliacao": { /* ProcessoSeletivoAvaliacaoResource */ }
  }
}
```

---

### Alterar estado de um certificado

| Método | Endpoint                                                                   | Transição para          |
|--------|----------------------------------------------------------------------------|-------------------------|
| PATCH  | `/inscricoes/certificado/{certificado}/aguardando-conferencia`             | `aguardando_conferencia` |
| PATCH  | `/inscricoes/certificado/{certificado}/deferir`                            | `deferida`              |
| PATCH  | `/inscricoes/certificado/{certificado}/indeferir`                          | `indeferida`            |

Parâmetro `{certificado}` = ID numérico do certificado.

**Resposta 200:**
```json
{
  "success": true,
  "message": "Certificado alterado para Deferida com sucesso!",
  "data": {
    "avaliacao": { /* ProcessoSeletivoCertificadoResource */ }
  }
}
```

---

## Schemas de Resposta

### `ProcessoSeletivoResource`
```json
{
  "id": 1,
  "titulo": "Processo Seletivo 2025",
  "descricao": "Contratação de professores",
  "ano": 2025,
  "ativo": true,
  "cargos": [ /* CargoSimplificadoResource[] — apenas se include=cargos */ ],
  "processo": { /* ProcessoResource — apenas se carregado */ },
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-02T00:00:00.000000Z",
  "deleted_at": null
}
```

### `ProcessoSeletivoInscricaoResource`
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "numero_inscricao": 1,
  "processo_seletivo": { /* ProcessoSeletivoResource — se include=processoSeletivo */ },
  "status": {
    "descricao": "Aguardando Conferência",
    "cor": "#868e96",
    "icone": "fa fa-folder-open",
    "badge": "badge badge-secondary",
    "btn": "btn btn-secondary"
  },
  "nome": "João da Silva",
  "data_nascimento": "1990-01-01",
  "cargo": { /* CargoSimplificadoResource — se include=cargo */ },
  "email": "joao@email.com",
  "cpf": "12345678901",
  "filhos": 0,
  "rg": "123456789",
  "rg_orgao_emissor": "SSP",
  "rg_uf_orgao_emissor": "SP",
  "telefone": "11987654321",
  "nacionalidade": "Brasileira",
  "pais": { /* PaisResource — se include=pais */ },
  "cep": "12345678",
  "estado": "São Paulo",
  "cidade": "São Paulo",
  "bairro": "Centro",
  "endereco": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 45",
  "estado_civil": "Solteiro",
  "pcd": false,
  "descricao_pcd": null,
  "afrodescendente": false,
  "laudo": [ /* ProcessoSeletivoInscricaoLaudoResource[] — se include=laudo */ ],
  "avaliacao": { /* ProcessoSeletivoAvaliacaoResource — se include=avaliacao */ },
  "certificados": [ /* ProcessoSeletivoCertificadoResource[] — se include=certificados.anexos */ ],
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-02T00:00:00.000000Z",
  "deleted_at": null
}
```

### `ProcessoSeletivoAvaliacaoResource`
```json
{
  "id": 1,
  "inscricao": { /* ProcessoSeletivoInscricaoResource — se carregado */ },
  "nota": 8.5,
  "status": { /* mesmo objeto status descrito acima */ },
  "condicao_especial": false,
  "descricao_condicao_especial": null,
  "observacao": "Bom desempenho",
  "createdAt": "2025-01-01T00:00:00.000000Z",
  "updatedAt": "2025-01-02T00:00:00.000000Z",
  "deletedAt": null
}
```

### `ProcessoSeletivoCertificadoResource`
```json
{
  "id": 1,
  "inscricao": { /* ProcessoSeletivoInscricaoResource — se carregado */ },
  "experiencia": "5.00",
  "assiduidade": "9.00",
  "pontuacao_final": "85.50",
  "tipo": "Graduação",
  "status": { /* mesmo objeto status */ },
  "anexos": [ /* ProcessoSeletivoCertificadoAnexoResource[] — se include=certificados.anexos */ ],
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-02T00:00:00.000000Z",
  "deleted_at": null
}
```

### `ProcessoSeletivoInscricaoLaudoResource`
```json
{
  "id": 1,
  "inscricao": { /* ProcessoSeletivoInscricaoResource — se carregado */ },
  "data": "2023-01-01",
  "file": "<base64 ou URL>",
  "filename": "laudo_medico.pdf",
  "filetype": "application/pdf",
  "remote_path": "uploads/laudos/1234567890.pdf",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-02T00:00:00.000000Z",
  "deleted_at": null
}
```

---

## Respostas de Erro Comuns

| Status | Descrição                                                                       |
|--------|---------------------------------------------------------------------------------|
| 403    | Acesso não autorizado (Gate negou a permissão)                                  |
| 404    | Registro não encontrado                                                         |
| 422    | Erro de validação — `{ "message": "...", "errors": { "campo": ["mensagem"] } }` |
| 500    | Transição de estado inválida (ex: tentar consolidar diretamente de `indeferida`) |

---

## Regras de Negócio

1. **UUID nas inscrições:** todas as rotas de inscrição usam `{uuid}` como identificador, não o ID numérico interno.
2. **Número de inscrição:** gerado automaticamente na criação; não pode ser informado pelo cliente.
3. **Laudos obrigatórios para PCD:** se `pcd = true`, o array `laudos` deve ter ao menos um item.
4. **Transições de estado:** tentativas de transições não permitidas são rejeitadas com erro 500 pela biblioteca `spatie/laravel-model-states`.
5. **Soft delete generalizado:** todas as entidades (processo, inscrição, avaliação, certificado, laudo, anexo de certificado) suportam soft delete e podem ser restauradas.
6. **Autorização via Gate:** as permissões são verificadas por policy no `Gate` do Laravel — o token/sessão autenticado deve ter as permissões adequadas para cada ação (`viewAny`, `view`, `create`, `update`, `delete`).
7. **Relacionamentos carregados sob demanda:** use o parâmetro `include` para carregar relacionamentos e evitar requisições adicionais. O `show` de inscrições sempre carrega todos os relacionamentos automaticamente.

---

## Guia de Uso Frontend

### Fluxo típico de criação de inscrição

1. `GET /api/v2/processo-seletivo?filtro[ativo]=true` → listar processos abertos
2. `GET /api/v2/processo-seletivo/{id}/cargos` → obter cargos do processo escolhido
3. `GET /api/v2/processo-seletivo/paises` → obter países para o select de nacionalidade
4. `GET /api/v2/processo-seletivo/estados` → obter UFs para o select de RG
5. `POST /api/v2/processo-seletivo/inscricoes` → criar inscrição com documentos

### Fluxo de gestão de inscrições

1. `GET /api/v2/processo-seletivo/inscricoes/status` → obter estados para construir filtros e badges
2. `GET /api/v2/processo-seletivo/inscricoes?include=processoSeletivo,cargo&filtro[status]=aguardando_conferencia` → listar inscrições pendentes
3. `PATCH /api/v2/processo-seletivo/inscricoes/{uuid}/deferir` → deferir inscrição individual
4. `PATCH /api/v2/processo-seletivo/inscricoes/alterar-status` → deferir/indeferir múltiplas inscrições de uma vez

### Exibição de badge de status

O objeto `status` retornado já contém as classes CSS (`badge`, `btn`) prontas para uso. Exemplo:

```html
<span :class="inscricao.status.badge">{{ inscricao.status.descricao }}</span>
```
