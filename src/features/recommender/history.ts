import type {
  RecommenderHistory,
  RecommenderHistoryEvaluation,
  RecommenderHistorySample,
  RecommenderHistorySignal,
  RecommenderHistoryUsage,
} from "./types";

const MIN_RATE_SAMPLE = 3;
const MIN_AVERAGE_SAMPLE = 2;
const MAX_ADJUSTMENT = 5;

function emptySample(): RecommenderHistorySample {
  return {
    totalUses: 0,
    complimentsTotal: 0,
    complimentedUses: 0,
    satisfactionTotal: 0,
    satisfactionCount: 0,
    performanceTotal: 0,
    performanceCount: 0,
  };
}

function addUsage(sample: RecommenderHistorySample, usage: RecommenderHistoryUsage) {
  sample.totalUses += 1;
  sample.complimentsTotal += usage.complimentsCount;
  sample.complimentedUses += usage.complimentsCount > 0 ? 1 : 0;
  sample.satisfactionTotal += usage.satisfaction;
  sample.satisfactionCount += 1;
  if (usage.performanceRating !== null) {
    sample.performanceTotal += usage.performanceRating;
    sample.performanceCount += 1;
  }
}

function sampleFor(
  groups: Record<string, RecommenderHistorySample>,
  key: string,
) {
  groups[key] ??= emptySample();
  return groups[key];
}

export function aggregateRecommenderHistory(
  usages: readonly RecommenderHistoryUsage[],
): Map<string, RecommenderHistory> {
  const histories = new Map<string, RecommenderHistory>();

  for (const usage of usages) {
    const history = histories.get(usage.perfumeId) ?? {
      ...emptySample(),
      lastUsedAt: null,
      byOccasion: {},
      bySeason: {},
    };
    addUsage(history, usage);
    addUsage(sampleFor(history.byOccasion, usage.occasionKey), usage);
    if (usage.seasonKey) {
      addUsage(sampleFor(history.bySeason, usage.seasonKey), usage);
    }
    if (!history.lastUsedAt || usage.usedAt > history.lastUsedAt) {
      history.lastUsedAt = usage.usedAt;
    }
    histories.set(usage.perfumeId, history);
  }

  return histories;
}

function averageScore(total: number, count: number) {
  return ((total / count) - 1) * 25;
}

function successScore(sample: RecommenderHistorySample) {
  const satisfaction = averageScore(
    sample.satisfactionTotal,
    sample.satisfactionCount,
  );
  const complimentRate = (sample.complimentedUses / sample.totalUses) * 100;
  return satisfaction * 0.7 + complimentRate * 0.3;
}

function combinedSample(
  groups: Record<string, RecommenderHistorySample>,
  keys: readonly string[],
) {
  const combined = emptySample();
  for (const key of keys) {
    const sample = groups[key];
    if (!sample) continue;
    combined.totalUses += sample.totalUses;
    combined.complimentsTotal += sample.complimentsTotal;
    combined.complimentedUses += sample.complimentedUses;
    combined.satisfactionTotal += sample.satisfactionTotal;
    combined.satisfactionCount += sample.satisfactionCount;
    combined.performanceTotal += sample.performanceTotal;
    combined.performanceCount += sample.performanceCount;
  }
  return combined;
}

function signal(
  key: RecommenderHistorySignal["key"],
  score: number,
  sampleSize: number,
  weight: number,
): RecommenderHistorySignal {
  return { key, score: Math.max(0, Math.min(100, score)), sampleSize, weight };
}

function reasonForSignal(
  item: RecommenderHistorySignal,
  occasion: string | undefined,
) {
  const threshold = item.key === "occasion" || item.key === "climate" ? 65 : 70;
  if (item.score < threshold) return null;
  switch (item.key) {
    case "occasion":
      return occasion ? `Costuma funcionar bem em ${occasion.replaceAll("_", " ")}.` : null;
    case "climate":
      return "Já teve bons resultados em clima semelhante.";
    case "satisfaction":
      return "Tem boa média de satisfação no seu histórico.";
    case "compliments":
    case "complimentRate":
      return "Já recebeu elogios no seu histórico.";
    case "performance":
      return "O desempenho percebido costuma ser bom.";
    case "recency":
      return "Você não usa esta fragrância há algum tempo.";
    case "frequency":
      return null;
  }
}

export function evaluateRecommenderHistory(
  history: RecommenderHistory | undefined,
  context: { occasions: readonly string[]; season: string | null; now?: string },
): RecommenderHistoryEvaluation {
  if (!history || history.totalUses === 0) {
    return { score: null, adjustment: 0, reasons: [], signals: [] };
  }

  const signals: RecommenderHistorySignal[] = [
    signal(
      "frequency",
      (Math.log1p(history.totalUses) / Math.log1p(10)) * 100,
      history.totalUses,
      5,
    ),
  ];

  if (history.totalUses >= MIN_RATE_SAMPLE) {
    signals.push(
      signal(
        "compliments",
        (Math.min(history.complimentsTotal / history.totalUses, 2) / 2) * 100,
        history.totalUses,
        10,
      ),
      signal(
        "complimentRate",
        (history.complimentedUses / history.totalUses) * 100,
        history.totalUses,
        15,
      ),
    );
  }
  if (history.satisfactionCount >= MIN_AVERAGE_SAMPLE) {
    signals.push(
      signal(
        "satisfaction",
        averageScore(history.satisfactionTotal, history.satisfactionCount),
        history.satisfactionCount,
        20,
      ),
    );
  }
  if (history.performanceCount >= MIN_AVERAGE_SAMPLE) {
    signals.push(
      signal(
        "performance",
        averageScore(history.performanceTotal, history.performanceCount),
        history.performanceCount,
        15,
      ),
    );
  }

  const occasion = combinedSample(history.byOccasion, context.occasions);
  if (occasion.totalUses >= MIN_RATE_SAMPLE) {
    signals.push(signal("occasion", successScore(occasion), occasion.totalUses, 20));
  }
  const climate = context.season ? history.bySeason[context.season] : undefined;
  if (climate && climate.totalUses >= MIN_RATE_SAMPLE) {
    signals.push(signal("climate", successScore(climate), climate.totalUses, 15));
  }

  const now = new Date(context.now ?? Date.now());
  const lastUsed = history.lastUsedAt ? new Date(history.lastUsedAt) : null;
  if (lastUsed && Number.isFinite(lastUsed.getTime()) && Number.isFinite(now.getTime())) {
    const days = Math.max(0, (now.getTime() - lastUsed.getTime()) / 86_400_000);
    signals.push(signal("recency", Math.min(days / 30, 1) * 100, 1, 5));
  }

  const totalWeight = signals.reduce((total, item) => total + item.weight, 0);
  const score =
    signals.reduce((total, item) => total + item.score * item.weight, 0) /
    totalWeight;
  const adjustment =
    Math.round((((score - 50) / 50) * MAX_ADJUSTMENT) * 10) / 10;
  const reasons = signals
    .toSorted((left, right) => {
      const contextPriority = (item: RecommenderHistorySignal) =>
        item.key === "occasion" ? 2 : item.key === "climate" ? 1 : 0;
      return (
        contextPriority(right) - contextPriority(left) ||
        right.score * right.weight - left.score * left.weight
      );
    })
    .map((item) => reasonForSignal(item, context.occasions[0]))
    .filter((reason): reason is string => reason !== null)
    .filter((reason, index, all) => all.indexOf(reason) === index)
    .slice(0, 2);

  return { score, adjustment, reasons, signals };
}
