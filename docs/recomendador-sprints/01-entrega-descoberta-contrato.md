# Sprint 1 - Entrega: descoberta e contrato

## Arquivos afetados nas proximas sprints

- `src/app/(app)/recomendador/page.tsx`: hoje chama `listOwnPerfumes()` e entrega `PerfumeSummary[]` ao `RecommenderView`.
- `src/components/recommender/recommender-view.tsx`: hoje guarda contexto automatico/manual, filtros da tela e revela os tres primeiros perfumes recebidos, sem motor real de ranking.
- `src/features/perfumes/queries.ts`: concentra o filtro por usuario, mapeia `PerfumeSummary` e ja carrega `PerfumeScore[]` no detalhe.
- `src/features/perfumes/types.ts`: define `PerfumeScore`, `PerfumeSummary` e `PerfumeDetail`.
- `src/features/perfumes/constants.ts`: define as chaves reais de metricas usadas pelo cadastro.
- `src/features/perfumes/schema.ts`: valida `scores` por categoria e chave real.
- `src/features/perfumes/queries.test.ts`: deve cobrir a ampliacao segura da query do Recomendador.
- `src/components/recommender/recommender-view.test.tsx`: deve cobrir a passagem dos candidatos reais ao motor quando ele existir.

## Filtro de estante atual

`listOwnPerfumes()` chama `requireUser()`, cria o client Supabase no servidor e executa a query em `perfumes` com `.eq("user_id", user.id)`. Portanto, a lista usada pelo Recomendador ja vem restrita a estante do usuario autenticado.

A ordenacao atual prioriza favoritos e depois nome/marca. Essa ordenacao pode continuar como desempate visual ou fallback, mas nao deve ser confundida com ranking de compatibilidade.

## Campos reais disponiveis hoje no Recomendador

`PerfumeSummary` chega ao `RecommenderView` com:

- identidade: `id`, `brand`, `name`;
- apresentacao: `concentration`, `bottleFormat`, `inspirationKind`, `inspiredBy`;
- facetas olfativas: `olfactoryFamilies`, `profileTags`;
- imagem: `imageUrl`;
- preferencia do usuario: `isFavorite`;
- dados editoriais opcionais: `launchYear`, `categoryType`, `audience`;
- percentuais diretos: `intensity`, `sweetness`, `freshness`, `elegance`, `sensuality`.

Zero e valor valido nos percentuais. `null` representa dado ausente.

## Campos dependentes de ampliacao

`PerfumeScore[]` ja existe no dominio e ja e carregado em `getOwnPerfume()`, mas nao chega ao Recomendador por `listOwnPerfumes()`.

Categorias reais:

- `performance`: `fixacao`, `projecao`, `rastro`, `versatilidade`, `presenca`;
- `season`: `primavera`, `verao`, `outono`, `inverno`;
- `occasion`: `ar_livre`, `casual`, `encontro`, `festa`, `formal`, `trabalho`;
- `time`: `manha`, `tarde`, `noite`, `madrugada`;
- `environment`: `ar_livre`, `fechado`;
- `accord`: chave livre cadastrada pelo usuario.

Decisao: criar um tipo novo `RecommenderPerfume` que estende os campos de `PerfumeSummary` com `scores: PerfumeScore[]`. A menor alteracao segura e criar uma query propria para o Recomendador, por exemplo `listOwnRecommenderPerfumes(): Promise<RecommenderPerfume[]>`, reaproveitando o filtro por `user_id`, assinatura de imagens e ordenacao de `listOwnPerfumes()`, mas buscando os scores em `perfume_scores` para todos os perfumes retornados.

Essa decisao evita inflar todos os consumidores de `PerfumeSummary` e mantem o contrato do Recomendador explicito.

## Divergencias de UI e chaves reais

