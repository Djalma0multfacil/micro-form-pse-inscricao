# ADR: Módulo de Processos

**Status:** Accepted  
**Data:** 2026-07-09  
**Tags:** processo, etapa, inscrição, recurso, RH

---

## Contexto

O módulo de **Processos** é a abstração genérica que unifica diferentes fluxos de RH da plataforma (Processo Seletivo, Remoção, Atribuição) em um único conjunto de entidades reutilizáveis. Um processo possui etapas ordenadas. Cada etapa pode receber inscrições polimórficas (ligando uma entidade externa, ex: `ProcessoSeletivoInscricao`, à etapa). Participantes de uma etapa podem abrir recursos (recurso = impugnação/contestação) contra o resultado da etapa, e esses recursos podem ter anexos e receber parecer de um avaliador.

---

## Decisão

### 1. Hierarquia de Entidades

```
Processo
 └── ProcessoEtapa (ordenada por `ordem`)
      └── ProcessoEtapaInscricao (polimórfica → entidade externa)
           └── ProcessoRecurso
                └── ProcessoRecursoAnexo
```

### 2. Polimorfismo

**Processo** referencia outro modelo via `processo_type` + `processo_id` (ex: `ProcessoSeletivo`).  
**ProcessoEtapaInscricao** referencia a inscrição real via `inscricao_type` + `inscricao_id`.

---

## API Reference — Base: `/api/v2`

> Todas as rotas requerem autenticação. Respostas de erro seguem o padrão `{ success, message, errors }`.

---

### 1. Processos

#### 1.1 Listar processos

```
GET /processos
```

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `filtro[titulo]` | `string` | Busca parcial no título |
| `filtro[descricao]` | `string` | Busca parcial na descrição |
| `filtro[processo_type]` | `string` | Filtro por tipo/classe do processo |
| `filtro[processo_id]` | `string` | Busca parcial no título do processo relacionado |
| `filtro[created_at_ini]` | `date (YYYY-MM-DD)` | Criados a partir de |
| `filtro[created_at_fim]` | `date (YYYY-MM-DD)` | Criados até |
| `filtro[updated_at_ini]` | `date (YYYY-MM-DD)` | Atualizados a partir de |
| `filtro[updated_at_fim]` | `date (YYYY-MM-DD)` | Atualizados até |
| `filtro[deleted_at_ini]` | `date (YYYY-MM-DD)` | Deletados (soft) a partir de |
| `filtro[deleted_at_fim]` | `date (YYYY-MM-DD)` | Deletados (soft) até |
| `filtro[trashed]` | `"with"` \| `"only"` | Inclui / lista só soft-deletados |
| `incluir` | `string` | Relações a carregar (ver seção Includes) |
| `ordenar` | `string` | Campos; prefixar com `-` para DESC. Ex: `-created_at,titulo` |

**Resposta 200** — paginada:

```json
{
  "data": [ <ProcessoResource> ],
  "links": { ... },
  "meta": { ... }
}
```

---

#### 1.2 Criar processo

```
POST /processos
```

**Body JSON:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `titulo` | `string` (max 255) | ✅ | Título do processo |
| `descricao` | `string` | ❌ | Descrição |
| `processo_type` | `string` | ❌ | Classe do modelo relacionado (ver Tipos) |
| `processo_id` | `integer` | ❌ | ID do registro relacionado |
| `cargos` | `integer[]` | ❌ | IDs de cargos associados |
| `escolas` | `integer[]` | ❌ | IDs de escolas associadas |
| `turmas` | `integer[]` | ❌ | IDs de turmas associadas |

**Resposta 201** — `{ success, message, data: <ProcessoResource> }`

---

#### 1.3 Exibir processo

```
GET /processos/{id}
```

| Query param | Descrição |
|---|---|
| `incluir` | Relações a carregar (ver seção Includes) |

**Resposta 200** — `{ success, message, data: <ProcessoResource> }`

---

#### 1.4 Atualizar processo

```
PUT /processos/{id}
```

**Body JSON** (todos opcionais — `sometimes`):

