export type AnalyticsMetricDefinition = {
  key: string;
  group: "collection" | "usage" | "compliments" | "satisfaction" | "performance";
  formula: string;
  emptyRule: string;
};

export const ANALYTICS_METRIC_CATALOG: readonly AnalyticsMetricDefinition[] = [
  { key: "collection_total", group: "collection", formula: "contagem de fragrâncias do usuário", emptyRule: "zero quando a coleção está vazia" },
  { key: "collection_favorites", group: "collection", formula: "contagem de fragrâncias favoritas", emptyRule: "zero quando nenhuma é favorita" },
  { key: "collection_brands", group: "collection", formula: "marcas distintas cadastradas", emptyRule: "zero quando a coleção está vazia" },
  { key: "collection_categories", group: "collection", formula: "contagem por categoria informada", emptyRule: "omite somente registros sem categoria" },
  { key: "collection_concentrations", group: "collection", formula: "contagem por concentração persistida", emptyRule: "série vazia quando a coleção está vazia" },
  { key: "collection_growth", group: "collection", formula: "fragrâncias criadas por bucket local", emptyRule: "série vazia quando a coleção está vazia" },
  { key: "collection_low", group: "collection", formula: "contagem com nível No final", emptyRule: "zero real" },
  { key: "collection_empty", group: "collection", formula: "contagem com nível Acabou", emptyRule: "zero real" },
  { key: "usage_total", group: "usage", formula: "contagem de usos no período", emptyRule: "grupo de uso fica vazio sem registros" },
  { key: "usage_days", group: "usage", formula: "datas locais distintas com uso", emptyRule: "indisponível sem usos" },
  { key: "usage_unique_perfumes", group: "usage", formula: "fragrâncias distintas usadas", emptyRule: "indisponível sem usos" },
  { key: "usage_weekly_average", group: "usage", formula: "total de usos / semanas equivalentes do período", emptyRule: "indisponível sem usos" },
  { key: "usage_most_used", group: "usage", formula: "maior contagem de usos por fragrância; desempate por nome e id", emptyRule: "indisponível sem usos" },
  { key: "usage_least_used", group: "usage", formula: "menor contagem entre fragrâncias usadas; desempate por nome e id", emptyRule: "indisponível sem usos" },
  { key: "usage_days_since_last", group: "usage", formula: "diferença entre a data local atual e a data local do último uso", emptyRule: "indisponível sem usos" },
  { key: "usage_forgotten", group: "usage", formula: "fragrância nunca usada ou sem uso no período escolhido", emptyRule: "lista vazia quando não há fragrâncias" },
  { key: "compliments_total", group: "compliments", formula: "soma de elogios dos usos elegíveis", emptyRule: "indisponível sem usos; zero real quando há usos sem elogios" },
  { key: "complimented_usages", group: "compliments", formula: "usos com compliments_count maior que zero", emptyRule: "indisponível sem usos" },
  { key: "compliment_usage_rate", group: "compliments", formula: "usos com pelo menos um elogio / total de usos elegíveis", emptyRule: "indisponível sem usos; zero real quando nenhum uso recebeu elogio" },
  { key: "most_complimented", group: "compliments", formula: "maior soma de elogios por fragrância", emptyRule: "indisponível quando a soma de elogios é zero" },
  { key: "compliments_by_occasion", group: "compliments", formula: "soma de elogios agrupada por ocasião", emptyRule: "indisponível sem usos" },
  { key: "compliments_by_time", group: "compliments", formula: "soma de elogios agrupada por horário", emptyRule: "indisponível sem usos" },
  { key: "compliments_by_climate", group: "compliments", formula: "soma de elogios agrupada por condição climática informada", emptyRule: "exclui apenas usos sem clima" },
  { key: "satisfaction_average", group: "satisfaction", formula: "soma das notas / usos com satisfação", emptyRule: "indisponível sem observações elegíveis" },
  { key: "satisfaction_best", group: "satisfaction", formula: "maior média de satisfação por fragrância", emptyRule: "indisponível sem satisfação" },
  { key: "satisfaction_distribution", group: "satisfaction", formula: "contagem de usos por nota de 1 a 5", emptyRule: "série vazia sem satisfação" },
  { key: "satisfaction_by_occasion", group: "satisfaction", formula: "média de satisfação por ocasião", emptyRule: "indisponível sem satisfação" },
  { key: "satisfaction_by_climate", group: "satisfaction", formula: "média de satisfação por condição climática informada", emptyRule: "exclui apenas usos sem clima" },
  { key: "performance_average", group: "performance", formula: "soma das avaliações de desempenho / avaliações informadas", emptyRule: "indisponível sem desempenho informado" },
  { key: "performance_best", group: "performance", formula: "maior média de desempenho percebido por fragrância", emptyRule: "lista vazia sem desempenho informado" },
  { key: "performance_compliment_relation", group: "performance", formula: "por nota de desempenho: média de elogios e taxa de usos com elogios", emptyRule: "exclui usos sem desempenho informado" },
] as const;
