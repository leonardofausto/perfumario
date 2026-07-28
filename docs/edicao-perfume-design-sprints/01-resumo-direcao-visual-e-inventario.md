# Sprint 1 - Resumo de direcao visual e inventario

Data: 2026-07-28

## Fontes revisadas

- Graphify: `graphify query "tela edicao perfume form fields save action CSS tests data contract" --budget 4000`.
- Tela e rotas: `src/components/collection/perfume-form.tsx`, `src/app/(app)/colecao/novo/page.tsx`, `src/app/(app)/colecao/[id]/editar/page.tsx`.
- Estilos e primitivas: `src/components/collection/form.module.css`, `src/components/collection/ui-primitives.tsx`, `src/components/collection/ui-primitives.module.css`, `src/app/globals.css`.
- Contratos: `src/features/perfumes/actions.ts`, `src/features/perfumes/schema.ts`, `src/features/perfumes/types.ts`, `src/features/perfumes/constants.ts`, `src/features/perfumes/queries.ts`.
- Teste focado: `src/components/collection/perfume-form.test.tsx`.
- Web Interface Guidelines atualizadas em 2026-07-28 a partir da fonte indicada pela skill `web-design-guidelines`.

## Evidencia visual disponivel

Nao foram encontradas capturas locais da tela de edicao em `docs` ou `src`, nem imagens nomeadas como captura, screenshot, edicao, perfume ou colecao fora de `public/images/login-perfumes.png` e `public/images/perfumes/`.

Assim, este inventario usa como evidencia visual o estado real do componente e CSS existentes. Qualquer decisao abaixo evita supor conteudo visual que nao esteja no codigo.

## Inventario dos topicos atuais

- Imagem, revisao e acoes: preview com `next/image`, fallback por inicial, upload opcional com JPG, PNG, AVIF e WebP, explicacao de preservacao da imagem atual.
- Identidade e apresentacao: marca, nome, concentracao, formato na estante, relacao com outra fragrancia e perfume de referencia condicional.
- Descricao e classificacao: ano de lancamento, categoria, publico, familias olfativas em tags e explicativo do perfume.
- Composicao olfativa: notas de saida, coracao e fundo, acordes principais em textarea, preview simples de acordes e hidden inputs `notes` e `scores`.
- Desempenho: fixacao, projecao, rastro, versatilidade e presenca como percentuais.
- Quando usar: clima e estacoes, ocasioes e horarios como grupos percentuais.
- Perfil sensorial: intensidade, docura, frescor, elegancia, sensualidade e tags de perfil.
- Cancelar e salvar: rodape sticky com link de cancelar e botao de submit com estado pendente.

Todos os topicos exigidos pelo README da colecao de sprints continuam contemplados no plano. Nenhum campo deve ser removido em sprints futuras.

## Contratos reais a preservar

- `PerfumeForm` atende criacao e edicao; recebe `perfume?: PerfumeDetail` e alterna entre `createPerfumeAction` e `updatePerfumeAction`.
- `inspiredBy` tem campo visivel apenas quando `inspirationKind !== "original"`; quando original, um hidden input envia valor vazio.
- `notes`, `scores`, `olfactoryFamilies` e `profileTags` sao persistidos por hidden inputs JSON.
- Percentuais aceitam `0` como valor real e string vazia como `null`; essa diferenca nao pode ser mascarada visualmente.
- `schema.ts` converte campos textuais vazios para `Nao informado` quando o contrato atual exige fallback, sem inventar familias, notas, descricao ou metricas editoriais.
- `queries.ts` tem fallback para registros antigos sem colunas do remodel; a UI deve continuar funcionando com valores `null` e arrays vazios.
- Upload de imagem aceita `image/jpeg,image/png,image/avif,image/webp` e tamanho maximo de 5 MB no schema.
- O submit depende de `useActionState`; mensagens de formulario usam `role="status"` e erros de campo vem de `state.fieldErrors`.

## Riscos de regressao

- Campos controlados: `inspirationKind`, `inspiredBy`, `notes`, `scores`, `accords`, `sensoryValues`, `families` e `profileTags` podem perder digitacao se forem recriados sem preservar estado.
- Hidden inputs: qualquer redesign deve manter `name="notes"`, `name="scores"`, `name="olfactoryFamilies"` e `name="profileTags"` com JSON valido antes do submit.
- Valor zero: barras, inputs e estados vazios devem diferenciar `0%` de `Nao informado`.
- Action state: o botao deve exibir salvamento apenas durante `pending`; erros inline precisam continuar ligados aos campos reais.
- Layout sticky: o rodape de acoes usa safe area; mudancas precisam manter cancelamento e salvamento acessiveis em mobile.
- Acessibilidade: icon-only buttons precisam de `aria-label`; imagens precisam de `alt`; foco visivel nao pode depender de `outline: none` sem reposicao.
- Conteudo longo: nomes de perfume, marcas, tags e acordes precisam usar `min-width: 0`, quebra ou truncamento controlado para evitar sobreposicao.

## Direcao visual

Conceito: bancada de edicao olfativa. A tela deve parecer uma ficha tecnica de curadoria, com leitura rapida, hierarquia consistente e materiais discretos: papel tecnico claro, superficies brancas quentes, tinta grafite, verde profundo, cobre de marcacao e contraste frio em azul-petroleo/oliva.

