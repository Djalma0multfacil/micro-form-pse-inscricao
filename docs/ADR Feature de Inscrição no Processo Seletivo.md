# ADR: Feature de Inscrição no Processo Seletivo

**Status:** Aceito  
**Data:** 2026-07-08  
**Módulo:** `RecursosHumanos / ProcessoSeletivo`  
**Prefixo de rota:** `GET|POST|PUT|PATCH|DELETE /api/v2/processo-seletivo/inscricoes`

---

> **Nota para LLMs (GitHub Copilot):** Este arquivo é um documento de referência de arquitetura para a feature de inscrições no processo seletivo. Ele deve ser lido como contexto primário ao gerar, revisar ou depurar qualquer código relacionado a `ProcessoSeletivoInscricao`. Todos os nomes de classe, campos, estados e convenções descritos aqui refletem o estado atual do código-base. Siga-os rigorosamente.

---

## 1. Contexto

O sistema gerencia processos seletivos da rede municipal de ensino. Candidatos se inscrevem em um processo seletivo para um cargo específico. Cada inscrição passa por um ciclo de vida discreto de deferimento, podendo ter documentos associados (laudos médicos, avaliações e certificados), cada um com seu próprio sub-ciclo de estados.

A feature precisa atender a:

- CRUD completo de inscrições com soft-delete e restore.
- Transição de estados gerenciada por máquina de estados (`spatie/laravel-model-states`).
- Upload de arquivos para S3 (laudos e certificados).
- Autorização granular por papel de usuário (`Admin`, `Mediador`, `RH`).
- Suporte a filtragem, ordenação e inclusão de relacionamentos via query string (`spatie/laravel-query-builder`).
- Alteração de estado em lote para múltiplas inscrições.

---

## 2. Decisão

A feature foi implementada com a seguinte pilha de camadas:

```
Rota (routes/recursos-humanos/api-processo-seletivo.php)
  └── Controller (app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/)
        └── FormRequest (app/Http/Requests/RecursosHumanos/ProcessoSeletivo/)
        └── Service (app/Http/Services/RecursosHumanos/ProcessoSeletivo/)
              └── Facade (app/Http/Facades/RecursosHumanos/ProcessoSeletivo/)
              └── Model (app/Models/RecursosHumanos/ProcessoSeletivo/)
                    └── States (app/States/DeferimentoStates/)
        └── Resource (app/Http/Resources/RecursosHumanos/ProcessoSeletivo/)
  └── Policy (app/Policies/RecursosHumanos/ProcessoSeletivo/)
```

Controllers são thin — delegam toda a lógica ao `ProcessoSeletivoInscricaoService`. A Facade (`ProcessoSeletivoFacade`) encapsula operações de infraestrutura (S3, e-mail, geração de número). A máquina de estados (`DeferimentoState`) controla todas as transições permitidas.

---

## 3. Estrutura de Rotas

**Arquivo:** `routes/recursos-humanos/api-processo-seletivo.php`

Todas as rotas de inscrição vivem sob o prefixo `inscricoes` dentro do grupo de processo seletivo.

### 3.1 CRUD Principal

| Método   | URI                             | Controller                          | Ação    |
|----------|---------------------------------|-------------------------------------|---------|
| `GET`    | `inscricoes`                    | `ProcessoSeletivoInscricaoController` | `index`   |
| `POST`   | `inscricoes`                    | `ProcessoSeletivoInscricaoController` | `store`   |
| `GET`    | `inscricoes/{uuid}`             | `ProcessoSeletivoInscricaoController` | `show`    |
| `PUT`    | `inscricoes/{uuid}`             | `ProcessoSeletivoInscricaoController` | `update`  |
| `DELETE` | `inscricoes/{uuid}`             | `ProcessoSeletivoInscricaoController` | `destroy` |
| `PATCH`  | `inscricoes/{uuid}/restaurar`   | `ProcessoSeletivoInscricaoController` | `restore` |

> **Convenção:** O identificador público de uma inscrição é sempre o `uuid` (string UUID v4). O `tbprocesso_seletivo_inscricao_id` (integer) é um detalhe interno e nunca é exposto em rotas.

### 3.2 Rotas de Estado da Inscrição

