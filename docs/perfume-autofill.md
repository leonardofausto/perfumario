# Pesquisa e autopreenchimento de fragrâncias

Estado verificado em **2 de agosto de 2026**.

## Arquitetura e fluxo

1. `PerfumeForm` fornece nome e marca ao componente cliente `PerfumeAutofill`.
2. O componente envia `POST /api/perfumes/autofill`; nenhuma chave privilegiada chega ao navegador.
3. O Route Handler autentica, valida tamanho/conteúdo, aplica limite e chama o runtime server-only.
4. O runtime consulta providers desacoplados, consolida evidências com saída estruturada e valida o resultado.
5. Cache, rate limit, timeout e cancelamento são aplicados antes da resposta controlada.
6. A UI mostra proveniência, confiança, inferências, conflitos, ausências, fontes e avisos.
7. No cadastro, campos presentes são aplicados apenas após `Aplicar ao cadastro`.
8. Na edição, somente diferenças selecionadas são aplicadas. O salvamento continua exclusivamente no botão normal do formulário.

Imagem e `bottleFormat` não fazem parte da consulta, resposta, prévia ou aplicação.

## Providers e fontes

O runtime possui integração Tavily para pesquisa e OpenAI para consolidação. A política atual prioriza fonte oficial e aceita bases especializadas configuradas no runtime.

Na verificação de 2 de agosto de 2026:

- os providers, cancelamento e falhas parciais foram verificados com doubles locais determinísticos;
- o Route Handler e a consolidação foram verificados com testes automatizados;
- `PERFUME_AUTOFILL_ENABLED` estava desabilitado;
- `TAVILY_API_KEY` e `OPENAI_API_KEY` não estavam configuradas localmente;
- nenhuma chamada real Tavily/OpenAI foi executada;
- nenhuma disponibilidade geral, cobertura regional ou conformidade permanente de fonte é afirmada.

Providers dependem de conta, chave, disponibilidade, termos e limites externos. CAPTCHA, autenticação, bloqueios, `robots.txt` e termos nunca devem ser contornados.

## Variáveis de ambiente

Somente nomes, sem valores:

- `PERFUME_AUTOFILL_ENABLED`
- `TAVILY_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_SECRET_KEY`
- `PERFUME_AUTOFILL_MODEL`
- `PERFUME_AUTOFILL_CACHE_TTL_SECONDS`
- `PERFUME_AUTOFILL_RATE_LIMIT_MAX`
- `PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS`
- `PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS`
- `PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS`
- `PERFUME_AUTOFILL_MAX_RESULTS`
- `PERFUME_AUTOFILL_MAX_CONTENT_CHARS`

Consulte `.env.example`. As três credenciais são obrigatórias quando a funcionalidade é habilitada.

## Limites operacionais

- Cache: chave normalizada e versionada por usuário; somente respostas válidas são armazenadas.
- TTL padrão: 604.800 segundos.
- Rate limit padrão: 10 pesquisas por usuário em janela de 3.600 segundos.
- Timeout por provider: 8.000 ms.
- Timeout global: 25.000 ms, com `AbortSignal` propagado.
- Resultados por provider: no máximo 6.
- Conteúdo enviado por evidência: no máximo 4.000 caracteres.
- Corpo HTTP: no máximo 2.048 bytes.
- Cache inválido/expirado é ignorado; erros não são armazenados.

Os valores são configuráveis dentro dos intervalos validados em `src/lib/env.ts`.

## Execução local

1. Copie os nomes necessários de `.env.example` para `.env.local`.
2. Inicie Supabase local e aplique migrations quando Docker estiver disponível.
3. Configure as três credenciais server-only e habilite explicitamente o recurso.
4. Execute `npm.cmd run dev`.
5. Entre com um usuário autorizado e abra `/colecao/novo` ou uma edição.

Comandos de teste:

```text
npm.cmd test -- src/components/collection/perfume-autofill.test.tsx src/components/collection/perfume-form.test.tsx
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
graphify update .
git status --short
```

## Adicionar um provider

1. Implemente a interface de provider em `src/features/perfume-autofill/providers/types.ts`.
2. Normalize URL, tamanho e conteúdo antes de produzir `WebEvidence`.
3. Classifique a fonte com a política existente.
4. Registre o provider somente no runtime server-only.
5. Adicione testes de sucesso, falha, timeout, cancelamento e conteúdo não confiável.

O provider não importa UI, formulário, OpenAI ou persistência. A consolidação recebe apenas evidências normalizadas; a UI recebe apenas `AutofillResponse`.

## Matriz dos 40 cenários

