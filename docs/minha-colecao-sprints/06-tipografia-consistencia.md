# Sprint 6 - Auditoria tipografica e consistencia visual

Objetivo: padronizar pesos, tamanhos e estilos das telas de edicao e detalhes depois que a estrutura funcional estiver pronta.

## Escopo

- Auditar titulos, subtitulos, labels, textos auxiliares, chips, barras e valores percentuais.
- Verificar se titulos equivalentes usam componente ou classe equivalente.
- Evitar pesos excessivos, especialmente dentro das barras de acordes.
- Confirmar que a fonte atual suporta os pesos usados.
- Consolidar tokens ou classes tipograficas apenas onde houver beneficio real.
- Manter identidade visual atual.

## Fora do escopo

- Trocar fonte.
- Redesign generico.
- Alteracoes cosmeticas fora das telas de edicao e detalhes.
- Novos campos ou migracoes.

## Validacao

- Revisao visual nos principais breakpoints.
- Testes existentes.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
