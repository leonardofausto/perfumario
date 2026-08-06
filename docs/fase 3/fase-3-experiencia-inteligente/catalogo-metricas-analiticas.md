# Catálogo de métricas analíticas

Este catálogo pertence à Sprint 06. Ele define as fórmulas consumidas futuramente
por Análises, Visão geral e pelo contrato secundário do Recomendador. Não define
interface, gráfico ou peso de recomendação.

## Filtros e tempo

Os períodos são calculados no timezone informado pelo usuário:

- `7d`: hoje e os seis dias locais anteriores;
- `30d`: hoje e os 29 dias locais anteriores;
- `90d`: hoje e os 89 dias locais anteriores;
- `year`: do primeiro dia do ano local até o instante da consulta;
- `all`: desde o primeiro perfume ou uso do usuário até o instante da consulta.

Os três períodos em dias usam buckets diários. `year` e `all` usam buckets
mensais. A RPC retorna buckets esperados e pontos esparsos; a camada de domínio
preenche zero apenas quando o conjunto possui dados. Sem dados, a série é vazia.

## Estados de dados

- `available`: existe amostra elegível. O valor pode ser zero.
- `empty`: não existe amostra elegível e o valor é `null`.
- Sem usos: métricas derivadas de uso ficam vazias.
- Com usos, mas sem elogios: totais e taxa de elogios são zero real.
- Sem desempenho informado: métricas de desempenho ficam vazias.
- Usos sem clima são excluídos somente dos agrupamentos climáticos.

## Coleção

| Métrica | Fórmula |
| --- | --- |
| Total | Contagem de perfumes privados atuais. |
| Favoritas | Contagem com `is_favorite = true`. |
| Marcas | Marcas distintas persistidas. |
| Categorias | Contagem por categoria; nulos são omitidos apenas deste agrupamento. |
| Concentrações | Contagem por concentração persistida. |
| Crescimento | Perfumes criados por bucket local dentro do período. |
| No final | Contagem com nível `low`. |
| Acabou | Contagem com nível `empty`. |

As contagens atuais da coleção não são reduzidas pelo período. O período afeta
somente a série de crescimento.

## Uso

| Métrica | Fórmula |
| --- | --- |
| Total de usos | Registros de uso dentro do período. |
| Dias com uso | Datas locais distintas com pelo menos um uso. |
| Fragrâncias únicas | Perfumes distintos usados. |
| Média semanal | Total de usos dividido pelas semanas equivalentes do intervalo; mínimo de uma semana. Em `all`, começa no primeiro uso. |
| Mais usada | Maior contagem de usos por perfume; desempate por nome e ID. |
| Menos usada | Menor contagem somente entre perfumes usados; desempate por nome e ID. |
| Tempo desde o último uso | Diferença em dias de calendário local. |
| Esquecida | Perfume nunca usado ou sem uso dentro do período selecionado. |

Perfume nunca usado mantém `lastUsedAt` e `daysSinceLastUse` como `null`; não é
atribuído um número fictício.

## Elogios

| Métrica | Fórmula |
| --- | --- |
| Total | Soma de `compliments_count`. |
| Usos com elogios | Contagem de usos com ao menos um elogio. |
| Taxa de usos com elogios | Usos com ao menos um elogio / total de usos elegíveis. |
| Mais elogiada | Maior soma total de elogios por perfume. |
| Por ocasião | Soma de elogios e tamanho da amostra por ocasião. |
| Por horário | Soma de elogios e tamanho da amostra por horário. |
| Por clima | Soma de elogios e tamanho da amostra por condição climática informada. |

“Mais elogiada” nunca significa taxa de sucesso. A taxa possui nome e contrato
separados.

## Satisfação

| Métrica | Fórmula |
| --- | --- |
| Média geral | Soma das notas / observações elegíveis. |
| Melhor média | Maior média por perfume, com tamanho da amostra. |
| Distribuição | Contagem por nota de 1 a 5. |
| Por ocasião | Média e tamanho da amostra por ocasião. |
| Por clima | Média e tamanho da amostra por condição climática informada. |

## Desempenho percebido

| Métrica | Fórmula |
| --- | --- |
| Média | Soma de `performance_rating` / avaliações informadas. |
| Melhores resultados | Média por perfume, ordenada da maior para a menor. |
| Relação com elogios | Para cada nota de desempenho: média de elogios, taxa de usos com elogios e tamanho da amostra. |

Não há inferência causal entre desempenho e elogios. O agrupamento apresenta
somente a relação observada nos registros privados.
