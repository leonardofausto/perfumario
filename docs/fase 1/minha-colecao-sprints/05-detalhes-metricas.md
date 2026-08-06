# Sprint 5 - Pagina de detalhes e metricas

Objetivo: remodelar a visualizacao do perfume sem misturar com a complexidade do formulario.

## Escopo

- Remover o grafico radar/aranha da secao Desempenho.
- Substituir por barras horizontais reais em HTML/CSS.
- Exibir:
  - nome da metrica;
  - valor percentual;
  - barra;
  - estado `Nao informado` para nulo.
- Nao renderizar barra preenchida para campos nulos.
- Manter zero informado como `0%`.
- Separar Desempenho de Quando usar.
- Manter barras horizontais para clima, ocasioes e horarios.
- Incluir resumo compacto de perfil perto do hero somente se houver dados suficientes.
- Revisar principais acordes: ordenacao, contraste, peso tipografico, legibilidade e valor numerico.
- Compactar a piramide olfativa sem reduzir legibilidade.

## Fora do escopo

- Novas migracoes.
- Mudancas adicionais no formulario de edicao.
- Troca de fonte ou redesign generico.

## Validacao

- Testes de barras de desempenho.
- Testes de `Nao informado` vs `0%`.
- Testes de resumo do perfil.
- Testes de ordenacao dos acordes.
- Verificacao responsiva em mobile, tablet e desktop.
- `npm.cmd test` focado.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
