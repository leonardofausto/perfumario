# Sprint 4 - Motivos e pontos de atencao explicaveis

Objetivo: gerar motivos e alertas a partir dos criterios que realmente contribuem ou reduzem a pontuacao.

## Escopo

- Expandir o retorno do motor para incluir contribuicoes por criterio.
- Criar gerador centralizado de textos, por exemplo `src/features/recommender/reasons.ts`.
- Gerar ate tres motivos principais por perfume.
- Gerar no maximo um ponto de atencao quando houver penalizacao relevante.
- Garantir que frases so aparecem quando houver evidencia nos dados do perfume e no contexto ativo.
- Exemplos de motivos permitidos quando sustentados por dados:
  - excelente para noites frias;
  - alta compatibilidade com encontros;
  - intensidade alinhada a preferencia;
  - bom desempenho em ambientes fechados;
  - frescor adequado para a temperatura atual;
  - boa opcao para assinatura.
- Exemplos de alertas permitidos quando sustentados por dados:
  - pode ficar intenso em ambientes fechados e quentes;
  - possui menor aderencia ao horario selecionado;
  - docura elevada para a temperatura atual.

## Fora do escopo

- Alterar layout visual dos cards alem do texto.
- Criar copy aleatoria ou editorial nao baseada no score.
- Alterar pesos principais.

## Validacao

- Testar que motivos saem dos maiores contribuidores.
- Testar que alertas saem das maiores penalizacoes.
- Testar que perfume com poucos dados nao recebe motivo inventado.
- Testar que motivos respeitam contexto manual e automatico.
- `npm.cmd test -- src/features/recommender/reasons.test.ts`.
- `npm.cmd test -- src/features/recommender/scoring.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
