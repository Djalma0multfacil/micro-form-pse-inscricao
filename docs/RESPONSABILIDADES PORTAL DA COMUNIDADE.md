**Contexto de Arquitetura e Regras de Negócio: Portal da Comunidade (Candidato)**

**Objetivo:** Você está atuando no front-end do "Portal da Comunidade", uma aplicação Angular. Esta aplicação é a interface voltada para o usuário final (candidato) interagir com os processos seletivos públicos.

**Diretrizes de Implementação:**

1. **Navegação e Autenticação:** O portal gerencia o login do candidato, a geração do token JWT e o roteamento entre telas, especificamente "Nova Inscrição" e "Consultar Inscrições". O cabeçalho e rodapé da página são responsabilidade deste portal.
    
2. **Nova Inscrição (Modo Create):** Na tela de nova inscrição, o portal deve instanciar o Web Component genérico `<micro-formulario-inscricao>`. O portal deve repassar via Property Binding (atributos HTML) o `modo="create"`, a `api-url`, o `auth-token` do candidato logado e o `processo-id` para o qual ele está se inscrevendo.
    
3. **Consultar Inscrição (Modo View):** Na tela de consulta, o candidato vê suas inscrições. Ao abrir os detalhes, o portal renderiza o `<micro-formulario-inscricao>` passando o `modo="view"` e o `inscricao-uuid` correspondente para que o Web Component busque os dados (`GET /inscricoes/{uuid}`) e os exiba como somente-leitura.
    
4. **Isolamento de Negócio:** Este portal NÃO possui permissões para alterar o estado (`DeferimentoState`) da inscrição. Portanto, nenhuma rota de transição de estado (`PATCH`) deve ser implementada aqui.
    
5. **Escuta de Eventos:** O portal deve escutar os `CustomEvents` emitidos pelo Web Component (ex: `(onSuccess)`) para redirecionar o usuário para a tela de "Consultar Inscrições" ou exibir um Toast de sucesso após a criação da inscrição. Não se esqueça de usar `CUSTOM_ELEMENTS_SCHEMA`.