| # | Cenário | Cobertura |
|---:|---|---|
| 1 | Consulta somente por nome | `perfume-autofill.test.tsx` |
| 2 | Consulta por marca e nome | `perfume-autofill.test.tsx` |
| 3 | Nome obrigatório | painel desabilita ação e teste de schema/rota |
| 4 | Estado inicial | `perfume-autofill.test.tsx` |
| 5 | Estado pesquisando | `perfume-autofill.test.tsx` |
| 6 | Estado consultando fontes | `perfume-autofill.test.tsx` |
| 7 | Estado consolidando | `perfume-autofill.test.tsx` |
| 8 | Resultado de sucesso | `perfume-autofill.test.tsx` |
| 9 | Resultado parcial | `perfume-autofill.test.tsx` |
| 10 | Não encontrado | `perfume-autofill.test.tsx` e rota |
| 11 | Rate limit | `perfume-autofill.test.tsx`, service e rota |
| 12 | Timeout | painel, service, providers e rota |
| 13 | Erro interno controlado | painel, service e rota |
| 14 | Cancelamento e `AbortSignal` | painel, web-search e consolidação |
| 15 | Confiança geral e por campo | `perfume-autofill.test.tsx` |
| 16 | Contagem de fontes | `perfume-autofill.test.tsx` |
| 17 | Encontrados, inferidos, divergentes e ausentes | `perfume-autofill.test.tsx` |
| 18 | Fontes e avisos revisáveis | `perfume-autofill.test.tsx` |
| 19 | Aplicação explícita no cadastro | `perfume-form.test.tsx` e E2E |
| 20 | Campos ausentes não são aplicados | seleção filtra valores nulos e testes do painel |
| 21 | Edição manual após aplicação | `perfume-form.test.tsx` |
| 22 | Ausência de autosave | mocks de actions no `perfume-form.test.tsx` |
| 23 | Imagem intacta no cadastro | `perfume-form.test.tsx` |
| 24 | Formato vazio no cadastro | `perfume-form.test.tsx` e E2E |
| 25 | Formato intacto depois da aplicação | `perfume-form.test.tsx` e E2E |
| 26 | Original limpa referência | `perfume-form.test.tsx` |
| 27 | Original desabilita referência | `perfume-form.test.tsx` |
| 28 | Inspiração aplica somente nome de referência | `perfume-form.test.tsx` |
| 29 | Dupe aplica somente nome de referência | schema/consolidação e unidade relação-referência |
| 30 | Fakhar Black usa `Y Eau de Parfum` | painel, formulário e E2E |
| 31 | Pesquisa no modo edição | `perfume-form.test.tsx` |
| 32 | Valores de edição preservados por padrão | painel, formulário e E2E |
| 33 | Seleção individual | painel e formulário |
| 34 | Selecionar tudo | `perfume-autofill.test.tsx` |
| 35 | Desmarcar tudo | `perfume-autofill.test.tsx` |
| 36 | Comparação de texto, enum e número | lista tipada do painel e teste do painel |
| 37 | Comparação de notas e acordes | lista tipada do painel e teste do formulário |
| 38 | Comparação de grupos de scores | lista tipada do painel e testes de métricas |
| 39 | Imagem e formato ausentes na seleção | `perfume-autofill.test.tsx` |
| 40 | Teclado e mobile sem overflow | controles nativos, foco visível e E2E responsivo |

## Limitações conhecidas

- A verificação real depende de chaves, conta, termos e disponibilidade dos providers.
- O E2E autenticado depende de `E2E_USER_EMAIL` e `E2E_USER_PASSWORD`; o cenário de edição também exige `E2E_PERFUME_ID`.
- Supabase local depende do Docker para aplicar e testar a migration.
- Dados externos podem divergir ou faltar; a UI mantém conflitos e inferências revisáveis.
- Uma amostra real bem-sucedida não garante disponibilidade futura nem correção de todo o catálogo.

## Resultados de validação

Executados em 2 de agosto de 2026:

| Comando | Resultado real |
|---|---|
| testes focados das áreas alteradas | código 0; 10 arquivos e 75 testes aprovados |
| `npm.cmd run lint` | código 0; nenhum erro ou aviso |
| `npm.cmd run typecheck` | código 0; `next typegen` e `tsc --noEmit` aprovados |
| `npm.cmd test` | código 0; suíte Vitest completa aprovada |
| `npm.cmd run build` | código 0; Next.js 16.2.11 compilou, tipou e gerou 15 páginas |
| `npm.cmd run test:e2e` | código 0; 2 testes públicos aprovados e 3 autenticados ignorados por falta de credenciais |
| `npx.cmd supabase status` | código 1; Docker Engine indisponível, portanto a migration não foi aplicada/testada localmente |

A verificação visual pública cobriu 320, 375, 768, 1024 e 1440 px no Playwright existente. A verificação visual privada do autofill ficou limitada ao teste de componentes/CSS e ao E2E escrito, porque não havia credenciais E2E configuradas.