| Método  | URI                                      | Controller                                      | Estado destino          |
|---------|------------------------------------------|-------------------------------------------------|-------------------------|
| `GET`   | `inscricoes/status`                      | `ProcessoSeletivoInscricaoEstadosController`    | Lista todos os estados  |
| `PATCH` | `inscricoes/alterar-status`              | `ProcessoSeletivoInscricaoAlterarEstadosController` | Em lote (body)      |
| `PATCH` | `inscricoes/{uuid}/aguardando-conferencia` | `ProcessoSeletivoInscricaoAlterarEstadoController` | `AguardandoConferencia` |
| `PATCH` | `inscricoes/{uuid}/deferir`              | `ProcessoSeletivoInscricaoAlterarEstadoController` | `Deferida`              |
| `PATCH` | `inscricoes/{uuid}/indeferir`            | `ProcessoSeletivoInscricaoAlterarEstadoController` | `Indeferida`            |
| `PATCH` | `inscricoes/{uuid}/consolidar`           | `ProcessoSeletivoInscricaoAlterarEstadoController` | `Consolidada`           |

> **Padrão de injeção de estado:** O estado destino é injetado na rota via `->defaults('estado', StateClass::class)`. O controller recebe a string do FQCN da classe de estado como segundo argumento do `__invoke`.

### 3.3 Rotas de Estado da Avaliação

| Método  | URI                                                    | Controller                                           | Estado destino          |
|---------|--------------------------------------------------------|------------------------------------------------------|-------------------------|
| `PATCH` | `inscricoes/avaliacao/{avaliacao}/aguardando-conferencia` | `ProcessoSeletivoAvaliacaoAlterarEstadoController` | `AguardandoConferencia` |
| `PATCH` | `inscricoes/avaliacao/{avaliacao}/deferir`             | `ProcessoSeletivoAvaliacaoAlterarEstadoController`   | `Deferida`              |
| `PATCH` | `inscricoes/avaliacao/{avaliacao}/indeferir`           | `ProcessoSeletivoAvaliacaoAlterarEstadoController`   | `Indeferida`            |

> O `{avaliacao}` é o `tbprocesso_seletivo_avaliacao_id` (integer). A constraint `->where('avaliacao', '[0-9]+')` está aplicada. O model `ProcessoSeletivoAvaliacao` é resolvido por route model binding.

### 3.4 Rotas de Estado do Certificado

| Método  | URI                                                      | Controller                                              | Estado destino          |
|---------|----------------------------------------------------------|---------------------------------------------------------|-------------------------|
| `PATCH` | `inscricoes/certificado/{certificado}/aguardando-conferencia` | `ProcessoSeletivoCertificadoAlterarEstadoController` | `AguardandoConferencia` |
| `PATCH` | `inscricoes/certificado/{certificado}/deferir`           | `ProcessoSeletivoCertificadoAlterarEstadoController`    | `Deferida`              |
| `PATCH` | `inscricoes/certificado/{certificado}/indeferir`         | `ProcessoSeletivoCertificadoAlterarEstadoController`    | `Indeferida`            |

> O `{certificado}` é o `tbprocesso_seletivo_certificados_id` (integer). O model `ProcessoSeletivoCertificado` é resolvido por route model binding.

---

## 4. Camada de Controller

**Namespace:** `App\Http\Controllers\RecursosHumanos\ProcessoSeletivo`

### 4.1 `ProcessoSeletivoInscricaoController`

Controller principal de recursos. Injeta `ProcessoSeletivoInscricaoService` via construtor.

| Método    | Autorização Gate        | Delega para          | Retorno                            |
|-----------|-------------------------|----------------------|------------------------------------|
| `index`   | `viewAny` Inscricao     | `service->index()`   | `AnonymousResourceCollection` (paginada) |
| `store`   | `create` Inscricao      | `service->store()`   | `JsonResponse` 201                 |
| `show`    | `view` Inscricao        | `service->show()`    | `JsonResponse` 200                 |
| `update`  | `update` Inscricao      | `service->update()`  | `JsonResponse` 200                 |
| `destroy` | `delete` Inscricao      | `service->destroy()` | `JsonResponse` 200 (sem dados)     |
| `restore` | `restore` Inscricao     | `service->restore()` | `JsonResponse` 200                 |