Assinatura visual: trilho de camadas da ficha. Em vez de um wizard, cada secao deve ter um marcador persistente de camada que orienta o olhar pela ficha tecnica. A ordem ajuda a escanear, mas nao bloqueia navegacao nem edicao.

Risco estetico escolhido: usar marcadores de camada inspirados em fitas de amostra ou tiras de blotter, com cobre discreto e linhas tecnicas. Isso e especifico ao universo da perfumaria e deve substituir numeracao decorativa generica quando a UI for redesenhada.

## Tokens visuais propostos

- `--edit-ink`: `#24211d`, texto principal grafite quente.
- `--edit-muted`: `#6c645a`, texto secundario.
- `--edit-paper`: `#fffdf9`, superficie principal.
- `--edit-canvas`: `#f7f3ec`, fundo neutro claro.
- `--edit-line`: `#ddd4c8`, bordas.
- `--edit-line-strong`: `#c8baaa`, divisores e estados ativos sutis.
- `--edit-green`: `#1e513b`, acao primaria e barras confirmadas.
- `--edit-green-deep`: `#163f2e`, hover/active da acao primaria.
- `--edit-copper`: `#9a6b3f`, marcadores de camada e detalhes de status.
- `--edit-petrol`: `#285861`, contraste secundario para grupos informativos.
- `--edit-danger`: `#9b3030`, erro inline.
- `--edit-focus`: `rgba(30, 81, 59, 0.16)`, halo de foco.

## Tipografia e densidade

- Display: manter `var(--font-display)` apenas em `h1`, titulos principais de secao e momentos editoriais curtos.
- Corpo: manter `var(--font-body)` para labels, campos, descricoes, chips e botoes.
- Dados numericos: usar a fonte de corpo com `font-variant-numeric: tabular-nums` em percentuais, barras e medidores.
- Titulos internos: evitar escala hero dentro de paineis; secoes devem usar titulos compactos e consistentes.
- Densidade: desktop deve usar grid de trabalho com blocos relacionados proximos; mobile vira sequencia de paineis sem scroll horizontal.

## Espacamento, raio, borda e sombra

- Grid da pagina: largura maxima atual pode crescer com cautela, mas os blocos devem preservar `minmax(0, 1fr)` para textos longos.
- Espacamento base: 8 px para microgap, 12 px para campos relacionados, 16 px para grupos, 24 px para secoes.
- Raio: 8 px em inputs, chips e botoes; 10-12 px em paineis tecnicos; evitar cards arredondados grandes.
- Bordas: 1 px solido para paineis e campos; dashed apenas para upload.
- Sombra: usar somente no rodape sticky ou em elevacao funcional, baixa e difusa.

## Padrao de secoes

Cada secao deve seguir a mesma estrutura semantica e visual:

1. Marcador de camada: numero ou codigo curto da ficha, visualmente discreto.
2. Titulo: nome do topico com hierarquia real.
3. Descricao: uma frase curta sobre o que a pessoa edita ali.
4. Status opcional: usado apenas quando houver estado real, como imagem mantida, erro, incompleto ou salvando.
5. Corpo: campos, chips, barras ou previews, sempre com labels e dimensoes estaveis.

Se a secao for um grupo de campos, `fieldset` e `legend` devem continuar sendo preferidos quando houver agrupamento semantico.

## Estados interativos

- Foco: `:focus-visible` em links, botoes, inputs, selects e controles de chip; nunca remover outline sem reposicao.
- Hover: botoes e links devem ter contraste mais forte que repouso.
- Pending: botao principal com texto `Salvando...` ou forma equivalente, sem bloquear antes do request iniciar.
- Erros: inline junto ao campo, com `aria-invalid` e `aria-describedby` quando aplicavel.
- Upload: manter copia clara de preservacao da imagem atual e formatos permitidos.
- Chips: remover tag com botao real, icone decorativo `aria-hidden` e `aria-label` especifico.

## Checklist de Web Interface Guidelines para as proximas sprints

- Controles de formulario com label ou `aria-label`, `name` significativo e tipos corretos.
- Inputs numericos com `type="number"`, limites 0-100 quando percentual e leitura tabular.
- Placeholders, quando existirem, devem usar exemplos reais de formato e terminar com reticencias tipograficas se o projeto passar a usar Unicode.
- Imagens com `alt`; imagem acima da dobra deve ter tamanho/estrategia clara para evitar instabilidade visual.
- Estados assincronos com `role="status"` ou `aria-live="polite"`.
- Links para navegacao e botoes para acoes.
- Conteudo longo com quebra/truncamento intencional e `min-width: 0` em filhos flex/grid.
- Sem `transition: all`; animacoes apenas em `transform` e `opacity`, respeitando movimento reduzido se forem adicionadas.
- Safe area preservada no rodape sticky.

## Validacao da Sprint 1

- Todos os topicos atuais da ficha foram inventariados e preservados neste resumo.
- A direcao visual depende apenas de campos reais ja presentes no contrato; nao ha familias, notas, metricas ou textos editoriais inventados.
- As decisoes seguem a skill `frontend-design`: direcao especifica para curadoria olfativa, tokens deliberados, tipografia contida e uma assinatura visual unica.
- As decisoes seguem `web-design-guidelines`: labels, foco visivel, semantica de formulario, estados de erro/salvamento, imagens, conteudo longo e mobile sem scroll horizontal foram explicitamente considerados.
- Nao foram alterados codigo, banco, tipos ou schema nesta sprint.
