**Contexto de Arquitetura e Regras de Negócio: Portal do Professor (Administrativo)**

**Objetivo:** Você está atuando no front-end do "Portal do Professor", uma aplicação Angular. Esta aplicação consome uma API RESTful (Laravel) e atua como o painel administrativo (Master: Admin, Mediador ou RH) para o módulo de `ProcessoSeletivo`.

**Diretrizes de Implementação:**

1. **Gestão de Inscrições:** O portal é responsável por listar as inscrições consumindo a rota `GET /api/v2/processo-seletivo/inscricoes`. Implemente a listagem com suporte a paginação e filtros via query string (`spatie/laravel-query-builder`) para campos como `uuid`, `status`, `nome`, e `cpf`.
    
2. **Consumo do Web Component:** Para visualizar ou editar os dados cadastrais do candidato, o portal NÃO deve implementar o formulário. Ele deve instanciar o Web Component customizado `<micro-formulario-ps-inscricao>`.
    
3. **Integração com o Micro-frontend:** O componente Angular host deve injetar na tag do Web Component os atributos: `modo="edit"` (ou `"view"`), `auth-token="[TOKEN_DO_RH]"` e `inscricao-uuid="[UUID_DA_INSCRICAO]"`. Adicione o `CUSTOM_ELEMENTS_SCHEMA` no módulo para o Angular compilar sem erros.
    
4. **Máquina de Estados (Exclusividade do Portal do Professor):** O Web Component NÃO altera o status da inscrição. O componente Angular wrapper neste portal deve renderizar os botões de ação (ex: "Deferir", "Indeferir", "Consolidar") FORA do Web Component.
    
5. **Comunicação de Status:** Ao clicar nos botões de estado, o portal deve fazer chamadas `PATCH` diretamente para as rotas da máquina de estados, como `PATCH /inscricoes/{uuid}/deferir` ou `PATCH /inscricoes/alterar-status` (para ações em lote).
