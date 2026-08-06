# Sprint 2 - Nova interface dos ajustes

Objetivo: substituir visualmente o painel `Qual e o plano?` por uma nova experiencia de escolhas baseada nos grupos reais.

## Escopo

- Manter o card esquerdo `Ajustes da escolha`.
- Remodelar o conteudo interno do card com os grupos:
  - Desempenho;
  - Perfil sensorial;
  - Estacoes;
  - Ocasioes;
  - Melhor horario;
  - Ambiente.
- Usar selecao multipla dentro dos grupos.
- Remover da interface as opcoes antigas sem contrato real confirmado.
- Nao exibir filtro de clima neste painel.
- Preservar o botao `Revelar meu Top 3`.
- Preservar o comportamento de resultado desatualizado quando escolhas mudarem apos o ranking.
- Usar icones monocromaticos da biblioteca ja utilizada no projeto.
- Usar componentes/estilos locais do Recomendador sempre que possivel.
- Manter responsividade em desktop e mobile.

## Direcao visual

- A interface deve parecer uma area de prioridades do momento.
- Evitar excesso de chips soltos em muitas linhas sem hierarquia.
- Preferir blocos compactos por grupo, com titulo claro e opcoes escaneaveis.
- Opcoes selecionadas devem ter estado visual claro.
- O layout deve permitir varias escolhas sem aumentar excessivamente a altura do card.

## Fora do escopo

- Alterar formula de pontuacao.
- Alterar contexto automatico/manual.
- Alterar cards superiores de clima.
- Alterar cards do Top 3.
- Criar novas metricas no banco.

## Validacao

- Testar renderizacao dos seis grupos.
- Testar selecao e remocao de multiplas opcoes no mesmo grupo.
- Testar que `Passeio`, `Fim de tarde` e filtro de clima nao aparecem neste painel.
- Testar que alterar uma escolha depois do Top 3 revelado marca o ranking como desatualizado.
- `npm.cmd test -- src/components/recommender/recommender-view.test.tsx`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

## Entrega esperada

- Painel `Qual e o plano?` visualmente remodelado.
- Testes de componente cobrindo a nova estrutura.
- Sem alteracao no resultado numerico do ranking nesta sprint.
