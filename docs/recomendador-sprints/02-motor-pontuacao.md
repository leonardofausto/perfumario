# Sprint 2 - Motor de pontuacao

Objetivo: criar uma funcao isolada, tipada e testada para calcular compatibilidade de perfumes de 0 a 100.

## Escopo

- Criar arquivos focados para o motor, por exemplo:
  - `src/features/recommender/types.ts`;
  - `src/features/recommender/scoring-config.ts`;
  - `src/features/recommender/weather-fit.ts`;
  - `src/features/recommender/scoring.ts`;
  - `src/features/recommender/scoring.test.ts`.
- Implementar pesos iniciais:
  - clima e estacao: 30%;
  - ocasiao: 20%;
  - horario: 15%;
  - ambiente: 10%;
  - preferencias do usuario: 15%;
  - versatilidade: 10%.
- Normalizar a pontuacao final de 0 a 100.
- Redistribuir proporcionalmente pesos de criterios sem dados validos.
- Tratar zero como valor valido.
- Ignorar `null` e campos ausentes sem erro.
- Criar desempate com esta ordem:
  - maior adequacao climatica;
  - maior adequacao a ocasiao;
  - maior versatilidade;
  - maior fixacao.
- Centralizar mapeamentos de preferencias:
  - intensidade;
  - estilo;
  - presenca;
  - objetivo.
- Centralizar regras climaticas em funcoes ajustaveis.

## Fora do escopo

- Integrar o motor ao componente visual.
- Criar cards novos do Top 3.
- Gerar textos finais de motivos e alertas.
- Alterar query de perfumes se a Sprint 1 ainda nao tiver definido o contrato.

## Validacao

- Testar perfume com todos os campos preenchidos.
- Testar perfume com campos incompletos.
- Testar valor zero como dado real.
- Testar redistribuicao de pesos.
- Testar empate usando a ordem definida.
- Testar contexto manual e automatico como entradas separadas do motor.
- `npm.cmd test -- src/features/recommender/scoring.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.
