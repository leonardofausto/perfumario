# Sprint 4 - Validacao visual e fechamento

Objetivo: fechar a remodelagem dos ajustes de escolha com validacao ampla, responsividade e revisao de textos.

## Escopo

- Revisar desktop, tablet e mobile.
- Garantir que o painel esquerdo nao gere sobreposicao, corte indevido de texto ou rolagem horizontal inesperada no layout principal.
- Garantir que os grupos continuem legiveis com varias escolhas selecionadas.
- Garantir estados de foco, hover, selecionado e desabilitado.
- Revisar textos para evitar promessas alem dos dados disponiveis.
- Confirmar que clima continua apenas no card superior `Seu momento`.
- Confirmar que o Top 3 continua funcionando com:
  - estante vazia;
  - um perfume;
  - dois perfumes;
  - tres ou mais perfumes;
  - perfumes com campos incompletos.
- Quando possivel, usar validacao visual automatizada para reduzir dependencia de teste manual no navegador.

## Fora do escopo

- Criar novas escolhas.
- Criar novas metricas.
- Alterar banco.
- Alterar geolocalizacao ou API de clima.
- Reescrever o Top 3.

## Validacao

- `npm.cmd test`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npm.cmd run build`.
- Verificacao visual desktop e mobile por inspecao automatizada quando houver ferramenta disponivel.
- Busca textual garantindo ausencia de:
  - `Passeio`;
  - `Fim de tarde`;
  - filtro de clima dentro de `Ajustes da escolha`.
- `graphify update .`.

## Entrega final esperada

- Resumo dos arquivos alterados.
- Contrato final das escolhas.
- Formula ou ajustes de pontuacao aplicados.
- Campos reais usados.
- Campos ausentes ou removidos.
- Limitacoes conhecidas e proximos ajustes recomendados.
