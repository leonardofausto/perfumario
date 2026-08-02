# Sprint 3 — Visão geral editorial

Objetivo: criar uma entrada compacta e fluida para o Diário de Uso, sem grade de
cards grandes.

## Direção visual

- Cabeçalho com título, descrição curta e ação principal `Registrar uso`.
- Faixa tipográfica para `Usos no mês`, `Mais usada` e `Último uso`.
- Divisores e alinhamento substituem caixas independentes.
- Uma área principal para Memória Olfativa e uma chamada secundária para os
  registros recentes.
- Espaçamento responsivo baseado no contêiner real.

## Escopo

- Reaproveitar o resumo já retornado por `listOwnJourneyPage`.
- Exibir no máximo três indicadores no resumo inicial.
- Mostrar os três registros mais recentes em formato de linha, quando existirem.
- Criar atalhos claros para `Ver todos os registros` e `Ver Descobertas`.
- Criar estado inicial que prioriza `Registrar primeiro uso`.
- Preservar hierarquia e leitura sem ícones decorativos excessivos.

## Estados

- Sem usos: orientação curta e uma única ação principal.
- Com poucos usos: resumo factual, sem conclusões.
- Com histórico: resumo, Memória Olfativa e registros recentes.

## Fora do escopo

- Implementar a Memória Olfativa completa.
- Alterar filtros ou ações dos registros.
- Criar gráficos.

## Validação

- Testes dos três estados da Visão geral.
- Teste de prioridade da ação principal.
- Verificação visual em `1440px`, `1024px`, `768px`, `390px` e `320px`.
- Confirmar ausência de rolagem horizontal.
- `npm.cmd run lint`.
- `graphify update .`.

