import type { RecommenderClimateContext, RecommenderPerfume } from "./types";

type ClimateRule = {
  pattern: RegExp;
  fields: Partial<Record<"freshness" | "sweetness" | "elegance" | "sensuality", number>>;
  seasons?: Partial<Record<NonNullable<RecommenderClimateContext["estacao"]>, number>>;
};

const CLIMATE_RULES: ClimateRule[] = [
  {
    pattern: /limpo|sol|quente/i,
    fields: { freshness: 0.7, elegance: 0.3 },
    seasons: { verao: 10, primavera: 5 },
  },
  {
    pattern: /nublado|neblina/i,
    fields: { elegance: 0.45, freshness: 0.35, sensuality: 0.2 },
    seasons: { outono: 8, inverno: 5 },
  },
  {
    pattern: /chuva|chuvoso|garoa|tempestade/i,
    fields: { sensuality: 0.4, sweetness: 0.35, elegance: 0.25 },
    seasons: { inverno: 10, outono: 6 },
  },
  {
    pattern: /frio|neve/i,
    fields: { sweetness: 0.45, sensuality: 0.35, elegance: 0.2 },
    seasons: { inverno: 10 },
  },
];

function isValidPercent(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function scoreTemperature(temperature: number | null) {
  if (!isValidPercent(temperature)) {
    return null;
  }

  if (temperature >= 28) return { freshness: 0.75, elegance: 0.25 };
  if (temperature <= 16) return { sweetness: 0.45, sensuality: 0.35, elegance: 0.2 };

  return { elegance: 0.4, freshness: 0.35, sensuality: 0.25 };
}

function weightedFieldsScore(
  perfume: RecommenderPerfume,
  fields: Partial<Record<"freshness" | "sweetness" | "elegance" | "sensuality", number>>,
) {
  let weighted = 0;
  let totalWeight = 0;

  for (const [field, weight] of Object.entries(fields)) {
    const value = perfume[field as keyof typeof fields] as number | null | undefined;

    if (isValidPercent(value)) {
      weighted += value * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weighted / totalWeight : null;
}

export function scoreWeatherFit(
  perfume: RecommenderPerfume,
  climate: RecommenderClimateContext,
) {
  const pieces: number[] = [];
  const normalizedWeather = climate.clima?.trim() ?? "";
  const climateRule = CLIMATE_RULES.find((rule) => rule.pattern.test(normalizedWeather));

  if (climateRule) {
    const fieldScore = weightedFieldsScore(perfume, climateRule.fields);

    if (fieldScore !== null) {
      pieces.push(fieldScore);
    }

    const seasonBonus = climate.estacao
      ? (climateRule.seasons?.[climate.estacao] ?? null)
      : null;
    if (typeof seasonBonus === "number" && fieldScore !== null) {
      pieces.push(Math.min(100, fieldScore + seasonBonus));
    }
  }

  const temperatureFields = scoreTemperature(climate.temperaturaCelsius);
  if (temperatureFields) {
    const temperatureScore = weightedFieldsScore(perfume, temperatureFields);

    if (temperatureScore !== null) {
      pieces.push(temperatureScore);
    }
  }

  if (pieces.length === 0) {
    return null;
  }

  return pieces.reduce((sum, value) => sum + value, 0) / pieces.length;
}