Todas as respostas de sucesso usam `App\Funcoes\ApiResponse::success()`.

### 4.2 Controllers de Alteração de Estado (Single-Action)

Todos implementam `__invoke`. Nenhum aceita FormRequest de corpo (exceto o lote). O estado destino vem do parâmetro de rota `$estado` injetado via `->defaults()`.

**`ProcessoSeletivoInscricaoAlterarEstadoController`**  
- Recebe `(string $uuid, string $estado)`.
- Busca a inscrição pelo uuid via `inscricaoService->inscricao($uuid)`.
- Delega a transição para `estadoService->alterarEstado($inscricao, $estado)`.

**`ProcessoSeletivoInscricaoAlterarEstadosController` (lote)**  
- Recebe `ProcessoSeletivoInscricaoEstadosRequest` com `inscricoes[]` (array de IDs) e `estado` (string).
- Delega para `service->alterarEstadosEmLote($inscricoes, $estado)`.

**`ProcessoSeletivoAvaliacaoAlterarEstadoController`**  
- Recebe `(ProcessoSeletivoAvaliacao $avaliacao, string $estado)` — route model binding automático.
- Retorna o objeto `avaliacao` atualizado (`$avaliacao->refresh()`).

**`ProcessoSeletivoCertificadoAlterarEstadoController`**  
- Recebe `(ProcessoSeletivoCertificado $certificado, string $estado)` — route model binding automático.
- Retorna o objeto `certificado` atualizado (`$certificado->refresh()`).

---

## 5. Camada de Service

**Arquivo:** `app/Http/Services/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoService.php`

### 5.1 `index(): LengthAwarePaginator`

Usa `spatie/laravel-query-builder` (`QueryBuilder::for`).

**Includes permitidos:**
```
processoSeletivo | cargo | pais | laudo | avaliacao | certificados.anexos
```

**Filtros disponíveis:**

| Filtro                    | Tipo       | Campo DB                        |
|---------------------------|------------|---------------------------------|
| `uuid`                    | exact      | `uuid`                          |
| `tbprocesso_seletivo_id`  | exact      | `tbprocesso_seletivo_id`        |
| `numero_inscricao`        | exact      | `numero_inscricao`              |
| `status`                  | exact      | `status`                        |
| `nome`                    | exact      | `nome`                          |
| `data_nascimento_ini`     | callback   | `WHERE data_nascimento >= $v`   |
| `data_nascimento_fim`     | callback   | `WHERE data_nascimento <= $v`   |
| `tbcargos_id`             | exact      | `tbcargos_id`                   |
| `email`                   | partial    | `email`                         |
| `cpf`                     | partial    | `cpf`                           |
| `rg`                      | partial    | `rg`                            |
| `telefone`                | partial    | `telefone`                      |
| `pcd`                     | exact      | `pcd`                           |
| `afrodescendente`         | exact      | `afrodescendente`               |
| `created_at_ini/fim`      | callback   | `WHERE created_at >= / <=`      |
| `only_trashed`            | callback   | `->onlyTrashed()` quando `true` |

**Ordenação padrão:** `-created_at` (decrescente).

### 5.2 `store(array $data): ProcessoSeletivoInscricao`

Executa dentro de `DB::transaction`:
1. Gera `uuid` com `Str::uuid()` e injeta em `$data`.
2. Gera `numero_inscricao` via `ProcessoSeletivoFacade::gerarNumeroInscricao()`.
3. Cria `ProcessoSeletivoInscricao::create($data)`.
4. Faz upload de laudos via `ProcessoSeletivoFacade::uploadLaudo()`.
5. Cria/atualiza avaliação via `ProcessoSeletivoFacade::uploadAvaliacao()`.
6. Faz upload de certificados via `ProcessoSeletivoFacade::uploadCertificados()`.
7. Envia e-mail via `ProcessoSeletivoFacade::sendEmail()`.
8. Retorna `self::show($inscricao->uuid)` com todos os relacionamentos carregados.

### 5.3 `show(string $uuid): ProcessoSeletivoInscricao`

