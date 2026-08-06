# Sprint 1 - Descoberta e decisões de arquitetura

Data da análise: 2 de agosto de 2026.

## Legenda de estado

- **Confirmado:** sustentado pelo código, migration, configuração, teste existente ou documentação oficial citada.
- **Proposto:** decisão para orientar as próximas sprints; ainda não implementada nem validada em execução.
- **Limitado:** falta chave, conta, teste regional, aceite jurídico ou evidência operacional.

## Diagnóstico curto

**Confirmado.** O cadastro e a edição usam o mesmo `PerfumeForm`. A rota de criação apenas renderiza o formulário vazio; a de edição carrega `getOwnPerfume(id)` e entrega o registro ao mesmo componente. O envio atual passa por Server Actions, valida com Zod, converte o formulário para payload RPC e persiste atomicamente no Supabase.

**Confirmado.** O contrato atual não consegue manter `bottleFormat` vazio: a UI assume `full_bottle`, o schema exige `decant | full_bottle`, o tipo é não nulo, a coluna é `not null` e os RPCs recebem `text`. Portanto, remover somente o default visual quebraria a validação antes de chegar ao banco.

**Confirmado.** A aplicação não possui dependência de IA, search API, cache distribuído, rate limiting de negócio ou observabilidade dedicada. O `OPENAI_API_KEY` comentado em `supabase/config.toml` pertence à configuração local do Studio e não prova integração da aplicação. Os únicos usos localizados de `cacheControl` são metadados de arquivos no Storage; as dependências transitivas com “cache” não constituem infraestrutura da aplicação.

**Proposto.** O desenho mínimo é um Route Handler autenticado que valida nome e marca, consulta providers desacoplados com timeouts, consolida evidências por URL, usa um modelo com saída estruturada, valida novamente o resultado e devolve somente uma prévia. O frontend nunca persiste nessa chamada. Cache e limites ficam no Supabase, aproveitando a única infraestrutura persistente já operada pelo projeto.

## Arquitetura atual e fluxo de dados

```text
/colecao/novo ───────────────────────┐
                                     ├─> PerfumeForm (Client Component)
/colecao/[id]/editar -> getOwnPerfume┘          │
                                                ├─ imagem -> Storage (fluxo separado)
                                                └─ FormData
                                                     │
                                     create/updatePerfumeAction
                                                     │
                                          perfumeFormSchema
                                                     │
                                          create/update_perfume RPC
                                                     │
                           perfumes + perfume_notes + perfume_scores
```

Evidências principais:

- `src/app/(app)/colecao/novo/page.tsx` renderiza `<PerfumeForm />`.
- `src/app/(app)/colecao/[id]/editar/page.tsx` chama `getOwnPerfume` e renderiza `<PerfumeForm perfume={perfume} />`.
- `src/components/collection/perfume-form.tsx` mantém estados locais, campos ocultos JSON e envia para `createPerfumeAction` ou `updatePerfumeAction`.
- `src/features/perfumes/actions.ts` autentica com `requireUser`, valida com `perfumeFormSchema` e chama os RPCs.
- `supabase/migrations/20260726150041_atomic_perfume_mutations.sql` concentra escrita do registro, notas e scores em transações RPC.
- `src/features/perfumes/queries.ts` lê o registro principal e, no detalhe, busca notas e scores em paralelo.
- `src/features/perfumes/image.ts` cuida da capa separadamente. Imagem não entra no autofill.

## Contrato de pesquisa e aplicação

Estas decisões são definitivas para as próximas sprints:

- **Confirmado por requisito:** a entrada exige `name` não vazio e aceita `brand` opcional.
- **Confirmado por requisito:** a resposta não possui `bottleFormat`, imagem, `imagePath`, `imageUrl` ou URL de imagem.
- **Confirmado por requisito:** `inspiredBy` contém somente o nome da fragrância de referência, sem marca, fabricante ou prefixo.
- **Confirmado por requisito:** o endpoint roda somente no backend e valida entrada e saída.
- **Confirmado por requisito:** a UI sempre mostra prévia; aplicar exige ação explícita e não salva.
- **Confirmado por requisito:** na edição, cada sobrescrita exige seleção explícita; no cadastro, ausências continuam vazias.
- **Proposto:** cada campo retornável terá `value`, `confidence`, `sourceUrls` e, quando necessário, `warning`. Ausência será representada por `null` ou lista vazia, nunca por texto inventado.
- **Proposto:** o resultado global terá `sources`, avisos e estado parcial por provider. Falha de uma fonte não invalida as demais.

