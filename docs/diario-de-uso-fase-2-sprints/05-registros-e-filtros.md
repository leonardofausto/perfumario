# Sprint 5 — Registros e filtros

Objetivo: tornar a linha do tempo mais fluida, legível e eficiente para uso
recorrente.

## Escopo

- Levar a linha do tempo atual para a área `Registros`.
- Manter agrupamento por Hoje, Ontem, Esta semana e mês.
- Integrar período e busca em uma barra compacta.
- Preservar filtros na URL e atualização sem salto de rolagem.
- Adicionar ação clara para limpar filtros.
- Manter registrar, editar, excluir e ver fragrância.
- Exibir observação apenas quando houver conteúdo.
- Preservar paginação por cursor e os filtros ao carregar mais.
- Corrigir labels de ocasião usando a fonte compartilhada, sem `replace("_")`
  como apresentação final.

## Composição de cada registro

- imagem ou fallback;
- fragrância e marca;
- data e horário;
- ocasião;
- satisfação e elogios somente quando informados;
- observação opcional;
- menu de ações.

O registro é uma linha editorial adaptável, não um card alto.

## Fora do escopo

- Calendário mensal.
- Filtros avançados.
- Seleção em massa.
- Exportação.

## Validação

- Testar período, busca, limpeza e cursor.
- Testar edição e exclusão mantendo o contexto.
- Testar zero elogios sem destaque artificial.
- Testar snapshot de fragrância removida.
- Testar teclado, foco e mobile.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

