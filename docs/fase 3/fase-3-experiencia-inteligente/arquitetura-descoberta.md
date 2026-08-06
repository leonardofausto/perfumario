# Fase 3 — Descoberta e arquitetura

## Escopo e método

Este documento registra o estado do Perfumário em 3 de agosto de 2026 e a
arquitetura recomendada para a Fase 3. Ele é somente documental: não cria
rotas, componentes, contratos, migrations ou dados.

A descoberta foi feita com:

- consultas dirigidas ao grafo existente em `graphify-out/graph.json`;
- leitura direta dos arquivos citados nas seções abaixo;
- inspeção de `package.json`, das migrations e dos testes relacionados.

O executável `graphify.exe` foi bloqueado pela política de Controle de
Aplicativo do Windows. As consultas foram executadas pelo mesmo pacote com
`python.exe -m graphify query`, sem alterar o grafo.

## 1. Mapa de rotas atuais

### Área pública e autenticação

| Rota | Implementação | Responsabilidade atual |
| --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | Apresentação pública |
| `/login` | `src/app/(auth)/login/page.tsx` | Entrada na conta |
| `/recuperar-senha` | `src/app/(auth)/recuperar-senha/page.tsx` | Solicitação de recuperação |
| `/redefinir-senha` | `src/app/(auth)/redefinir-senha/page.tsx` | Redefinição da senha |
| `/auth/callback` | `src/app/auth/callback/route.ts` | Callback de autenticação |

### Área privada

O limite autenticado está em `src/app/(app)/layout.tsx`. O layout chama
`requireUser()`, carrega somente o perfil do usuário atual e entrega o conteúdo
ao `AppShell`.