## Matriz campo -> contrato -> persistência -> autofill

| Campo do formulário | Tipo/schema atual | Persistência atual | Representação proposta no autofill | Estado e observação |
|---|---|---|---|---|
| Marca (`brand`) | `string`; vazio vira `"Não informado"` | `perfumes.brand text not null` | `string | null` | Confirmado/proposto. Busca aceita marca opcional; retorno ausente continua vazio. |
| Nome (`name`) | `string`; vazio vira `"Não informado"` | `perfumes.name text not null` | `string | null` | Confirmado/proposto. A entrada de pesquisa exige nome, mas a evidência ainda pode corrigir sua grafia. |
| Descrição (`description`) | `string`; vazio vira `"Não informado"` | `description text not null default ''` | `string | null` | Confirmado/proposto. Texto deve ser síntese atribuível, não cópia longa. |
| Concentração | enum `unknown`, `body_splash`, `eau_de_cologne`, `eau_de_parfum`, `eau_de_toilette`, `perfume_oil`, `parfum` | `text not null`; migration original ainda inclui `other` | enum atual ou `null` | Confirmado. O autofill não cria enum novo; divergência histórica `other` fica fora do retorno. |
| Formato na estante (`bottleFormat`) | `decant | full_bottle`, obrigatório | `text not null`, check dos dois valores; RPC recebe `text` | **não existe no contrato** | Confirmado. Exclusão absoluta da pesquisa e prévia. |
| Relação (`inspirationKind`) | `original | dupe | inspiration` | `text not null default 'original'` com check | enum atual + confiança/fontes | Confirmado/proposto. Na dúvida, `original`, referência ausente e aviso. |
| Referência (`inspiredBy`) | `string | null`; schema atual transforma vazio de dupe/inspiration em `"Não informado"` | `text nullable`; constraint exige `null` para original e texto não vazio nos demais | `string | null` | Confirmado/proposto. Nunca usar `"Não informado"` no autofill; somente nome da fragrância. |
| Ano (`launchYear`) | inteiro `1800..2200` ou `null` | `integer` nullable com check `1800..2200` | `number | null` | Confirmado. |
| Categoria (`categoryType`) | `string | null`; opções UI `arabe`, `designer`, `importado`, `nacional`, `niche` | `text` nullable com check das mesmas chaves | chave atual ou `null` | Confirmado. |
| Público (`audience`) | `string | null`; UI `feminine`, `masculine`, `unisex` | `text` nullable com check das mesmas chaves | chave atual ou `null` | Confirmado. |
| Famílias olfativas | `string[]`; vazio vira `["Não informado"]` | `text[] not null`; constraint exige ao menos um item | `string[]` | Confirmado/proposto. Lista vazia significa não encontrado antes da aplicação. |
| Notas de saída/coração/fundo | `Record<top|heart|base,string[]>`; vazio vira `"Não informado"` por camada | linhas em `perfume_notes`; `layer`, `note`, `display_order` | arrays `top`, `heart`, `base` | Confirmado/proposto. Valores são nomes de notas; ordem é preservada. |
| Acordes principais | scores `category="accord"`, `metricKey=nome`, `score=0..100|null` | linhas em `perfume_scores` | `{ name, percentage|null }[]` | Confirmado/proposto. UI usa uma linha `nome: percentual`; percentual desconhecido continua `null`. |
| Desempenho | chaves `fixacao`, `projecao`, `rastro`, `versatilidade`, `presenca`; `0..100|null` | `perfume_scores` | mapa das mesmas chaves para `0..100|null` | Confirmado. Inferência deve ser sinalizada, pois raramente é ficha oficial. |
| Estações | `primavera`, `verao`, `outono`, `inverno`; `0..100|null` | `perfume_scores` | mesmas chaves | Confirmado. |
| Ocasiões | `ar_livre`, `casual`, `encontro`, `festa`, `formal`, `trabalho`; `0..100|null` | `perfume_scores` | mesmas chaves | Confirmado. O rótulo visível **Academia** mapeia para `ar_livre`; não criar `academia`. |
| Horários | `manha`, `tarde`, `noite`, `madrugada`; `0..100|null` | `perfume_scores` | mesmas chaves | Confirmado. O rótulo visível **Dia Inteiro** mapeia para `madrugada`; não criar `dia_inteiro`. |
| Ambiente | `ar_livre`, `fechado`; `0..100|null` | `perfume_scores` | mesmas chaves | Confirmado. Foi adicionado pela migration de remodel. |
| Intensidade, doçura, frescor, elegância, sensualidade | inteiros `0..100|null` | colunas nullable com checks `0..100` | mesmos campos `number | null` | Confirmado. |
| `profileTags` | `string[]` | `text[] not null default '{}'` | fora do mínimo recomendado | Confirmado/proposto. O formulário atual não mostra editor e envia lista vazia; pesquisar agora aumentaria ambiguidade sem benefício. |
| Fontes da descrição | não é campo editável do formulário | `description_source_urls text[] not null default '{}'` | URLs por campo + lista global | Confirmado/proposto. A persistência de proveniência é decisão de sprint posterior. |