1. Chama `self::inscricao($uuid)` para buscar com `withTrashed`.
2. Carrega eager: `processoSeletivo`, `cargo`, `pais`, `laudo`, `avaliacao`, `certificados.anexos`.
3. Processa downloads do S3 via `ProcessoSeletivoFacade::downloadLaudo()` e `downloadCertificados()`.

### 5.4 `update(array $data, string $uuid): ProcessoSeletivoInscricao`

Executa dentro de `DB::transaction`:
1. Busca inscrição com `inscricao($uuid)`.
2. Chama `$inscricao->update($data)`.
3. Re-processa uploads de laudo, avaliação e certificados.
4. Retorna `self::show()` atualizado.

### 5.5 `destroy(string $uuid): void`

- Busca com `inscricao($uuid)` (que usa `withTrashed`).
- `abort_if($inscricao->deleted_at, 403, ...)` — previne double-delete.
- Chama `ProcessoSeletivoInscricao::destroy($id)` (soft delete).

### 5.6 `restore(string $uuid): ProcessoSeletivoInscricao`

- Busca com `inscricao($uuid)`.
- `abort_if(!$inscricao->deleted_at, 403, ...)` — só restaura se estiver excluída.
- Chama `$inscricao->restore()`.
- Retorna `self::show()` com relacionamentos.

### 5.7 `inscricao(string $uuid): ProcessoSeletivoInscricao` (helper interno)

```php
$inscricao = ProcessoSeletivoInscricao::withTrashed()->firstWhere('uuid', $uuid);
abort_if(!$inscricao, 403, 'Inscrição não encontrada!');
```

> **Importante:** Usa `403` (não `404`) para não expor existência de registros a usuários sem permissão. Este padrão é consistente em todo o módulo.

---

## 6. Service de Estados

**Arquivo:** `app/Http/Services/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoEstadosService.php`

Estende `ProcessoSeletivoInscricaoService`.

### 6.1 `estados(): array` (estático)

Retorna todos os estados disponíveis com metadados de UI:

```json
[
  { "valor": "aguardando_conferencia", "descricao": "Aguardando Conferência", "cor": "#868e96", "icone": "fa fa-folder-open", "badge": "badge badge-secondary", "btn": "btn btn-secondary" },
  { "valor": "deferida",               "descricao": "Deferido(a)",            "cor": "#0cc27e", "icone": "fa fa-check-circle-o", "badge": "badge badge-success", "btn": "btn btn-success" },
  { "valor": "indeferida",             "descricao": "Indeferido(a)",          "cor": "#ff586b", "icone": "fa fa-times-circle-o", "badge": "badge badge-danger",  "btn": "btn btn-danger" },
  { "valor": "consolidada",            "descricao": "Consolidado(a)",         "cor": "#009da0", "icone": "fa fa-folder",         "badge": "badge badge-primary", "btn": "btn btn-primary" }
]
```

### 6.2 `alterarEstado(mixed $objeto, string $estado): void`

Funciona para qualquer entidade com campo `status` do tipo `DeferimentoState` (`ProcessoSeletivoInscricao`, `ProcessoSeletivoAvaliacao`, `ProcessoSeletivoCertificado`).

Lógica:
1. Instancia o estado destino: `$estado = new $estado($objeto)`.
2. Obtém estado atual: `$estadoAtual = $objeto->status`.
3. `abort_if($estadoAtual->equals($estado), 403, 'O status já está como ...')`.
4. `abort_if(!$estadoAtual->canTransitionTo($estado), 403, 'Não é possível alterar...')`.
5. `$objeto->status->transitionTo($estado)`.

### 6.3 `alterarEstadosEmLote(array $inscricoes, string $estado): void`

- Busca apenas `tbprocesso_seletivo_inscricao_id` e `status` das inscrições.
- Para cada uma: ignora silenciosamente se já está no estado ou se a transição é inválida.
- Não aborta em erros individuais — faz o melhor possível (best-effort).

---

## 7. Máquina de Estados (`DeferimentoState`)

**Namespace:** `App\States\DeferimentoStates`  
**Pacote:** `spatie/laravel-model-states`

### 7.1 Diagrama de Transições

