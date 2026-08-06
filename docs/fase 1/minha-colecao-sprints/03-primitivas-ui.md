# Sprint 3 - Primitivas compartilhadas de UI

Objetivo: criar ou consolidar componentes pequenos usados na edicao e nos detalhes.

## Escopo

- Avaliar antes de criar novos componentes.
- Criar ou reutilizar, somente quando fizer sentido:
  - `PercentageField`;
  - `PercentageBar`;
  - `TagInput`;
  - `MetadataChip`;
  - `EmptyMetricState`;
  - headings ou field groups compativeis com o design atual.
- Centralizar opcoes de categoria, publico, relacao, limites percentuais, formatacao de `Nao informado` e helpers de percentuais.
- Garantir acessibilidade basica: labels, mensagens de erro, teclado, foco visivel e semantica de progressbar.

## Fora do escopo

- Reorganizar toda a tela de edicao.
- Alterar identidade visual ou fontes.
- Trocar o radar da pagina de detalhes.

## Validacao

- Testes unitarios ou de componente para:
  - zero como `0%`;
  - nulo como `Nao informado`;
  - validacao 0 a 100;
  - tags sem duplicidade;
  - remocao individual de tags;
  - progressbar acessivel.
- `npm.cmd test` focado.
- `npm.cmd run typecheck`.
- `graphify update .`.