## Decisão para `bottleFormat` vazio

**Confirmado.** Não é seguro tornar a coluna nullable nem mudar o tipo persistido: registros existentes e todo o fluxo de leitura assumem `BottleFormat`, e o requisito diz que apenas o novo cadastro deve começar sem escolha.

**Proposto.** A solução mínima é vazio somente no estado pré-submit:

1. adicionar uma opção placeholder `value=""` no novo cadastro e remover `?? "full_bottle"`;
2. manter o valor existente na edição;
3. separar o tipo de entrada bruta do formulário do tipo persistível, permitindo `""` apenas antes da validação;
4. manter `perfumeFormSchema`, RPC e coluna exigindo `decant | full_bottle`;
5. bloquear o submit e mostrar erro até a escolha manual;
6. manter o autofill completamente alheio ao campo.

Assim não há migration, backfill ou mudança nos registros existentes. A implementação pertence à sprint de UI correspondente, não a esta.

## Server Action versus Route Handler

**Confirmado pela documentação do Next.js.** Server Actions são voltadas a mutações e as chamadas do cliente são aguardadas uma por vez. Route Handlers oferecem um endpoint HTTP com `Request`/`Response`, conteúdo JSON, status explícitos e validação própria. Ambos exigem autenticação como superfícies públicas e ambos ficam sujeitos ao limite de duração da plataforma.

**Proposto.** Usar `POST /api/perfumes/autofill` em Route Handler Node.js:

- a operação é consulta/orquestração, não persistência;
- o cliente precisa de resposta JSON tipada, estados `400`, `401`, `429`, `502/504` e cancelamento;
- permite timeout por provider e trabalho paralelo;
- mantém segredo e conteúdo externo fora do bundle;
- `maxDuration` pode ser declarado no segmento, mas não substitui timeouts menores por chamada;
- nenhuma escrita em filesystem ou memória do processo será tratada como persistente.

## Provider de pesquisa

### Recomendação

**Proposto: Tavily Search como provider primário.** A API aceita consulta, filtros de domínio, limite de resultados, profundidade e retorno de URL/conteúdo; `basic` custa um crédito e `advanced`, dois. Em 2 de agosto de 2026, a documentação informa 1.000 créditos gratuitos/mês e pay-as-you-go de US$ 0,008 por crédito. A chave usa Bearer e deve ficar no backend.

Motivos:

- contrato orientado a busca para agentes, com trechos e URLs úteis para posterior consolidação;
- filtros por domínio permitem priorizar fonte oficial e bases especializadas;
- custo inicial pequeno e mensurável;
- API separada da etapa de IA, preservando a arquitetura multi-provider.

### Alternativas