```
                  ┌───────────────────────┐
                  │   AguardandoConferencia │  ← estado padrão (default)
                  └───────┬───────┬────────┘
                          │       │
               ┌──────────▼─┐  ┌──▼──────────┐
               │  Deferida   │  │  Indeferida  │
               └──┬──────┬───┘  └───┬──────┬──┘
                  │      │          │      │
                  │      └────┐ ┌───┘      │
                  │           │ │           │
               ┌──▼────────▼─▼─▼──────────▼──┐
               │         AguardandoConferencia  │ (retorno permitido)
               └──────────────────────────────┘
                  │
         ┌────────▼────────┐
         │   Consolidada    │  ← só acessível de Deferida
         └──┬───────────────┘
            │  pode ir para AguardandoConferencia, Deferida ou Indeferida
```

**Transições completas (configuradas em `DeferimentoState::config()`):**

| De                    | Para                  |
|-----------------------|-----------------------|
| `AguardandoConferencia` | `Deferida`          |
| `AguardandoConferencia` | `Indeferida`        |
| `Deferida`            | `AguardandoConferencia` |
| `Deferida`            | `Indeferida`          |
| `Deferida`            | `Consolidada`         |
| `Indeferida`          | `AguardandoConferencia` |
| `Indeferida`          | `Deferida`            |
| `Consolidada`         | `AguardandoConferencia` |
| `Consolidada`         | `Deferida`            |
| `Consolidada`         | `Indeferida`          |

> **Nota para Copilot:** `Consolidada` é exclusiva da inscrição principal. Avaliações e certificados usam apenas `AguardandoConferencia`, `Deferida` e `Indeferida` (veja `DeferimentoState::statesInscricao()`).

### 7.2 Classes de Estado

| Classe                  | `$name`                 | Cor       | Uso             |
|-------------------------|-------------------------|-----------|-----------------|
| `AguardandoConferencia` | `aguardando_conferencia`| `#868e96` | Default inicial |
| `Deferida`              | `deferida`              | `#0cc27e` | Aprovado        |
| `Indeferida`            | `indeferida`            | `#ff586b` | Reprovado       |
| `Consolidada`           | `consolidada`           | `#009da0` | Finalizado      |

O campo `status` no banco armazena o valor de `$name` (string).

---

## 8. Model `ProcessoSeletivoInscricao`

**Arquivo:** `app/Models/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricao.php`  
**Tabela:** `tbprocesso_seletivo_inscricao`  
**PK:** `tbprocesso_seletivo_inscricao_id`  
**Traits:** `SoftDeletes`

### 8.1 Campos Fillable

| Campo                    | Tipo PHP     | Observação                                      |
|--------------------------|--------------|-------------------------------------------------|
| `tbprocesso_seletivo_id` | `integer`    | FK para `tbprocesso_seletivo`                   |
| `uuid`                   | `string`     | Identificador público (UUID v4)                 |
| `numero_inscricao`       | `integer`    | Gerado sequencialmente pela Facade              |
| `notificacao`            | `boolean`    | Flag de e-mail de confirmação                   |
| `status`                 | `DeferimentoState` | Cast para máquina de estados            |
| `nome`                   | `string`     | Nome completo do candidato                      |
| `data_nascimento`        | `date`       |                                                 |
| `tbcargos_id`            | `integer`    | FK para `tbcargos`                              |
| `email`                  | `string`     |                                                 |
| `cpf`                    | `string`     | Máx. 11 chars (somente dígitos)                 |
| `filhos`                 | `integer`    |                                                 |
| `rg`                     | `string`     | Máx. 9 chars                                    |
| `rg_orgao_emissor`       | `string`     |                                                 |
| `rg_uf_orgao_emissor`    | `string`     | Sigla da UF (ex: SP, RJ)                        |
| `telefone`               | `string`     | Máx. 11 chars (somente dígitos)                 |
| `nacionalidade`          | `string`     |                                                 |
| `tbpaises_id`            | `integer`    | FK para `tbpaises`                              |
| `cep`                    | `string`     | Máx. 8 chars (somente dígitos)                  |
| `estado`                 | `string`     | Nome do estado (ex: São Paulo)                  |
| `cidade`                 | `string`     |                                                 |
| `bairro`                 | `string`     |                                                 |
| `endereco`               | `string`     |                                                 |
| `numero`                 | `string`     |                                                 |
| `complemento`            | `string\|null` | Nullable                                      |
| `estado_civil`           | `string`     |                                                 |
| `pcd`                    | `integer`    | 1 = PCD, 0 = não PCD                            |
| `descricao_pcd`          | `string\|null` | Obrigatório se `pcd = true`                   |
| `afrodescendente`        | `integer`    | 1 = sim, 0 = não                                |

