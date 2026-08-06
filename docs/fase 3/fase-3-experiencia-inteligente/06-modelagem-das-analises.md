# Sprint 06 — Modelagem das Análises

## Objetivo

Definir e implementar a camada de métricas e agregações que alimentará Análises, Visão geral e parte do Recomendador.

## Dependência

Executar após as Sprints 03 e 05.

## Escopo

- Definir catálogo de métricas.
- Definir filtros.
- Definir períodos.
- Criar funções de agregação.
- Criar consultas eficientes.
- Criar normalização de séries.
- Criar tratamento de dados ausentes.
- Criar testes.
- Documentar fórmulas.

## Princípio

Toda métrica deve ser derivada de dados reais.

Uma métrica sem dados suficientes deve retornar estado vazio, não zero enganoso.

## Períodos

- 7 dias;
- 30 dias;
- 90 dias;
- este ano;
- tudo.

Os períodos principais serão usados por botões.

## Métricas prioritárias

### Coleção

- total de fragrâncias;
- favoritas;
- marcas;
- categorias;
- concentrações;
- crescimento da coleção;
- itens no final;
- itens acabados.

### Uso

- total de usos;
- dias com uso;
- fragrâncias únicas usadas;
- média de usos por semana;
- mais usada;
- menos usada;
- tempo desde o último uso;
- fragrâncias esquecidas.

### Elogios

- total de elogios;
- usos com elogios;
- taxa de usos com elogios;
- fragrância mais elogiada;
- elogios por ocasião;
- elogios por horário;
- elogios por clima.

### Satisfação

- média geral;
- melhor média;
- distribuição por nota;
- satisfação por ocasião;
- satisfação por clima.

### Desempenho percebido

- média;
- melhores resultados;
- relação entre desempenho e elogios.

## Definições obrigatórias

### Taxa de usos com elogios

Número de usos com pelo menos um elogio dividido pelo total de usos elegíveis.

Não dividir total de elogios pelo total de usos e chamar isso de taxa.

### Fragrância esquecida

Definir limiar claro e documentado.

Sugestão:

- fragrância nunca usada;
- ou sem uso dentro do período escolhido.

### Mais elogiada

Definir se usa:

- total de elogios;
- usos com elogios;
- taxa de sucesso.

A interface poderá alternar, mas cada métrica deve ter nome preciso.

## Consultas

Evitar carregar todos os registros no cliente.

Preferir:

- agregações no banco;
- RPC segura;
- views;
- queries paginadas;
- funções de domínio testáveis.

A escolha depende da descoberta da Sprint 01.

## Dados ausentes

- Sem usos: estado vazio.
- Sem elogios: zero real quando existem usos.
- Sem satisfação: métrica indisponível.
- Sem clima: excluir apenas dos gráficos climáticos.
- Sem ocasião: excluir apenas do agrupamento correspondente.

## Fora de escopo

- UI dos gráficos.
- Animações.
- Machine learning.
- previsões.
- comparação com outros usuários.
- dados públicos.

## Testes

- períodos;
- timezone;
- zero elogios;
- ausência de satisfação;
- agregações por ocasião;
- agregações por clima;
- usuário sem dados;
- isolamento por usuário;
- desempenho com volume maior de registros;
- consistência de fórmulas.

## Critérios de aceite

- Catálogo de métricas documentado.
- Fórmulas não são ambíguas.
- Consultas são privadas.
- Dados ausentes não quebram.
- Zero é distinto de ausente.
- Agregações são reutilizáveis.
- Métricas atendem Visão geral e Análises.
- Testes passam.

## Validações

- testes de funções;
- testes de banco;
- testes RLS;
- análise de query;
- lint;
- typecheck;
- `graphify update .`.
