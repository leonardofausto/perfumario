# Sprint 07 — Interface de Análises

## Objetivo

Criar uma tela visual, dinâmica e profissional para explorar os dados da coleção e do Diário de uso.

## Dependência

Executar após a Sprint 06.

## Escopo

- Tela Análises.
- Filtros por botões.
- Indicadores.
- Gráficos.
- Comparativos.
- Estados vazios.
- Loading e erro.
- Responsividade.
- Acessibilidade.
- Animações discretas.

## Cabeçalho

```text
Análises
Entenda seus hábitos e preferências.
```

## Diretriz visual

Priorizar:

- números grandes;
- ícones;
- gráficos;
- barras;
- distribuição;
- ranking visual;
- pouco texto;
- leitura rápida.

Evitar:

- parágrafos explicativos longos;
- dropdowns como filtro principal;
- tabelas densas;
- excesso de cores;
- gráficos decorativos;
- cards aninhados.

## Filtros principais

Botões segmentados:

- 7 dias;
- 30 dias;
- 90 dias;
- Este ano;
- Tudo.

Filtros de dimensão:

- Usos;
- Elogios;
- Satisfação;
- Coleção.

A mudança deve atualizar os gráficos dinamicamente.

## Estrutura recomendada

### Linha 1 — indicadores

- usos;
- elogios;
- fragrâncias usadas;
- satisfação média.

### Linha 2 — tendência

Gráfico temporal de usos ou elogios.

### Linha 3 — comportamento

- ocasiões;
- horários;
- ambientes;
- clima.

### Linha 4 — fragrâncias

- mais usadas;
- mais elogiadas;
- melhor satisfação;
- esquecidas.

### Linha 5 — coleção

- categorias;
- concentrações;
- evolução;
- níveis.

## Gráficos recomendados

- linha ou área para evolução temporal;
- barras horizontais para rankings;
- barras empilhadas para distribuição;
- donut somente quando houver poucas categorias;
- heatmap somente se houver benefício real e biblioteca adequada.

## Regras

- Não exibir gráfico com dados insuficientes.
- Não completar séries com dados inventados.
- Tooltips devem ser acessíveis.
- Cores devem seguir tokens.
- Mudança de filtro não deve recarregar toda a página.
- Animação deve ser curta e respeitar `prefers-reduced-motion`.

## Estado vazio

Mostrar:

- ausência de dados;
- explicação curta;
- link para Diário de uso.

Não mostrar valores simulados.

## Fora de escopo

- edição de registros;
- cadastro de fragrâncias;
- recomendação;
- exportação;
- comparação social;
- PDF;
- filtros complexos por dropdown.

## Testes

- troca de períodos;
- troca de dimensão;
- gráfico vazio;
- zero elogios;
- tooltip;
- teclado;
- mobile;
- redução de movimento;
- carregamento;
- erro.

## Critérios de aceite

- Filtros são botões.
- Gráficos mudam dinamicamente.
- Layout é visual.
- Textos são curtos.
- Métricas são reais.
- Estados vazios são claros.
- Mobile não possui scroll horizontal.
- Acessibilidade básica está preservada.
- Biblioteca de gráficos não aumenta o bundle sem justificativa.

## Validações

- testes de componente;
- testes das transformações;
- e2e dos filtros;
- análise de bundle, se nova biblioteca for adicionada;
- lint;
- typecheck;
- build;
- `graphify update .`.