### 8.2 Relacionamentos

| Método           | Tipo          | Model destino                      | FK local                           |
|------------------|---------------|------------------------------------|------------------------------------|
| `processoSeletivo` | `BelongsTo` | `ProcessoSeletivo`                 | `tbprocesso_seletivo_id`           |
| `cargo`          | `BelongsTo`   | `Cargo`                            | `tbcargos_id`                      |
| `pais`           | `BelongsTo`   | `Paises`                           | `tbpaises_id`                      |
| `laudo`          | `HasMany`     | `ProcessoSeletivoLaudoAnexos`      | `tbprocesso_seletivo_inscricao_id` |
| `avaliacao`      | `HasOne`      | `ProcessoSeletivoAvaliacao`        | `tbprocesso_seletivo_inscricao_id` |
| `certificados`   | `HasMany`     | `ProcessoSeletivoCertificado`      | `tbprocesso_seletivo_inscricao_id` |
| `recursos`       | `MorphMany`   | `ProcessoRecurso`                  | Polimórfico (`inscricao`)          |

### 8.3 Models Relacionados com Estados

**`ProcessoSeletivoAvaliacao`** (`tbprocesso_seletivo_avaliacao`)

| Campo                             | Tipo    |
|-----------------------------------|---------|
| `tbprocesso_seletivo_avaliacao_id` | PK     |
| `tbprocesso_seletivo_inscricao_id` | FK     |
| `nota`                            | `float` |
| `status`                          | `DeferimentoState` |
| `condicao_especial`               | `string` |
| `observacao`                      | `string` |

**`ProcessoSeletivoCertificado`** (`tbprocesso_seletivo_certificados`)

| Campo                               | Tipo      |
|-------------------------------------|-----------|
| `tbprocesso_seletivo_certificados_id` | PK      |
| `tbprocesso_seletivo_inscricao_id`  | FK        |
| `experiencia`                       | `decimal` |
| `assiduidade`                       | `decimal` |
| `pontuacao_final`                   | `decimal` |
| `tipo`                              | `string`  |
| `status`                            | `DeferimentoState` |

Certificados têm `HasMany` para `ProcessoSeletivoCertificadoAnexos` (arquivos no S3).

---

## 9. Facade `ProcessoSeletivoFacade`

**Arquivo:** `app/Http/Facades/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoFacade.php`

Classe estática pura (não é um Laravel Facade real). Centraliza operações de infraestrutura:

| Método                   | Responsabilidade                                                             |
|--------------------------|------------------------------------------------------------------------------|
| `gerarNumeroInscricao()` | Busca o maior `numero_inscricao` existente (com `withoutGlobalScopes`) e incrementa. Começa em 1234. |
| `uploadLaudo()`          | Remove laudos deletados do S3 e cria novos via `UploadToS3::saveMany()`.     |
| `uploadAvaliacao()`      | `updateOrCreate` na avaliação da inscrição.                                  |
| `uploadCertificados()`   | Para cada certificado: `updateOrCreate` e faz upload dos anexos no S3.       |
| `downloadLaudo()`        | Gera URLs temporárias do S3 para os laudos.                                  |
| `downloadCertificados()` | Gera URLs temporárias do S3 para os anexos dos certificados.                 |
| `sendEmail()`            | Dispara `ProcessoSeletivoMail` para o e-mail do candidato.                   |

> **Atenção para Copilot:** `uploadLaudo` diferencia laudos novos (sem `tbprocesso_seletivo_laudo_anexos_id`) de existentes. Laudos que não estiverem no payload são deletados do S3.

---

## 10. Validação (FormRequests)

### 10.1 `ProcessoSeletivoInscricaoStoreRequest`

**Autorização:** `Gate::allows('create', ProcessoSeletivoInscricao::class)`

Campos obrigatórios (todos os dados pessoais + endereço + `pcd` + `afrodescendente`).