| Rota | Implementação | Responsabilidade atual | Destino na Fase 3 |
| --- | --- | --- | --- |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` | Contagens da coleção e três itens recentes | `Visão geral` |
| `/colecao` | `src/app/(app)/colecao/page.tsx` | Listagem, filtros e favoritos | `Minha estante` |
| `/colecao/novo` | `src/app/(app)/colecao/novo/page.tsx` | Cadastro de perfume | Fluxo interno de `Minha estante` |
| `/colecao/[id]` | `src/app/(app)/colecao/[id]/page.tsx` | Detalhe editorial | Fluxo interno de `Minha estante` |
| `/colecao/[id]/editar` | `src/app/(app)/colecao/[id]/editar/page.tsx` | Edição | Fluxo interno de `Minha estante` |
| `/recomendador` | `src/app/(app)/recomendador/page.tsx` | Contexto e Top 3 | `Recomendador` |
| `/historico` | `src/app/(app)/historico/page.tsx` | Empty state sem persistência | Não reutilizar como Diário sem decisão explícita |
| `/perfil` | `src/app/(app)/perfil/page.tsx` | Perfil privado | Menu da conta, fora dos cinco módulos |

As futuras rotas de `Diário de uso` e `Análises` ainda não existem. A Sprint 02
deve decidir seus caminhos canônicos antes de qualquer tela, preservando as
rotas internas da estante e o perfil fora da navegação principal.

### Navegação

- `src/config/navigation.ts` é a fonte única dos itens do menu.
- `src/components/layout/app-sidebar.tsx` renderiza a navegação desktop e
  identifica a rota ativa por prefixo.
- `src/components/layout/mobile-navigation.tsx` reutiliza a mesma sidebar em
  um diálogo com foco inicial, ciclo de Tab, Escape, bloqueio do scroll e
  restauração do foco.
- `src/components/layout/app-shell.tsx` coordena sidebar, cabeçalho mobile e
  conteúdo.

Hoje o menu contém `Dashboard`, `Minha Coleção` e `Recomendador`. A mudança
para os cinco nomes aprovados pertence à Sprint 02.

## 2. Mapa de componentes

### Shell e componentes compartilhados

| Componente | Arquivo | Possível reuso |
| --- | --- | --- |
| `AppShell` | `src/components/layout/app-shell.tsx` | Shell dos cinco módulos |
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Navegação desktop e móvel |
| `MobileNavigation` | `src/components/layout/mobile-navigation.tsx` | Menu móvel acessível |
| `UserMenu` | `src/components/layout/user-menu.tsx` | Perfil e saída |
| `PageHeader` | `src/components/ui/page-header.tsx` | Cabeçalho editorial |
| `EmptyState` | `src/components/ui/empty-state.tsx` | Ausência honesta de dados |
| `StatCard` | `src/components/dashboard/stat-card.tsx` | Indicador simples real |

Os estilos compartilhados de página, cabeçalho, estado vazio e indicadores
estão em `src/components/ui/workspace.module.css`. Tokens editoriais globais
estão em `src/app/globals.css`. O shell responsivo está em
`src/components/layout/app-shell.module.css`.

### Estante

`CollectionView`, `PerfumeCard`, `PerfumeDetail` e `PerfumeForm` ficam sob
`src/components/collection/`. `CollectionView` já demonstra filtro local,
paginação, `useTransition` e atualização por Server Action. Seus selects não
devem ser copiados para filtros analíticos: a Fase 3 exige botões segmentados
nos filtros principais de Análises.

### Recomendador

`src/components/recommender/recommender-view.tsx` concentra a interação de
contexto, seleção e apresentação do ranking. Chips como `optionChip` em
`src/components/recommender/recommender.module.css` são a referência visual
mais próxima para filtros segmentados. A regra de pontuação, porém, já está
fora da tela em `src/features/recommender/`.

### Estados

- loading global: `src/app/loading.tsx`;
- skeleton da área privada: `src/app/(app)/loading.tsx`;
- erro recuperável: `src/app/error.tsx`;
- não encontrado: `src/app/not-found.tsx`;
- vazio reutilizável: `src/components/ui/empty-state.tsx`;
- vazios específicos do Recomendador: `recommender-view.tsx` e seu CSS.

Não existe primitiva específica para gráfico, tooltip analítico, legenda ou
controle segmentado compartilhado.

## 3. Mapa de contratos

### Perfumes

`src/features/perfumes/types.ts` é o contrato de domínio atual:

- `PerfumeFormInput`: entrada editorial e notas/pontuações;
- `PerfumeSummary`: identidade, classificação, imagem assinada, favorito e
  atributos sensoriais;
- `PerfumeDetail`: summary mais descrição, fontes, caminho privado da imagem,
  notas, scores e timestamps;
- `PerfumeScore`: categoria, chave da métrica e score opcional;
- enums derivados de `src/features/perfumes/constants.ts`.

Não existem hoje contratos para:

- registro de uso;
- elogio vinculado a uso;
- ocasião, horário, ambiente e clima observados em um uso;
- satisfação do uso;
- nível qualitativo do recipiente;
- intenção de reposição;
- séries ou agregados analíticos.

Esses contratos devem nascer no domínio da respectiva feature, e não em
componentes de página. `PerfumeSummary` só deve crescer quando um consumidor
real de listagem precisar do campo; consultas analíticas não devem transformar
esse tipo em um objeto universal.

### Recomendador

`src/features/recommender/types.ts` define contexto, seleções, candidato,
contribuições e resultado. `RecommenderPerfume` estende `PerfumeSummary` com
scores editoriais. `src/features/recommender/scoring.ts` calcula e ordena os
resultados; pesos e opções ficam em `scoring-config.ts`; explicações ficam em
`reasons.ts`; adequação climática fica em `weather-fit.ts`.

O histórico real deve entrar futuramente por um contrato secundário explícito,
sem acoplar queries ao componente e sem misturar nível ou reposição no score.

## 4. Mapa de dados

### Leitura atual

`src/features/perfumes/queries.ts` concentra as leituras privadas:

- `listOwnPerfumes()`: summaries e URLs assinadas em lote;
- `listOwnRecommenderPerfumes()`: summaries mais scores;
- `getOwnPerfume(id)`: detalhe, notas, scores e imagem assinada;
- `getOwnPerfumeDashboard()`: duas contagens e três perfumes recentes.

Todas obtêm a sessão com `requireUser()` e repetem `.eq("user_id", user.id)`,
além da proteção do banco.

O Dashboard não possui repository próprio nem métricas históricas. A métrica
“Recomendações salvas” é renderizada com valor constante zero e não pode ser
tratada como dado real na remodelagem.

### Escrita atual

`src/features/perfumes/actions.ts` valida `FormData` com Zod, autentica no
servidor, chama RPCs atômicas para criação/edição, limita update/delete por
`id + user_id`, revalida consumidores e redireciona. Esse é o padrão de escrita
a preservar para o Diário e para níveis/reposição:

1. autenticar;
2. validar entrada;
3. persistir de forma atômica e escopada;
4. retornar estado de erro explícito;
5. revalidar somente rotas consumidoras.

### Agregados futuros

Consultas de Dashboard e Análises devem ficar em módulos server-only próprios,
por exemplo `src/features/analytics/queries.ts`, retornando DTOs pequenos e
prontos para renderização. Não se deve carregar todos os usos para agregar
dentro de React.

Para intervalos curtos e volume pequeno, queries agrupadas e indexadas são a
primeira opção. Views ou RPCs agregadas só devem ser introduzidas quando
reduzirem round-trips ou custo comprovado; se expostas, precisam respeitar RLS
(`security_invoker`) e grants explícitos.

## 5. Mapa de autenticação e RLS

### Aplicação

- `src/lib/supabase/server.ts` cria o cliente SSR com cookies e chave
  publicável;
- `src/lib/auth/session.ts` usa `auth.getUser()` e redireciona visitantes;
- o layout privado protege todas as rotas do grupo `(app)`;
- queries e actions autenticam novamente como fronteira de segurança.

### Banco atual

As migrations criam `profiles`, `perfumes`, `perfume_notes`,
`perfume_scores`, cache e rate limit do autofill. As tabelas editoriais usam:

- `user_id` obrigatório com cascade a partir de `auth.users`;
- RLS habilitada;
- grants para `authenticated`;
- policies por operação com `(select auth.uid()) = user_id`;
- `USING` e `WITH CHECK` nos updates;
- FKs compostas `(perfume_id, user_id)` nos filhos;
- RPCs de perfume como `security invoker`, com validação adicional de
  `p_user_id`;
- bucket privado `perfume-images`, com pasta inicial igual ao usuário.

As tabelas internas de autofill têm RLS sem policy para clientes e grants
somente ao `service_role`.

### Regra para a Fase 3

Cada nova tabela privada deve repetir a defesa em profundidade:

- `user_id not null`;
- vínculo composto com o perfume e/ou uso quando aplicável;
- RLS antes da exposição;
- policies CRUD separadas e ownership em `USING`/`WITH CHECK`;
- revoke/grant explícitos;
- índices iniciando por colunas usadas no recorte do usuário e do período;
- teste de acesso cruzado entre dois usuários.

Um elogio deve pertencer ao mesmo usuário e ao mesmo registro de uso. Não deve
existir elogio órfão ou diretamente agregado ao perfume sem o uso de origem.

## 6. Pontos de extensão

1. `src/config/navigation.ts`: cinco módulos, somente na Sprint 02.
2. `src/features/usage-log/`: contratos, schema, queries e actions do Diário.
3. `src/features/inventory/`: nível qualitativo e intenção de reposição, caso a
   descoberta da Sprint 05 confirme que esse limite é mais claro que ampliar
   `perfumes`.
4. `src/features/analytics/`: filtros, DTOs e queries agregadas.
5. `src/features/recommender/`: adaptador de sinais históricos secundários,
   mantendo `scorePerfumes()` puro.
6. `src/components/ui/`: controle segmentado e estados analíticos somente
   quando houver pelo menos dois consumidores confirmados.
7. `src/components/charts/`: adaptadores visuais pequenos, sem consultas.

## 7. Riscos e lacunas

| Risco ou lacuna | Impacto | Mitigação arquitetural |
| --- | --- | --- |
| Não há tabelas de uso, elogio, nível ou reposição | Fase 3 depende de novas migrations | Modelar por sprint, com ownership composto, RLS, grants e testes |
| Não há biblioteca de gráficos em `package.json` | Análises ainda não têm renderer | Sprint 07 deve avaliar necessidade e instalar apenas uma opção compatível; Sprint 01 não escolhe pacote |
| Dashboard contém métrica constante zero | Pode parecer dado real | Remover/substituir apenas na Sprint 08 por agregado persistido ou estado honesto |
| `/historico` é apenas placeholder | Ambiguidade com Diário de uso | Sprint 02 define rota canônica e estratégia de compatibilidade |
| `recommender-view.tsx` é grande e stateful | Risco ao integrar histórico | Manter histórico no domínio/query; evitar nova lógica de score no componente |
| Agregar usos no cliente | Custo, exposição e inconsistência | Agregar no servidor/banco, por usuário e período |
| Séries sem pontos suficientes | Gráficos enganosos | DTO informa suficiência; UI usa estado vazio/textual |
| Filtros de data sem timezone explícito | Cortes diários divergentes | Normalizar instantes em UTC e calcular limites com timezone acordado |
| Índices insuficientes para usuário + período | Dashboard e Análises lentos | Planejar índices a partir das queries reais e confirmar com `EXPLAIN` |
| Duplicação de ações entre módulos | Responsabilidade confusa | Escrita no módulo dono; Dashboard e Análises apenas apontam para ele |
| Histórico alterar demais o ranking | Resultado opaco | Peso secundário/tie-break documentado e contribuições explicáveis |
| Nível qualitativo virar percentual disfarçado | Viola regra de domínio | Enum persistido; valores visuais internos nunca expostos como medida |
| Worktree atual contém mudanças alheias | Risco de diff impreciso | Validar esta sprint pelo arquivo criado e não tocar no restante |

## 8. Arquitetura recomendada

### Limites dos cinco módulos

- **Visão geral:** DTOs agregados e alertas resumidos, sem formulários
  completos.
- **Minha estante:** fonte de gerenciamento do perfume, recipiente, nível e
  reposição.
- **Recomendador:** candidatos editoriais + contexto + sinais históricos
  secundários; mantém explicação do resultado.
- **Diário de uso:** dono da criação e consulta de usos e elogios.
- **Análises:** leitura agregada e filtrada, sem mutações do Diário ou da
  estante.

### Fluxo recomendado

```text
Server Page
  -> query server-only autenticada
    -> Supabase com user_id + RLS
      -> DTO de domínio/agregado
        -> componente de apresentação
