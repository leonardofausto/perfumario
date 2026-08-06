# Sprint 3 - Integracao das escolhas com o motor

Objetivo: adaptar o contrato do motor para consumir diretamente as novas escolhas multiplas do painel.

## Escopo

- Atualizar `RecommenderSelection` para representar selecoes multiplas por grupo.
- Centralizar o mapeamento das novas escolhas em configuracao propria.
- Ajustar o motor para considerar:
  - desempenho selecionado;
  - perfil sensorial selecionado;
  - estacoes selecionadas;
  - ocasioes selecionadas;
  - horarios selecionados;
  - ambientes selecionados.
- Manter clima e estacao ativa do contexto superior como criterio climatico separado.
- Remover mapeamentos aproximados de opcoes antigas quando deixarem de ser usadas.
- Manter redistribuicao proporcional de pesos quando dados estiverem ausentes.
- Manter zero como valor valido.
- Atualizar motivos e alertas para refletir criterios que realmente participaram do calculo.
- Manter desempates existentes, ajustando apenas se o novo contrato exigir.

## Fora do escopo

- Remodelar novamente a interface.
- Alterar contexto automatico/manual.
- Alterar banco de dados.
- Criar historico de recomendacoes.

## Validacao

- Testar selecoes multiplas influenciando o ranking.
- Testar criterios ausentes sem erro e sem favorecer perfumes mais preenchidos.
- Testar clima do contexto ainda participando separadamente.
- Testar que opcoes antigas removidas nao sao exigidas pelo motor.
- Testar motivos/alertas gerados a partir das novas contribuicoes.
- `npm.cmd test -- src/features/recommender/scoring.test.ts src/features/recommender/reasons.test.ts src/components/recommender/recommender-view.test.tsx`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

## Entrega esperada

- Motor consumindo o novo contrato de escolhas.
- Interface e ranking usando o mesmo formato de selecao.
- Motivos e alertas coerentes com as novas escolhas.