Regras especiais:
- `laudos`: `required_if:pcd,true` — laudos são obrigatórios quando `pcd = true`.
- `laudos.*.file`: arquivo obrigatório (binário base64 ou multipart).
- `avaliacao`: `nullable|size:4` — exatamente 4 itens se informado.
- `certificados`: nullable, com validação em cascata de `*.tipo` e `*.anexos`.

### 10.2 `ProcessoSeletivoInscricaoUpdateRequest`

Mesma estrutura da Store, mas os campos podem ser enviados parcialmente.

### 10.3 `ProcessoSeletivoInscricaoEstadosRequest`

Para alteração em lote:

```php
'inscricoes' => 'required|array',         // array de IDs inteiros
'estado'     => 'required|string',         // FQCN ou valor do estado
```

---

## 11. Authorization (Policy)

**Arquivo:** `app/Policies/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoPolicy.php`

**Usuários master** (`isAdmin || isMediador || isRh`): o método `before()` retorna `true`, concedendo acesso irrestrito a todas as ações.

| Ação       | Não-master pode? | Restrição              |
|------------|------------------|------------------------|
| `viewAny`  | Sim              | —                      |
| `view`     | Sim              | —                      |
| `create`   | Sim              | —                      |
| `update`   | Sim              | —                      |
| `delete`   | **Não**          | `abort_if(!master, 403)` |
| `restore`  | **Não**          | `abort_if(!master, 403)` |

> Operações destrutivas (delete/restore) requerem perfil de admin, mediador ou RH.

---

## 12. API Resource

**Arquivo:** `app/Http/Resources/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoResource.php`

O resource serializa todos os campos do model e carrega relacionamentos condicionalmente (quando pré-carregados):

```json
{
  "uuid": "...",
  "numero_inscricao": 1234,
  "status": "aguardando_conferencia",
  "nome": "João da Silva",
  "data_nascimento": "1990-01-01",
  "email": "joao@email.com",
  "cpf": "12345678901",
  "rg": "123456789",
  "rg_orgao_emissor": "SSP",
  "rg_uf_orgao_emissor": "SP",
  "telefone": "11987654321",
  "nacionalidade": "Brasileira",
  "cep": "12345678",
  "estado": "São Paulo",
  "cidade": "São Paulo",
  "bairro": "Centro",
  "endereco": "Rua Exemplo",
  "numero": "123",
  "complemento": null,
  "estado_civil": "Solteiro",
  "pcd": false,
  "descricao_pcd": null,
  "afrodescendente": false,
  "filhos": 0,
  "processo_seletivo": { ... },
  "cargo": { ... },
  "pais": { ... },
  "laudo": [ ... ],
  "avaliacao": { ... },
  "certificados": [ { "tipo": "Graduação", "status": "deferida", "anexos": [ ... ] } ],
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-02T00:00:00.000000Z",
  "deleted_at": null
}
```

---

## 13. Padrões e Convenções Chave

### 13.1 Identificadores

- **Rota pública:** sempre `uuid` (UUID v4 gerado no `store`).
- **Interno/FK:** `tbprocesso_seletivo_inscricao_id` (integer, nunca exposto em URL).
- **Avaliações e Certificados:** usam PK inteira nas rotas (resolvidos por route model binding).

### 13.2 Resposta de Erro

O sistema usa `abort_if()` com código `403` para registros não encontrados (não usa `404`). Isso é intencional para evitar enumeração de recursos.

### 13.3 Transações de Banco

`store` e `update` são envolvidos em `DB::transaction` para garantir atomicidade entre criação do registro principal e os uploads/relacionamentos.

### 13.4 Query Builder

Filtros são passados via query string como `filtro[campo]=valor`. Ordenação via `sort=campo` (prefixo `-` para DESC). Includes via `include=rel1,rel2`.

### 13.5 Estados Compartilhados

`DeferimentoState` é reutilizado por `RemocaoInscricao` e `ProcessoRecurso` também. Qualquer mudança na configuração de transições afeta todos os módulos.

---

## 14. Fluxo Completo de uma Inscrição

