# Sprint 08 — Remodelagem da Visão geral

## Objetivo

Transformar a Dashboard atual em uma Visão geral profissional, visual e representativa do estado da coleção.

## Dependências

Executar após as Sprints 03, 05, 06 e 07.

## Papel do módulo

A Visão geral responde:

> Como está minha coleção hoje?

Ela apresenta informação resumida e direciona o usuário aos módulos responsáveis.

## Escopo

- Remodelar a tela inicial.
- Criar indicadores principais.
- Criar gráficos resumidos.
- Criar destaques.
- Criar alertas de nível.
- Criar resumo de uso.
- Criar links para módulos.
- Criar estados vazios.
- Garantir responsividade.
- Garantir atualização com dados reais.

## Ações permitidas

A Visão geral pode conter links e atalhos.

Não deve conter:

- formulário completo de uso;
- edição de fragrância;
- edição de nível;
- filtros analíticos avançados;
- CRUD completo;
- configuração do Recomendador.

## Primeira dobra recomendada

- total de fragrâncias;
- favoritas;
- usos no período;
- fragrância mais usada;
- alertas de nível;
- acesso rápido aos módulos.

O botão de registrar uso não é obrigatório.

Se existir, deve apenas abrir o fluxo do Diário de uso e não duplicar o formulário na Dashboard.

## Blocos recomendados

### Estado da coleção

Indicadores principais.

### Movimento recente

Gráfico resumido de usos.

### Destaques

- mais usada;
- mais elogiada;
- melhor satisfação;
- esquecida há mais tempo.

### Atenção à coleção

- no final;
- acabou;
- intenção de compra;
- decisão pendente.

### Distribuição rápida

Uma visualização compacta por categoria ou concentração.

### Últimos registros

Lista curta, somente leitura, com link para o Diário.

## Filtros

A Visão geral pode ter um filtro temporal simples por botões:

- 7 dias;
- 30 dias;
- Este ano.

Não replicar todos os filtros de Análises.

## Diretriz visual

- mais gráficos e números;
- menos texto;
- poucos blocos;
- hierarquia forte;
- sem cards aninhados;
- sem aparência administrativa;
- desktop e mobile compactos.

## Estados vazios

Usuário sem perfumes:

- orientar para Minha estante.

Usuário com perfumes e sem usos:

- mostrar coleção;
- omitir métricas de uso;
- direcionar ao Diário.

Usuário sem níveis:

- não gerar alerta.

## Fora de escopo

- CRUD completo;
- edição inline;
- gráficos avançados;
- configuração de alertas;
- recomendação Top 3 completa.

## Testes

- estante vazia;
- estante com dados;
- sem usos;
- com usos;
- zero elogios;
- itens no final;
- itens acabados;
- troca de período;
- links;
- mobile.

## Critérios de aceite

- A tela representa todos os módulos sem duplicá-los.
- Dados são reais.
- Primeira dobra é informativa.
- Layout possui mais visual e menos texto.
- Gráficos são resumidos.
- Alertas levam ao módulo correto.
- Nenhuma ação pesada acontece na Visão geral.
- Estados vazios são tratados.
- Responsividade passa.

## Validações

- testes de componente;
- e2e da tela inicial;
- lint;
- typecheck;
- build;
- `graphify update .`.