- `Trabalho`: disponivel em `occasion.trabalho`.
- `Encontro`: disponivel em `occasion.encontro`.
- `Festa`: disponivel em `occasion.festa`.
- `Formal`: disponivel em `occasion.formal`.
- `Academia`: dependente de mapeamento. Hoje o cadastro mostra `occasion.ar_livre` com label `Academia`.
- `Passeio`: dependente de mapeamento. Nao existe chave direta em `OCCASION_METRICS`.
- `Ao ar livre`: disponivel em `environment.ar_livre`, mas a mesma chave tambem existe em `occasion.ar_livre`; o motor deve distinguir categoria e chave.
- `Fechado`: disponivel em `environment.fechado`.
- `Manha`: disponivel em `time.manha`.
- `Tarde`: disponivel em `time.tarde`.
- `Noite`: disponivel em `time.noite`.
- `Fim de tarde`: dependente de mapeamento. Nao existe chave direta em `TIME_METRICS`.
- `Dia inteiro`: dependente de mapeamento. Nao existe chave direta em `TIME_METRICS`.
- `Intensidade`: disponivel em `PerfumeSummary.intensity`.
- `Estilo Fresco`: disponivel em `PerfumeSummary.freshness`.
- `Estilo Elegante`: disponivel em `PerfumeSummary.elegance`.
- `Estilo Sensual`: disponivel em `PerfumeSummary.sensuality`.
- `Estilo Doce`: disponivel em `PerfumeSummary.sweetness`.
- `Estilo Casual`: dependente de mapeamento; pode usar `occasion.casual`, `profileTags` ou regra composta, a decidir na sprint do motor.
- `Presenca Discreta/Marcante`: dependente de regra. Ha `performance.presenca` e `intensity`, mas a conversao para discreta/marcante deve ser definida no motor.
- `Objetivo Para o momento`: regra de uso do contexto ativo, sem campo direto.
- `Objetivo Assinatura`: dependente de regra. Pode favorecer versatilidade/favoritos, mas nao ha chave unica dedicada.

## Contexto ativo para o motor

Assinatura proposta:

```ts
type RecommenderContextMode = "automatic" | "manual";

type RecommenderClimateContext = {
  cidade: string;
  clima: string | null;
  temperaturaCelsius: number | null;
  estacao: "primavera" | "verao" | "outono" | "inverno" | null;
  sensacaoCelsius?: number | null;
  chuva?: string | null;
  ventoKmh?: number | null;
};

type RecommenderSelection = {
  ocasiao: string | null;
  horario: string | null;
  ambiente: string | null;
  intensidade: string | null;
  estilo: string | null;
  presenca: string | null;
  objetivo: string | null;
};

type RecommenderInput = {
  perfumes: RecommenderPerfume[];
  contextMode: RecommenderContextMode;
  climate: RecommenderClimateContext;
  selection: RecommenderSelection;
};
```

O motor deve receber apenas o contexto ativo ja resolvido pela tela. Ele nao deve ler estado automatico e manual ao mesmo tempo.

## Estrategia de testes

- `queries.test.ts`: adicionar teste para `listOwnRecommenderPerfumes()` confirmando `.eq("user_id", user.id)`, assinatura de imagens e agrupamento de `PerfumeScore[]` por perfume.
- `recommender-view.test.tsx`: quando a sprint de integracao chegar, ajustar o tipo de `perfumes` e provar que o clique em `Revelar meu Top 3` usa somente os candidatos recebidos do servidor.
- Testes do motor, na sprint 2, devem ficar em modulo puro sem renderizar React.

## Validacao da sprint 1

- Todos os campos citados foram classificados como disponiveis, ausentes ou dependentes de mapeamento.
- Sera necessario criar `RecommenderPerfume` para evitar expandir `PerfumeSummary` globalmente.
- Nenhuma mudanca de banco e obrigatoria para a primeira versao do ranking; os dados necessarios ja existem em `perfumes` e `perfume_scores`.
- Nao foi indicado build completo nesta sprint, pois a entrega e documental/contratual.