```
1. POST /inscricoes
   ├── Validação (StoreRequest)
   ├── Gate::authorize('create')
   ├── DB::transaction {
   │     ├── Gera uuid e numero_inscricao
   │     ├── ProcessoSeletivoInscricao::create()   → status = AguardandoConferencia
   │     ├── uploadLaudo()   → S3 (se pcd=true)
   │     ├── uploadAvaliacao() → tbprocesso_seletivo_avaliacao
   │     ├── uploadCertificados() → S3 + tbprocesso_seletivo_certificados
   │     └── sendEmail()
   │   }
   └── Retorna ProcessoSeletivoInscricaoResource (201)

2. PATCH /inscricoes/{uuid}/deferir
   ├── Gate::authorize('update')
   ├── Busca inscricao por uuid (withTrashed)
   ├── alterarEstado(inscricao, Deferida::class)
   │     ├── abort_if já está Deferida
   │     ├── abort_if transição inválida
   │     └── status->transitionTo(Deferida)
   └── Retorna 200 com mensagem

3. PATCH /inscricoes/avaliacao/{id}/deferir
   ├── Gate::authorize('update' Inscricao)
   ├── Route model binding → ProcessoSeletivoAvaliacao
   ├── alterarEstado(avaliacao, Deferida::class)
   └── Retorna avaliacao->refresh()
```

---

## 15. Arquivos de Referência Rápida

| Responsabilidade             | Caminho                                                                                  |
|------------------------------|------------------------------------------------------------------------------------------|
| Rotas                        | `routes/recursos-humanos/api-processo-seletivo.php`                                     |
| Controller principal         | `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoController.php` |
| Controller alterar estado    | `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoAlterarEstadoController.php` |
| Controller alterar estados   | `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoAlterarEstadosController.php` |
| Controller avaliação estado  | `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoAvaliacaoAlterarEstadoController.php` |
| Controller certificado estado| `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoCertificadoAlterarEstadoController.php` |
| Controller lista estados     | `app/Http/Controllers/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoEstadosController.php` |
| Service principal            | `app/Http/Services/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoService.php` |
| Service de estados           | `app/Http/Services/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoEstadosService.php` |
| Facade                       | `app/Http/Facades/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoFacade.php`          |
| Model inscrição              | `app/Models/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricao.php`             |
| Model avaliação              | `app/Models/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoAvaliacao.php`             |
| Model certificado            | `app/Models/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoCertificado.php`           |
| States                       | `app/States/DeferimentoStates/` (`DeferimentoState`, `AguardandoConferencia`, `Deferida`, `Indeferida`, `Consolidada`) |
| StoreRequest                 | `app/Http/Requests/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoStoreRequest.php` |
| UpdateRequest                | `app/Http/Requests/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoUpdateRequest.php` |
| EstadosRequest (lote)        | `app/Http/Requests/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoEstadosRequest.php` |
| Resource                     | `app/Http/Resources/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoResource.php` |
| Policy                       | `app/Policies/RecursosHumanos/ProcessoSeletivo/ProcessoSeletivoInscricaoPolicy.php`     |

---

## 16. Consequências e Trade-offs

### Positivos
- **Máquina de estados explícita:** transições inválidas são bloqueadas automaticamente, o sistema nunca fica em estado inconsistente.
- **Facade de infraestrutura:** uploads/e-mails isolados do domínio, facilitando substituição de provedores.
- **UUID como identificador público:** permite que clientes guardem referências sem expor o autoincrement interno.
- **Query Builder declarativo:** adicionar novos filtros não requer mudanças no controller.

### Trade-offs / Atenções
- **`abort_if` com 403 para not found:** consumidores da API precisam tratar 403 como "não encontrado ou sem permissão" — não há diferenciação semântica.
- **`withTrashed` no helper `inscricao()`:** toda busca por uuid carrega registros deletados. Isso é necessário para restore, mas deve ser considerado em contextos onde soft-deleted não deveriam ser visíveis.
- **Avaliação usa `updateOrCreate`:** há somente uma avaliação por inscrição (`HasOne`). Se a lógica mudar para múltiplas avaliações, o Facade e o model precisarão ser atualizados.
- **Número de inscrição sequencial global:** `gerarNumeroInscricao` não é por processo seletivo, é global. Há risco de race condition em alta concorrência sem lock explícito.
