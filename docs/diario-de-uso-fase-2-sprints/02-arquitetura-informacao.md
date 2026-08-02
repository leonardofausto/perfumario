# Sprint 2 — Arquitetura da informação

Objetivo: reorganizar `/jornada` em três áreas previsíveis sem alterar dados ou
regras de domínio.

## Estrutura

- `Visão geral`: área inicial.
- `Registros`: linha do tempo e gestão dos usos.
- `Descobertas`: padrões reais e estados de amostra insuficiente.

## Escopo

- Substituir as abas `Diário` e `Descobertas` pelas três áreas novas.
- Definir `view=overview`, `view=entries` e `view=discoveries`.
- Tratar valores antigos:
  - ausência de `view` abre `overview`;
  - `view=diario` redireciona ou normaliza para `entries`;
  - `view=descobertas` normaliza para `discoveries`.
- Preservar `period`, `q` e `cursor` somente nas áreas em que fizerem sentido.
- Garantir navegação por teclado, foco visível e `aria-current`.
- Separar a página em componentes de seção para reduzir o peso do arquivo de
  rota.

## Responsabilidades

- A rota resolve parâmetros e busca dados.
- Cada seção renderiza apenas o contrato recebido.
- Regras de agrupamento e métricas permanecem fora da camada visual.

## Fora do escopo

- Novo desenho final das seções.
- Novas métricas.
- Mudança no formulário de registro.

## Validação

- Testar normalização dos parâmetros antigos e novos.
- Testar preservação de filtros ao alternar áreas.
- Testar acessibilidade da navegação.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `graphify update .`.

