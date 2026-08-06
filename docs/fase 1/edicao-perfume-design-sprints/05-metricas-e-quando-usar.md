# Sprint 5 - Metricas e quando usar

Objetivo: transformar Desempenho e Quando usar em blocos compactos, comparaveis e faceis de editar, sem perder os percentuais atuais.

## Escopo

- Redesenhar Desempenho como um grupo de metricas de presenca:
  - fixacao;
  - projecao;
  - rastro;
  - versatilidade;
  - presenca.
- Redesenhar Quando usar como grupos consistentes:
  - clima e estacoes;
  - ocasioes;
  - horarios.
- Usar o mesmo padrao visual para cada metrica: label, input numerico e leitura visual opcional.
- Melhorar a legibilidade de percentuais com `font-variant-numeric: tabular-nums`.
- Manter vazio, zero e 100 como estados distintos.
- Reduzir a sensacao de "caixas soltas" com agrupamento e grid responsivo.
- Evitar cards dentro de cards; usar paineis ou subgrupos simples.
- Garantir que inputs numericos tenham `type`, `name`, `inputmode` quando aplicavel e foco visivel.

## Fora do escopo

- Alterar pesos de recomendacao.
- Criar graficos complexos.
- Mudar nomes de metricas sem decisao explicita.
- Mexer em notas, acordes ou imagem.

## Validacao

- Testes de campos percentuais aceitando vazio e valores entre 0 e 100.
- Testes para preservar zero como valor real.
- Verificacao visual de todos os grupos preenchidos, parcialmente vazios e vazios.
- Verificacao responsiva em mobile estreito.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
