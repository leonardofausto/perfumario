# Sprint 10 — Polimento visual e responsividade

## Objetivo

Uniformizar a Fase 3 e garantir uma experiência consistente entre módulos, resoluções e estados.

## Dependências

Executar após as Sprints 04, 05, 07, 08 e 09.

## Escopo

- Revisar tokens.
- Revisar tipografia.
- Revisar espaçamentos.
- Revisar ícones.
- Revisar botões segmentados.
- Revisar gráficos.
- Revisar cards.
- Revisar empty states.
- Revisar loading.
- Revisar error states.
- Revisar mobile.
- Revisar tablet.
- Revisar desktop.
- Revisar acessibilidade.
- Revisar desempenho visual.

## Diretrizes

- Minimalista.
- Editorial.
- Compacto.
- Sem excesso de negrito.
- Sem emojis.
- Sem cards externos desnecessários.
- Duas colunas quando houver benefício.
- Uma coluna no mobile.
- Títulos curtos.
- Subtítulos curtos.
- Sem quebras desnecessárias.
- Ícones Lucide.
- Cores com função semântica.
- Animações discretas.

## Componentes a uniformizar

- page header;
- section header;
- metric card;
- segmented control;
- chart container;
- empty state;
- alert item;
- ranking item;
- level bar;
- status badge;
- skeleton;
- modal;
- toast.

## Responsividade

Validar pelo menos:

- 320 px;
- 375 px;
- 768 px;
- 1024 px;
- 1440 px.

## Gráficos

- legendas legíveis;
- rótulos reduzidos no mobile;
- tooltips acessíveis;
- sem cortes;
- sem scroll horizontal;
- sem altura excessiva;
- sem cores indistinguíveis.

## Acessibilidade

- foco visível;
- navegação por teclado;
- contraste;
- `aria-pressed` nos botões segmentados;
- rótulos em gráficos;
- textos alternativos;
- `prefers-reduced-motion`;
- modais com foco controlado.

## Desempenho

- evitar dependências duplicadas;
- carregar gráficos sob demanda quando adequado;
- evitar re-renderização global;
- memoizar transformações pesadas somente quando necessário;
- não otimizar prematuramente;
- medir antes de alterar.

## Fora de escopo

- novas funcionalidades;
- novas métricas;
- nova migration;
- mudança de regras;
- redesign completo da identidade.

## Testes

- snapshots somente se úteis;
- visual e2e;
- teclado;
- mobile;
- redução de movimento;
- contraste;
- gráficos;
- modais;
- navegação.

## Critérios de aceite

- Módulos parecem parte do mesmo produto.
- Desktop e mobile funcionam.
- Sem scroll horizontal inesperado.
- Sem textos cortados indevidamente.
- Sem títulos quebrados sem necessidade.
- Sem excesso de cards.
- Controles possuem estados claros.
- Acessibilidade básica passa.
- Bundle não cresce sem justificativa.

## Validações

- testes de componente;
- Playwright em múltiplos viewports;
- lint;
- typecheck;
- build;
- análise de bundle quando necessário;
- `graphify update .`.