| Provider | Vantagem | Limitação/risco | Estado |
|---|---|---|---|
| Brave Search API | Índice próprio, resultados web e contexto para LLM; preço oficial observado de US$ 5/1.000 requests com US$ 5 mensais em créditos | Política de armazenamento/redistribuição e qualidade para fragrâncias precisam de revisão e teste | Proposto como fallback, não funcional |
| Exa | Busca semântica e extração orientadas a IA | Preço, cobertura regional e termos não ficaram suficientemente comprovados nesta análise | Limitado; não escolher sem diligência adicional |
| Busca nativa do modelo | Menos integração inicial | Acopla busca e consolidação, reduz controle de fontes/custos e dificulta fallback independente | Alternativa de protótipo, não recomendada como contrato principal |
| Scraping direto de sites | Controle por fonte | Alto custo de manutenção e risco de `robots.txt`, termos, CAPTCHA e bloqueios | Não recomendado; somente páginas explicitamente permitidas |

**Limitado.** Nenhum provider foi chamado com chave real, portanto disponibilidade no Brasil, latência, qualidade para perfumes, termos aplicáveis ao caso e limites reais continuam pendentes. Isso deve ser comprovado antes de chamá-lo de funcional.

## Modelo e SDK de IA

**Proposto.** Usar o SDK oficial `openai` no backend, Responses API e saída estruturada validada pelo schema do domínio. Baseline: `gpt-5.6-terra`, por ser a opção oficial de equilíbrio entre inteligência e custo em 2 de agosto de 2026. `gpt-5.6-luna` deve ser avaliado como alternativa de menor custo; `gpt-5.6-sol`, apenas se os casos de referência mostrarem ganho de qualidade que justifique o preço.

O modelo não pesquisa por conta própria no desenho mínimo: recebe somente trechos, metadados e URLs já obtidos pelos providers. Isso facilita auditoria, troca de modelo, controle de custo e defesa contra prompt injection.

Alternativas:

- Anthropic com tool use/saída estruturada: alternativa de provider, exigindo novo SDK, chave, avaliação de schema e custo.
- Google Gemini: alternativa de custo/latência, também sujeita a avaliação própria de schema, região e tratamento de dados.
- Sem IA: regras determinísticas cobrem normalização simples, mas não consolidam bem fontes conflitantes nem atribuem relação com justificativa.

**Limitado.** Não há SDK nem `OPENAI_API_KEY` configurados na aplicação e nenhum modelo foi executado. Modelo, snapshot, esforço de raciocínio, preço e retenção precisam ser fixados após um conjunto de avaliação real. Não usar alias móvel em produção sem aceitar sua variação; preferir snapshot quando disponível e aprovado.

## Cache, limites e observabilidade

### Inventário real

- **Confirmado:** Supabase Postgres/Auth/Storage e Vercel são a infraestrutura operacional documentada.
- **Confirmado:** não existe Redis, Upstash, Vercel KV, tabela de cache, rate limit de negócio, Sentry, OpenTelemetry ou PostHog na aplicação.
- **Confirmado:** `[auth.rate_limit]` em `supabase/config.toml` é configuração do Auth local e não limita a futura pesquisa.
- **Confirmado:** logs estruturados e `instrumentation.ts` não foram localizados.

### Decisão mínima

**Proposto.** Persistir cache e contador de consumo no Supabase, em estruturas privadas e acessadas apenas pelo backend:

- chave normalizada e com hash de `name + brand + versionamento do contrato/providers`;
- cache do resultado validado, fontes, avisos, timestamps e expiração;
- TTL inicial proposto de 7 dias, a calibrar com uso real;
- limite por usuário autenticado e janela de tempo, aplicado atomicamente antes de chamadas pagas;
- teto global/circuit breaker para impedir gasto inesperado;
- não armazenar HTML bruto por padrão; conservar somente trechos mínimos, URLs e resultado derivado;
- limpeza por expiração em tarefa operacional posterior.

Supabase é preferido a cache em memória porque Route Handlers podem rodar em instâncias diferentes e memória não é compartilhada. Um produto dedicado como Upstash Redis só deve ser adicionado se medição demonstrar contenção ou latência inadequadas.

**Proposto.** Observabilidade mínima sem nova plataforma:

- `requestId` próprio;
- logs estruturados sem chaves, conteúdo integral de página ou dados pessoais desnecessários;
- provider, duração, status, cache hit/miss, créditos estimados e campos preenchidos;
- métricas agregadas de sucesso parcial, falha, latência, custo estimado e revisão humana;
- retenção definida antes de produção.

## Variáveis de ambiente previstas

Sem valores e sem prefixo `NEXT_PUBLIC_`:

```env
TAVILY_API_KEY=
OPENAI_API_KEY=
PERFUME_AUTOFILL_ENABLED=
PERFUME_AUTOFILL_MODEL=
PERFUME_AUTOFILL_CACHE_TTL_SECONDS=
PERFUME_AUTOFILL_RATE_LIMIT_MAX=
PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS=
PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS=
```

Variáveis opcionais somente se o fallback for aprovado:

```env
BRAVE_SEARCH_API_KEY=
PERFUME_AUTOFILL_SEARCH_PROVIDER=
```

**Proposto.** Defaults não secretos podem ficar em código versionado; chaves ficam nos cofres de Development, Preview e Production. O endpoint deve falhar fechado quando desabilitado ou sem configuração obrigatória.

## Arquivos prováveis das próximas sprints

Esta lista é previsão, não autorização para criá-los agora:

| Ação provável | Arquivo | Responsabilidade |
|---|---|---|
| Criar | `src/features/perfume-autofill/constants.ts` | limites e enumerações específicas do autofill |
| Criar | `src/features/perfume-autofill/types.ts` | contratos de entrada, evidência, confiança, prévia e falhas |
| Criar | `src/features/perfume-autofill/schema.ts` | validação Zod de entrada e saída |
| Criar | `src/features/perfume-autofill/normalize.ts` | normalização determinística |
| Criar | `src/features/perfume-autofill/providers/types.ts` | interface desacoplada de busca |
| Criar | `src/features/perfume-autofill/providers/tavily.ts` | adapter Tavily |
| Criar | `src/features/perfume-autofill/providers/brave.ts` | fallback opcional |
| Criar | `src/features/perfume-autofill/consolidate.ts` | consolidação por IA e validação de evidências |
| Criar | `src/features/perfume-autofill/service.ts` | orquestração, timeout e falha parcial |
| Criar | `src/features/perfume-autofill/cache.ts` | cache e limites no backend |
| Criar | `src/app/api/perfumes/autofill/route.ts` | autenticação, HTTP e validação de fronteira |
| Criar | testes `*.test.ts` adjacentes | domínio, providers, consolidação, cache e endpoint |
| Criar | migrations futuras em `supabase/migrations/` | cache/rate limit privados e funções atômicas |
| Criar | `src/components/collection/perfume-autofill-preview.tsx` | pesquisa, seleção e prévia compartilhada |
| Alterar | `src/components/collection/perfume-form.tsx` | integração manual no cadastro/edição e correção do default |
| Alterar | `src/components/collection/perfume-form.test.tsx` | vazio manual, prévia, aplicação seletiva e ausência de autosave |
| Alterar | `src/features/perfumes/schema.ts`/`types.ts` | separar estado pré-submit de registro persistível |
| Alterar | `.env.example` e `docs/operations/deployment.md` | configuração sem segredos e operação |

## Riscos

### Legais e de conformidade

- Termos, `robots.txt`, licenças e permissões podem impedir coleta ou armazenamento de conteúdo de certas fontes.
- Trechos e descrições podem ter direitos autorais; guardar somente o necessário e produzir síntese atribuída.
- Não contornar CAPTCHA, autenticação ou bloqueios.
- Conteúdo externo é não confiável e nunca pode instruir o sistema.
- Revisar DPA, retenção, região de processamento e LGPD antes de enviar consultas/conteúdo a terceiros.

### Técnicos e de segurança

- Uma única requisição pode exceder o limite da plataforma; usar concorrência limitada, timeout e resultado parcial.
- Prompt injection, páginas maliciosas e conteúdo truncado podem contaminar a consolidação.
- Mesma fragrância pode ter flankers, concentrações e anos diferentes; nome/marca não garantem identidade.
- Rate limit não atômico permite estouro concorrente.
- Chaves expostas por `NEXT_PUBLIC_`, logs ou mensagens de erro causariam incidente.
- Aliases de modelo e respostas de busca podem mudar sem alteração no código.