| Campo | Tipo | Descrição |
|---|---|---|
| `titulo` | `string` (max 255) | Título |
| `descricao` | `string` \| `null` | Descrição |
| `ativo` | `boolean` | Ativa/desativa o processo |
| `processo_id` | `integer` | Vínculo polimórfico |
| `cargos` | `integer[]` \| `null` | Substituição completa dos cargos |
| `escolas` | `integer[]` \| `null` | Substituição completa das escolas |
| `turmas` | `integer[]` \| `null` | Substituição completa das turmas |

**Resposta 200** — `{ success, message, data: <ProcessoResource> }`

---

#### 1.5 Excluir processo (soft delete)

```
DELETE /processos/{id}
```

**Resposta 200** — `{ success, message }`

---

#### 1.6 Restaurar processo

```
PATCH /processos/{id}/restaurar
```

**Resposta 200** — `{ success, message, data: <ProcessoResource> }`

---

### 2. Etapas de Processo

#### 2.1 Listar etapas de um processo

```
GET /processo/{id}/etapas
```

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `filtro[ordem]` | `integer` | Número de ordem da etapa |
| `filtro[tipo]` | `string` | Tipo da etapa |
| `filtro[titulo]` | `string` | Busca parcial no título |
| `filtro[descricao]` | `string` | Busca parcial na descrição |
| `filtro[participante]` | `integer` | ID do usuário participante |
| `filtro[created_at_ini/fim]` | `date` | Intervalo de criação |
| `filtro[updated_at_ini/fim]` | `date` | Intervalo de atualização |
| `filtro[deleted_at_ini/fim]` | `date` | Intervalo de exclusão |
| `filtro[trashed]` | `"with"` \| `"only"` | Soft-deletados |
| `incluir` | `string` | Relações (ver seção Includes) |
| `ordenar` | `string` | Campos: `ordem, tipo, titulo, descricao, abertura, fechamento, resultado, created_at, updated_at, deleted_at` |

**Resposta 200** — `{ data: [ <ProcessoEtapaResource> ] }`

---

#### 2.2 Criar etapa

```
POST /processo/etapas
```

