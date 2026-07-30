# Sprint 3 - Integracao com contexto ativo e ranking real

Objetivo: conectar o motor ao botao `Revelar meu Top 3`, usando apenas a estante real e o contexto ativo.

## Escopo

- Garantir que o Recomendador recebe perfumes com os scores necessarios, conforme decisao da Sprint 1.
- Criar estado de ranking calculado separado dos filtros.
- Ao clicar em `Revelar meu Top 3`:
  - validar se ha perfumes disponiveis;
  - obter contexto ativo;
  - calcular pontuacao de todos os perfumes;
  - ordenar por compatibilidade e desempates;
  - exibir ate tres resultados.
- Manter o modo manual independente:
  - expandir a secao nao ativa manual;
  - preencher campos nao ativa manual;
  - somente `Usar contexto manual` ativa manual.
- Quando o modo automatico estiver ativo mas ainda sem consulta bem-sucedida, orientar o usuario a ativar/atualizar contexto ou usar manual.
- Ao alterar qualquer filtro depois de gerar o ranking, marcar o resultado como desatualizado ou exigir novo clique para recalcular.

## Fora do escopo

- Melhorar visual final dos cards.
- Criar textos ricos de motivos e alertas.
- Alterar regras de pontuacao alem do necessario para integrar.
- Recarregar a pagina inteira.

## Validacao

- Testar estante vazia.
- Testar estante com um perfume.
- Testar estante com dois perfumes.
- Testar estante com tres ou mais perfumes.
- Testar que somente `perfumes` recebidos pela pagina entram no ranking.
- Testar que manual ativo substitui automatico no calculo.
- Testar que automatico bem-sucedido volta a ser o modo ativo sem alterar campos manuais.
- `npm.cmd test -- src/components/recommender/recommender-view.test.tsx`.
- `npm.cmd test -- src/features/recommender/scoring.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