### Financeiros

- Busca avançada, extração, retries e modelo multiplicam custo por consulta.
- Fallback sem teto pode chamar vários providers pagos.
- Câmbio e mudanças de preço exigem orçamento e circuit breaker.

### Qualidade

- Fontes comunitárias podem divergir de fontes oficiais.
- Percentuais de acordes e uso raramente são fatos objetivos.
- Relação inspiration/dupe exige evidência explícita; similaridade isolada não basta.
- “Não encontrado” deve permanecer ausência, não ser completado por plausibilidade.
- O caso Fakhar Black deve resultar em `inspiration` e `Y Eau de Parfum`, nunca `Yves Saint Laurent Y Eau de Parfum`, quando a relação for confirmada.

## Quando uma fonte/provider pode ser chamado de funcional

Uma fonte individual é funcional somente quando:

1. seus termos e `robots.txt` permitem o modo de acesso e uso pretendido;
2. não exige burlar CAPTCHA, login ou bloqueio;
3. retorna URL canônica e conteúdo atribuível para casos reais;
4. distingue fragrância, flanker e concentração;
5. funciona a partir da região de produção;
6. tem timeout, falha e limite documentados;
7. passa casos de sucesso, ausência, conflito, bloqueio e conteúdo malicioso;
8. o resultado preserva proveniência e não inventa campos.

Um provider é funcional somente após, adicionalmente:

1. conta e chave válidas em ambiente não público;
2. chamada real bem-sucedida a partir do backend;
3. custo, quota e rate limit observados;
4. latência compatível com o limite da função;
5. política de retenção e tratamento de dados aceita;
6. monitoramento de consumo e desligamento configurados;
7. evidência registrada em teste de integração.

**Estado atual:** nenhum provider, fonte ou modelo satisfaz todos esses critérios; todos permanecem propostos ou limitados.

## Fontes consultadas

### Contratos locais

- `package.json`, `.env.example`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- `src/components/collection/perfume-form.tsx` e `perfume-form.test.tsx`
- `src/features/perfumes/constants.ts`, `schema.ts`, `schema.test.ts`, `types.ts`, `actions.ts`, `actions.test.ts`, `queries.ts`
- `src/app/(app)/colecao/novo/page.tsx` e `src/app/(app)/colecao/[id]/editar/page.tsx`
- `src/lib/env.ts`, `src/lib/supabase/server.ts`
- `supabase/config.toml`
- `supabase/migrations/20260726145232_persistent_perfume_collection.sql`
- `supabase/migrations/20260726150041_atomic_perfume_mutations.sql`
- `supabase/migrations/20260728133947_add_perfume_remodel_contract_fields.sql`
- `README.md` e `docs/operations/deployment.md`

### Documentação oficial, consultada em 2 de agosto de 2026

- [Next.js - Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js - Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Next.js - Route Segment Config](https://nextjs.org/docs/15/app/api-reference/file-conventions/route-segment-config)
- [Tavily Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search)
- [Tavily - créditos e preços](https://docs.tavily.com/documentation/api-credits)
- [Tavily - Terms of Service](https://www.tavily.com/terms)
- [Brave Search API - preços](https://api-dashboard.search.brave.com/documentation/pricing)
- [OpenAI - modelos](https://developers.openai.com/api/docs/models)
- [OpenAI - orientação de modelos](https://developers.openai.com/api/docs/guides/latest-model)
- [Supabase - exemplo de rate limiting](https://supabase.com/docs/guides/functions/examples/rate-limiting)

## Resultado da validação documental

- Cada descoberta material está ligada a código, migration, configuração, teste existente ou documentação oficial.
- Fatos externos estão datados e não são apresentados como testes de integração.
- Itens sem chave, chamada real, teste regional ou aceite jurídico estão marcados como **Limitado**.
- As decisões obrigatórias da sprint estão explícitas.
- Não foram criados código, migration, dependência, chave, endpoint, provider ou UI.
- Não foram alterados documentos das sprints seguintes.
