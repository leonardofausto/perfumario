# Sprint 4 — Memória Olfativa

Objetivo: levar o resumo por fragrância para dentro da Visão geral do Diário de
Uso em uma composição mais compacta e contextual.

## Escopo

- Remover a dependência visual do painel `Sua jornada` da ficha do perfume.
- Criar uma seção `Memória Olfativa` dentro da Visão geral.
- Permitir selecionar uma fragrância com registros por busca ou seletor
  compacto.
- Aceitar `q` vindo de links da Coleção ou do detalhe para pré-seleção.
- Reutilizar o contrato de `getOwnJourneyPerfumeSummary`.
- Exibir:
  - total de usos;
  - último uso;
  - satisfação média;
  - total de elogios;
  - ocasião mais frequente;
  - momento favorito.
- Usar uma composição editorial: identidade da fragrância, texto factual e uma
  lista compacta de métricas, não seis cards.
- Oferecer `Registrar novo uso` e `Ver registros desta fragrância`.

## Regras de verdade

- Não mostrar percentuais quando não houver denominador válido.
- Não transformar um único uso em tendência.
- Exibir estado insuficiente quando ocasião ou momento não estiverem definidos.
- Perfume removido usa snapshot e não cria link quebrado.

## Fora do escopo

- Novas métricas.
- Comparação entre fragrâncias.
- Insights gerados por IA.
- Alterar o ranking do Recomendador.

## Validação

- Testar seleção, parâmetro `q`, dados completos e dados insuficientes.
- Testar fragrância removida.
- Testar que todas as métricas permanecem dentro do contêiner.
- Verificação visual nos cinco tamanhos globais.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

