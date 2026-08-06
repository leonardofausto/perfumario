# Sprint 01 — Descoberta e arquitetura

## Objetivo

Mapear o estado atual do Perfumário e produzir a arquitetura técnica da Fase 3 sem implementar funcionalidades.

## Contexto

A Fase 3 altera múltiplos módulos. Antes de criar banco, telas ou regras, é necessário identificar contratos existentes, rotas, componentes compartilhados, padrões de autenticação, fontes de dados, migrations e testes.

## Escopo

- Mapear rotas e layouts atuais.
- Mapear sidebar e navegação mobile.
- Identificar contratos de perfume.
- Identificar fontes de dados do Dashboard atual.
- Identificar estrutura do Recomendador.
- Identificar padrões de actions, repositories e queries.
- Identificar componentes visuais reutilizáveis.
- Identificar biblioteca de gráficos existente, se houver.
- Identificar migrations e políticas RLS atuais.
- Identificar padrões de testes.
- Documentar arquitetura proposta.
- Registrar riscos e lacunas.

## Fora de escopo

- Alterar banco.
- Criar componentes.
- Instalar bibliotecas.
- Renomear menus.
- Implementar telas.
- Criar dados fictícios.
- Refatorar arquivos.

## Descoberta obrigatória

O Codex deve usar Graphify e leitura dirigida para localizar:

- layout autenticado;
- configuração da sidebar;
- rotas de coleção, recomendador e dashboard;
- tipos `PerfumeSummary`, `PerfumeDetail` e equivalentes;
- actions e queries do Supabase;
- componentes de filtros;
- componentes de cards e indicadores;
- padrões de loading, empty state e error state;
- testes unitários e e2e relevantes;
- migrations mais recentes;
- políticas de isolamento por usuário.

## Entregável

Criar:

```text
docs/fase-3-experiencia-inteligente/arquitetura-descoberta.md
```

O documento deve conter:

1. mapa de rotas atuais;
2. mapa de componentes;
3. mapa de contratos;
4. mapa de dados;
5. mapa de autenticação e RLS;
6. pontos de extensão;
7. riscos;
8. arquitetura recomendada;
9. decisões que precisam ser preservadas;
10. lista de arquivos prováveis por sprint.

## Decisões obrigatórias

A arquitetura deve preservar:

- separação entre leitura, gerenciamento e recomendação;
- dados privados por usuário;
- identidade editorial;
- componentes pequenos;
- lógica de domínio fora de componentes de tela;
- consultas agregadas fora da renderização;
- ausência de dados fictícios.

## Critérios de aceite

- Nenhum arquivo de código foi alterado.
- Nenhuma migration foi criada.
- O documento de descoberta foi produzido.
- A arquitetura diferencia claramente os cinco módulos.
- Dependências entre sprints estão explícitas.
- Riscos de banco e desempenho estão registrados.
- A estratégia para gráficos está documentada.
- A estratégia para Diário de uso está documentada.
- A estratégia para níveis qualitativos está documentada.
- A estratégia de integração com Recomendador está documentada.

## Validações

- Revisar links e caminhos citados.
- Confirmar que arquivos citados existem.
- Confirmar que nenhuma implementação foi realizada.
- Atualizar Graphify somente se a ferramenta gerar artefato de análise necessário.

## Saída esperada

Resumo da descoberta, documento criado, riscos encontrados e recomendação de continuidade.