**Body JSON:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tbprocessos_id` | `integer` | ✅ | ID do processo pai |
| `ordem` | `integer` | ✅ | Posição da etapa (1, 2, 3…) |
| `tipo` | `string` | ✅ | Tipo da etapa (ver Tipos de Etapa) |
| `titulo` | `string` | ✅ | Título |
| `descricao` | `string` \| `null` | ❌ | Descrição |
| `etapa_pai` | `integer` \| `null` | ❌ | ID da etapa pai (sub-etapa) |
| `abertura_programada` | `boolean` \| `null` | ❌ | Se o status muda automaticamente pelas datas |
| `abertura` | `date` \| `null` | ❌ | Data/hora de abertura (`YYYY-MM-DD HH:MM:SS` UTC) |
| `fechamento` | `date` \| `null` | ❌ | Data/hora de fechamento |
| `resultado` | `date` \| `null` | ❌ | Data/hora de publicação do resultado |
| `participantes` | `integer[]` \| `null` | ❌ | IDs de usuários participantes |
| `responsaveis` | `integer[]` \| `null` | ❌ | IDs de funcionários responsáveis |
| `cargos` | `integer[]` \| `null` | ❌ | IDs de cargos vinculados |
| `escolas` | `integer[]` \| `null` | ❌ | IDs de escolas vinculadas |

**Resposta 201** — `{ success, message, data: <ProcessoEtapaResource> }`

---

#### 2.3 Exibir etapa

```
GET /processo/etapas/{id}
```

**Resposta 200** — `{ success, message, data: <ProcessoEtapaResource> }`

---

#### 2.4 Atualizar etapa

```
PUT /processo/etapas/{id}
```

**Body JSON** — mesmos campos de `store`, todos com `sometimes` (enviar apenas os alterados).

**Resposta 200** — `{ success, message, data: <ProcessoEtapaResource> }`

---

#### 2.5 Excluir etapa (soft delete)

```
DELETE /processo/etapas/{id}
```

**Resposta 200** — `{ success, message }`

---

#### 2.6 Restaurar etapa

```
PATCH /processo/etapas/{id}/restaurar
```

**Resposta 200** — `{ success, message }`

---

#### 2.7 Atualizar status da etapa

```
PATCH /processo/etapas/{id}/status
```

**Body JSON:**

```json
{ "status": "ativo" }
```

Os valores válidos para `status` são obtidos em `GET /processo/ativo/status`.

**Resposta 200** — `{ success, message }`

---

### 3. Inscrições em Etapas

Vincula uma inscrição polimórfica (ex: `ProcessoSeletivoInscricao`) a uma etapa de processo.

#### 3.1 Listar inscrições

```
GET /processo/etapa/inscricoes
```

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `filter[tbprocessos_etapas_inscricoes_id]` | `integer` | ID da inscrição na etapa |
| `filter[tbprocessos_etapas_id]` | `integer` | ID da etapa |
| `filter[inscricao_type]` | `string` | Tipo polimórfico |
| `filter[inscricao_id]` | `integer` | ID da inscrição externa |
| `filter[permitir_edicao_etapa]` | `boolean` | |
| `filter[permitir_edicao_geral]` | `boolean` | |
| `filter[created_at_ini/fim]` | `datetime` | |
| `filter[updated_at_ini/fim]` | `datetime` | |
| `filter[deleted_at_ini/fim]` | `datetime` | |
| `filter[trashed]` | `"with"` \| `"only"` | |
| `include` | `string` | Relações: `etapa, inscricao, recursos` |
| `sort` | `string` | Campos disponíveis; `-` para DESC |

**Resposta 200** — `{ data: [ <ProcessoEtapaInscricaoResource> ], message, meta }`

---

#### 3.2 Criar inscrição

```
POST /processo/etapa/inscricoes
```

**Body JSON:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tbprocessos_etapas_id` | `integer` | ✅ | ID da etapa |
| `inscricao_type` | `string` | ✅ | Classe da entidade inscrita (ex: `App\Models\RecursosHumanos\ProcessoSeletivo\ProcessoSeletivoInscricao`) |
| `inscricao_id` | `integer` | ✅ | ID da entidade inscrita |
| `permitir_edicao_etapa` | `boolean` \| `null` | ❌ | Permite editar inscrição nesta etapa |
| `permitir_edicao_geral` | `boolean` \| `null` | ❌ | Permite editar inscrição em todo o processo |

**Resposta 201** — `{ success, message, data: <ProcessoEtapaInscricaoResource> }`

---

#### 3.3 Exibir inscrição

```
GET /processo/etapa/inscricoes/{id}
```

| Query param | Descrição |
|---|---|
| `incluir` | Relações: `etapa, inscricao, recursos` |

**Resposta 200** — `{ success, message, data: <ProcessoEtapaInscricaoResource> }`

---

#### 3.4 Atualizar inscrição

```
PUT /processo/etapa/inscricoes/{id}
```

Mesmo body de `store`.

**Resposta 200** — `{ success, message, data: <ProcessoEtapaInscricaoResource> }`

---

#### 3.5 Excluir inscrição (soft delete)

```
DELETE /processo/etapa/inscricoes/{id}
```

**Resposta 200** — `{ success, message }`

---

#### 3.6 Restaurar inscrição

```
PATCH /processo/etapa/inscricoes/{id}/restaurar
```

**Resposta 200** — `{ success, message }`

---

### 4. Recursos (Contestações)

#### 4.1 Listar recursos

```
GET /processo/recursos
```

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `filtro[tbprocessos_recursos_id]` | `integer` | ID do recurso |
| `filtro[tbprocessos_etapas_id]` | `integer` | Filtrar por etapa |
| `filtro[resposta]` | `string` | Busca parcial |
| `filtro[parecer]` | `string` | Busca parcial |
| `filtro[status]` | `string` | Status do recurso |
| `filtro[ciente]` | `boolean` | Candidato ciente |
| `filtro[usuario]` | `integer` | ID do usuário criador |
| `filtro[created_at_ini/fim]` | `date` | |
| `filtro[updated_at_ini/fim]` | `date` | |
| `filtro[deleted_at_ini/fim]` | `date` | |
| `filtro[trashed]` | `"with"` \| `"only"` | |
| `incluir` | `string` | Relações: `etapa, inscricao, inscricao.inscricao, anexos, usuario` |
| `sort` | `string` | `-created_at` etc. |

