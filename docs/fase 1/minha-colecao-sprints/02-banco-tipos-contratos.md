# Sprint 2 - Banco, tipos e contratos de dados

Objetivo: preparar a base persistida para os novos campos sem mexer no visual.

## Escopo

- Adicionar somente os campos necessarios:
  - ano de lancamento;
  - categoria/tipo;
  - publico;
  - intensidade;
  - docura;
  - frescor;
  - elegancia;
  - sensualidade;
  - tags de perfil.
- Criar migracao versionada.
- Permitir nulo para dados desconhecidos.
- Aplicar constraints de 0 a 100 para percentuais quando compativel com o schema.
- Atualizar tipos compartilhados, schema de validacao, queries e actions.
- Preservar registros existentes e compatibilidade com dados antigos.

## Fora do escopo

- Redesign visual.
- Autocomplete de perfume de referencia.
- Refatoracao ampla de componentes.
- Campos Perfumista e Pais da marca.

## Validacao

- Testes focados de schema, validacao, queries e actions.
- `npm.cmd test` nos testes afetados.
- `npm.cmd run typecheck`.
- Validacao de migracoes/schema conforme ferramentas do projeto.
- `graphify update .`.