```

Mutações seguem `Client Form -> Server Action -> schema -> Supabase/RPC ->
revalidate`, sempre com ownership explícito.

### Diário de uso

O agregado raiz recomendado é um registro de uso privado ligado a
`perfume_id + user_id`. Ocasião, horário, ambiente, clima, satisfação,
observação e instante pertencem ao uso. Elogios são filhos do uso, também com
`user_id`, para impedir associação cruzada e preservar o evento que os
originou. A modelagem final pertence à Sprint 03.

### Níveis qualitativos

Persistir somente o enum aprovado: `not_informed`, `full`, `half`, `low` e
`empty` (nomes técnicos finais a confirmar na Sprint 05), exibindo os rótulos
em português. A barra pode mapear esses estados para desenho, mas nenhum valor
numérico, percentual ou mililitro compõe o contrato público. A intenção de
reposição é condicionada pelo tipo de recipiente e pelos estados `No final` ou
`Acabou`.

### Análises e gráficos

Separar três camadas:

1. filtros de domínio tipados;
2. queries agregadas server-only que retornam categorias, séries e indicador
   de suficiência;
3. componentes de gráfico que recebem dados prontos e não conhecem Supabase.

Não há biblioteca instalada. A Sprint 07 deve comparar uma biblioteca de
gráficos React acessível com SVG/CSS simples para os poucos formatos aprovados,
considerando bundle, responsividade, tooltip acessível e SSR. Sem dados
suficientes, renderizar texto/empty state — nunca eixos ou séries artificiais.

### Integração com o Recomendador

Criar futuramente um resumo histórico por perfume e contexto, obtido no
servidor. O motor recebe esse resumo como entrada opcional e aplica sinais
reais somente como critério secundário ou desempate. Quantidade de usos,
elogios, satisfação, sucesso contextual, desempenho percebido e recência podem
participar. Nível, reposição, preço e métricas de tamanho da coleção não
participam. Usuário sem usos mantém exatamente o comportamento editorial
atual.

## 9. Decisões que precisam ser preservadas

- Leitura, gerenciamento, recomendação, Diário e Análises têm limites claros.
- Dados privados são filtrados na aplicação e protegidos novamente por RLS.
- Componentes de tela não contêm regra de domínio nem agregação de banco.
- Queries retornam DTOs mínimos; imagens privadas usam URLs assinadas.
- Ações autenticam, validam, restringem ownership e revalidam consumidores.
- O Recomendador continua puro, determinístico e explicável.
- Histórico é sinal secundário; nível e reposição não alteram o ranking.
- Níveis são qualitativos e nunca viram ml ou porcentagem na interface.
- Gráficos só aparecem com dados reais suficientes.
- Filtros analíticos principais usam botões segmentados.
- Escrita ocorre somente no módulo responsável.
- A identidade usa os tokens, tipografia, superfícies e estados editoriais
  existentes, sem aparência de ERP.
- Nenhuma fase usa fixtures ou constantes como se fossem métricas reais.

## 10. Arquivos prováveis por sprint

Os caminhos abaixo orientam descoberta futura; não autorizam edição sem
inspeção.

| Sprint | Arquivos atuais prováveis | Novos limites prováveis |
| --- | --- | --- |
| 02 — Navegação e contratos globais | `src/config/navigation.ts`, `src/components/layout/*`, `src/components/layout/app-shell.test.tsx`, rotas sob `src/app/(app)` | contratos de rota/navegação, páginas vazias somente se exigidas pela sprint |
| 03 — Modelagem do Diário | `supabase/migrations/*`, `src/lib/auth/session.ts`, `src/lib/supabase/server.ts`, testes de queries/actions de perfume | `src/features/usage-log/{types,schema,queries,actions}.ts` e migration dedicada |
| 04 — Interface do Diário | `src/components/ui/*`, `src/components/collection/*`, estados globais | `src/app/(app)/diario/*`, `src/components/usage-log/*` |
| 05 — Níveis e reposição | tipos/schema/actions/queries de perfume, detalhe e edição, migrations | contrato e UI de nível/reposição no limite confirmado pela sprint |
| 06 — Modelagem das Análises | queries atuais, contratos do Diário, migrations e índices | `src/features/analytics/{types,queries}.ts` e testes |
| 07 — Interface de Análises | `workspace.module.css`, chips do Recomendador, `EmptyState` | `src/app/(app)/analises/page.tsx`, filtros e componentes de gráfico |
| 08 — Visão geral | Dashboard, `StatCard`, `EmptyState`, queries de perfume | queries/componentes de resumo e alertas |
| 09 — Recomendador | `src/features/recommender/*`, `recommender-view.tsx`, testes | adaptador/contrato opcional de sinais históricos |
| 10 — Polimento | CSS do shell, workspace, estante, Diário, Análises e Recomendador | ajustes focados de acessibilidade e responsividade |
| 11 — Validação final | testes Vitest, `tests/e2e/*`, migrations, scripts de `package.json` | cenários RLS cruzados e jornadas integradas |

## Dependências entre sprints

```text
01 -> 02
02 -> 03 -> 04
02 -> 05
02 -> 06 -> 07
03 + 05 + 06 + 07 -> 08
03 + 06 -> 09
04 + 05 + 07 + 08 + 09 -> 10 -> 11
```

Nenhuma sprint deve importar contrato, tabela, rota ou componente planejado
para uma dependência ainda não executada.

## Estratégia de testes observada

- Vitest + Testing Library para componentes, páginas, schemas, queries,
  actions e domínio;
- mocks de `requireUser()` e do cliente Supabase para provar filtros por
  `user_id`;
- testes puros do motor em `src/features/recommender/*.test.ts`;
- Playwright para shell autenticado, redirecionamento, responsividade e fluxos;
- testes de resiliência para loading, erro e 404.

As sprints de banco devem acrescentar testes de policy com dois usuários,
porque mocks unitários não provam RLS. As sprints de gráfico devem testar
filtros e estados sem depender de detalhes internos da biblioteca visual.

## Continuidade recomendada

A Sprint 02 pode começar somente depois de revisar este mapa. Ela deve limitar
seu trabalho à navegação e aos contratos globais previstos, sem criar tabelas
do Diário, níveis, análises ou integração histórica com o Recomendador.