**Resposta 200** — `{ success, message, data: [ <ProcessoRecursoResource> ] }`

---

#### 4.2 Criar recurso

```
POST /processo/recursos
```

**Body JSON:**

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tbprocessos_etapas_id` | `integer` | ✅ | ID da etapa |
| `tbprocessos_etapas_inscricoes_id` | `integer` \| `null` | ❌ | ID da inscrição na etapa |
| `resposta` | `string` | ✅ | Texto do recurso |
| `anexos` | `array` \| `null` | ❌ | Lista de anexos |
| `anexos[].file` | `binary/base64` | ✅ (se anexo) | Arquivo |
| `anexos[].filename` | `string` | ✅ (se anexo) | Nome do arquivo |
| `anexos[].filetype` | `string` | ✅ (se anexo) | MIME type (ex: `application/pdf`) |

**Resposta 201** — `{ success, message, data: <ProcessoRecursoResource> }`

---

#### 4.3 Exibir recurso

```
GET /processo/recursos/{id}
```

| Query param | Descrição |
|---|---|
| `incluir` | Relações: `etapa, inscricao, inscricao.inscricao, anexos, usuario` |

**Resposta 200** — `{ success, message, data: <ProcessoRecursoResource> }`

---

#### 4.4 Atualizar recurso

```
PUT /processo/recursos/{id}
```

**Body JSON:**

| Campo | Tipo | Descrição |
|---|---|---|
| `tbprocessos_etapas_id` | `integer` | |
| `tbprocessos_etapas_inscricoes_id` | `integer` \| `null` | |
| `resposta` | `string` | Texto atualizado |
| `ciente` | `boolean` | Candidato marcou como ciente do parecer |
| `anexos` | `array` | Novos anexos a adicionar (mesma estrutura de `store`) |
| `anexos[].tbprocessos_recursos_anexos_id` | `integer` | Se preenchido, atualiza o anexo existente |

**Resposta 200** — `{ success, message, data: <ProcessoRecursoResource> }`

---

#### 4.5 Excluir recurso (soft delete)

```
DELETE /processo/recursos/{id}
```

**Resposta 200** — `{ success, message }`

---

#### 4.6 Restaurar recurso

```
PATCH /processo/recursos/{id}/restaurar
```

**Resposta 200** — `{ success, message }`

---

#### 4.7 Inserir parecer no recurso

```
PATCH /processo/recursos/{id}/parecer
```

**Body JSON:**

```json
{ "parecer": "Texto do parecer do avaliador." }
```

**Resposta 200** — `{ success, message, data: <ProcessoRecursoResource> }`

> ⚠️ O campo `parecer` é ocultado para o candidato enquanto `exibir_resultado` da etapa for `false` e o usuário não tiver permissão `editarParecer`.

---

#### 4.8 Atualizar status do recurso

```
PATCH /processo/recursos/{id}/status
```

**Body JSON:**

```json
{ "status": "deferida" }
```

Os valores válidos são obtidos em `GET /processo/deferimento/status`.

**Resposta 200** — `{ success, message }`

---

### 5. Anexos de Recursos

#### 5.1 Excluir anexo

```
DELETE /processo/recurso/anexos/{id}
```

**Resposta 200** — `{ success, message }`

---

#### 5.2 Restaurar anexo

```
PATCH /processo/recurso/anexos/{id}/restaurar
```

**Resposta 200** — `{ success, message, data: <ProcessoRecursoResource> }`

---

### 6. Endpoints Auxiliares / Enumerações

#### 6.1 Tipos de processo

```
GET /processo/tipos
```

Retorna objeto `{ "<classe>": "<label>" }`.

**Valores possíveis:**

| Classe | Label | Cor | Ícone |
|---|---|---|---|
| `App\Models\RecursosHumanos\Remocao\Remocao` | Remoção | red | `fa-exchange` |
| `App\Models\RecursosHumanos\ProcessoSeletivo\ProcessoSeletivo` | Processo Seletivo | blue | `fa-user-plus` |
| `App\Models\RecursosHumanos\Atribuicao\Atribuicao` | Atribuição | green | `fa-tasks` |

---

#### 6.2 Tipos de etapa (para `inscricao_type`)

```
GET /processo/etapa/tipos
```

Retorna objeto `{ "<classe>": "<label>" }`.

**Valores possíveis:**

| Classe | Label |
|---|---|
| `App\Models\RecursosHumanos\Remocao\RemocaoInscricao` | Remoção Inscrição |
| `App\Models\RecursosHumanos\Remocao\RemocaoClassificacao` | Remoção Classificação |
| `App\Models\RecursosHumanos\ProcessoSeletivo\ProcessoSeletivoInscricao` | Processo Seletivo Inscrição |
| `App\Models\RecursosHumanos\Atribuicao\AtribuicaoInscricao` | Atribuição Inscrição |
| `App\Models\Processo\ProcessoRecurso` | Recurso |

---

#### 6.3 Status ativos (etapa)

```
GET /processo/ativo/status
```

**Resposta:**

```json
{
  "data": [
    { "value": "ativo", "label": "Ativo", "color": "...", "icon": "...", "badge": "...", "button": "..." },
    { "value": "inativo", ... },
    { "value": "parcialmente_ativo", ... }
  ]
}
```

---

#### 6.4 Status de deferimento (recurso)

```
GET /processo/deferimento/status
```

**Resposta:** mesma estrutura; valores possíveis para recursos:

| value | Label |
|---|---|
| `aguardando_conferencia` | Aguardando Conferência |
| `deferida` | Deferida |
| `indeferida` | Indeferida |

> `consolidada` existe no sistema mas não é exposta neste endpoint para inscrições.

---

#### 6.5 Cargos disponíveis

```
GET /processo/cargos
```

**Query params:** `filtro[tbcargos_id]`, `filtro[tbcargos_descricao]`, `filtro[processo]` (ID do processo), `sort`.

**Resposta:** `{ data: [ { id, descricao } ] }`

---

#### 6.6 Escolas disponíveis

```
GET /processo/escolas
```

Mesma estrutura de cargos.

---

#### 6.7 Turmas disponíveis

```
GET /processo/turmas
```

Mesma estrutura de cargos.

---

#### 6.8 Filtros agregados

```
GET /processo/filtros
```

**Query params:** `filtro[processo]` (ID), `ordenar`.

**Resposta:**

```json
{
  "data": {
    "situacao": [ { "id": "...", "descricao": "..." } ],
    "perfil":   [ <PerfilSimplificadoResource> ],
    "cargo":    [ <CargoSimplificadoResource> ],
    "funcao":   [ ... ]
  }
}
```

---

#### 6.9 Participantes por tipo

```
GET /processo/etapa/participantes/{tipo}
```

`{tipo}` é um valor de `UsuarioTipo` enum.

**Resposta:** `{ success, message, data: [ ... ] }`

---

## Schemas de Resposta

### ProcessoResource

```json
{
  "id": 1,
  "titulo": "Processo Seletivo 2024",
  "descricao": "Seleção de professores",
  "ativo": true,
  "processo_type": "App\\Models\\RecursosHumanos\\ProcessoSeletivo\\ProcessoSeletivo",
  "processo": { /* objeto do tipo específico, carregado via incluir=processo */ },
  "etapas":   [ /* ProcessoEtapaResource[], carregado via incluir=etapas */ ],
  "cargos":   [ { "id": 1, "descricao": "Professor" } ],
  "escolas":  [ { "id": 1, "descricao": "EE Exemplo" } ],
  "turmas":   [ { "id": 1, "descricao": "Turma A" } ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-02T12:00:00Z",
  "deleted_at": null
}
```

---

### ProcessoEtapaResource

```json
{
  "id": 10,
  "ordem": 1,
  "tipo": "App\\Models\\RecursosHumanos\\ProcessoSeletivo\\ProcessoSeletivoInscricao",
  "titulo": "Inscrições",
  "descricao": "Período de inscrição",
  "abertura_programada": true,
  "abertura": "2024-03-01T00:00:00.000000Z",
  "fechamento": "2024-03-15T23:59:59.000000Z",
  "resultado": "2024-03-20T00:00:00.000000Z",
  "ativa": true,
  "exibir_resultado": false,
  "status": {
    "descricao": "Ativo",
    "cor": "#28a745",
    "icone": "check",
    "badge": "success",
    "btn": "btn-success"
  },
  "etapa_pai": null,
  "processo": { /* ProcessoResource, via incluir=processo */ },
  "cargos": [ /* via incluir=cargos */ ],
  "escolas": [ /* via incluir=escolas */ ],
  "responsaveis": [ /* via incluir=responsaveis */ ],
  "participantes": [ { "id": 5, "nome": "Maria Silva" } /* via incluir=participantes */ ],
  "inscricoes": [ /* ProcessoEtapaInscricaoResource[], via incluir=inscricoes */ ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-02T12:00:00Z",
  "deleted_at": null
}
```

> **`exibir_resultado`**: `true` quando `now() >= resultado` **ou** quando `resultado` for `null`. Controla a visibilidade do status e parecer dos recursos para usuários sem permissão de administração.

---

### ProcessoEtapaInscricaoResource

```json
{
  "id": 100,
  "inscricao_type": "App\\Models\\RecursosHumanos\\ProcessoSeletivo\\ProcessoSeletivoInscricao",
  "permitir_edicao_geral": true,
  "permitir_edicao_etapa": false,
  "etapa": { /* ProcessoEtapaResource, via include=etapa */ },
  "inscricao": { /* objeto específico do tipo, via include=inscricao */ },
  "recursos": [ /* ProcessoRecursoResource[], via include=recursos */ ],
  "usuario": { /* UsuarioResource */ },
  "created_at": "2024-03-01T10:00:00Z",
  "updated_at": "2024-03-01T10:00:00Z",
  "deleted_at": null
}
```

---

### ProcessoRecursoResource

```json
{
  "id": 200,
  "resposta": "Solicito revisão do resultado pois...",
  "parecer": null,
  "ciente": false,
  "status": {
    "descricao": "Aguardando Conferência",
    "cor": "#FFCC00",
    "icone": "clock",
    "badge": "warning",
    "btn": "btn-warning"
  },
  "anexos": [ /* ProcessoRecursoAnexoResource[] */ ],
  "etapa": { /* ProcessoEtapaResource */ },
  "inscricao": { /* ProcessoEtapaInscricaoResource */ },
  "config": {
    "create": true,
    "update": true,
    "delete": false,
    "restore": false,
    "editarStatus": false,
    "editarParecer": false
  },
  "created_at": "2024-03-10T08:00:00Z",
  "updated_at": "2024-03-10T08:00:00Z",
  "deleted_at": null
}
```

> **`config`**: Permissões do usuário autenticado sobre o recurso. Use para habilitar/desabilitar botões no front-end.  
> **`parecer`**: Retorna `null` quando `exibir_resultado` da etapa é `false` e o usuário não tem permissão `editarParecer`.  
> **`status`**: Retorna `aguardando_conferencia` quando `exibir_resultado` é `false` e usuário não tem permissão `editarStatus`.

---

### ProcessoRecursoAnexoResource

```json
{
  "id": 300,
  "filename": "recurso.pdf",
  "filetype": "application/pdf",
  "file": null,
  "remote_path": "https://storage.example.com/recurso.pdf",
  "recurso": { /* ProcessoRecursoResource, via include */ },
  "created_at": "...",
  "updated_at": "...",
  "deleted_at": null
}
```

---

## State Machines

### Status da Etapa (`AtivoState`)

```
Inativo ──────────────► Ativo
   ▲  ◄──────────────  /  ▲
   │                  ▼   │
   └──► ParcialmenteAtivo ─┘
```

Transições permitidas: qualquer estado ↔ qualquer outro estado.  
**Padrão:** `Inativo`.

Quando `abertura_programada = true`, o sistema muda o status automaticamente baseando-se nas datas `abertura` e `fechamento`.

---

### Status do Recurso (`DeferimentoState`)

```
AguardandoConferencia ◄──────────────────────────┐
        │                                         │
        ▼                                         │
     Deferida ◄──────────► Indeferida             │
        │           ▲           │                 │
        │           │           │                 │
        ▼           │           │                 │
   Consolidada ─────┴───────────┘─────────────────┘
```

**Padrão:** `AguardandoConferencia`.  
O estado `consolidada` não é exposto no endpoint de listagem de status para inscrições normais.

---

## Regras de Negócio

1. **Abertura programada:** quando `abertura_programada = true`, um processo agendado (`syncStatusByDates`) ativa/desativa a etapa automaticamente com base em `abertura` e `fechamento`.

2. **Ocultação de resultado:** quando `now() < resultado` E a etapa tem data de resultado definida, `exibir_resultado = false`. Isso faz o `status` do recurso aparecer como `aguardando_conferencia` e o `parecer` aparecer como `null` para usuários sem permissão de administração (`editarStatus` / `editarParecer`).

3. **Soft Delete:** todos os modelos principais (`Processo`, `ProcessoEtapa`, `ProcessoEtapaInscricao`, `ProcessoRecurso`, `ProcessoRecursoAnexo`) utilizam soft delete. Use `filtro[trashed]=with` para incluir deletados e `only` para listar apenas deletados.

4. **Polimorfismo:** `Processo.processo_type/processo_id` e `ProcessoEtapaInscricao.inscricao_type/inscricao_id` são relações polimórficas. O `processo_type` deve ser o FQCN da classe PHP (ex: `App\Models\RecursosHumanos\ProcessoSeletivo\ProcessoSeletivo`). Utilize os endpoints `/processo/tipos` e `/processo/etapa/tipos` para obter os valores válidos.

5. **Permissões (`config`):** o `ProcessoRecursoResource` expõe um campo `config` com as permissões do usuário atual (`create`, `update`, `delete`, `restore`, `editarStatus`, `editarParecer`). Use esses valores para controlar a visibilidade de botões e formulários no front-end sem precisar conhecer as regras de autorização do back-end.

6. **Sincronização de relações many-to-many:** ao criar ou atualizar `Processo` e `ProcessoEtapa`, os arrays `cargos`, `escolas`, `turmas`, `participantes` e `responsaveis` fazem uma **substituição completa** (sync) das relações pivot. Enviar array vazio (`[]`) remove todos; omitir o campo (`null` ou ausente) mantém os existentes dependendo da implementação do service.

---

## Includes Disponíveis

### Processo (`incluir=`)
| Valor | Descrição |
|---|---|
| `processo` | Carrega o modelo polimórfico relacionado |
| `etapas` | Lista de etapas do processo |
| `etapas.etapaPai` | Etapa pai de cada etapa |
| `cargos` | Cargos associados |
| `escolas` | Escolas associadas |
| `turmas` | Turmas associadas |

### ProcessoEtapa (`incluir=`)
| Valor | Descrição |
|---|---|
| `etapaPai` | Etapa pai |
| `processo` | Processo ao qual pertence |
| `participantes` | Usuários participantes |
| `responsaveis` | Funcionários responsáveis |
| `cargos` | Cargos da etapa |
| `escolas` | Escolas da etapa |
| `inscricoes` | Inscrições da etapa |

### ProcessoEtapaInscricao (`include=`)
| Valor | Descrição |
|---|---|
| `etapa` | Etapa da inscrição |
| `inscricao` | Entidade externa (resolve para o resource do tipo) |
| `recursos` | Recursos/contestações desta inscrição |

### ProcessoRecurso (`incluir=`)
| Valor | Descrição |
|---|---|
| `etapa` | Etapa do recurso |
| `inscricao` | Inscrição na etapa |
| `inscricao.inscricao` | Entidade externa da inscrição |
| `anexos` | Arquivos anexados |
| `usuario` | Usuário que criou o recurso |

---

## Consequências

- O front-end **não precisa** conhecer as regras de status e permissão — o back-end encapsula tudo nos campos `config`, `status`, `exibir_resultado` e `parecer` (que já chegam sanitizados).
- Para listagens de formulários (seleção de cargo, escola, etc.), usar os endpoints auxiliares (`/processo/cargos`, `/processo/escolas`, `/processo/turmas`) em vez de endpoints genéricos.
- Ao vincular uma inscrição a uma etapa, o `inscricao_type` precisa ser o FQCN exato retornado por `/processo/etapa/tipos`.
