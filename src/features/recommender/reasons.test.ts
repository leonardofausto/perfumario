import { describe, expect, it } from "vitest";

import { explainRecommenderResult } from "./reasons";
import type {
  RecommenderClimateContext,
  RecommenderContribution,
  RecommenderPerfume,
} from "./types";

const perfume: RecommenderPerfume = {
  id: "one",
  brand: "Marca",
  name: "Âmbar",
  concentration: "eau_de_parfum",
  bottleFormat: "full_bottle",
  inspirationKind: "original",
  inspiredBy: null,
  olfactoryFamilies: ["Amadeirado"],
  imageUrl: null,
  isFavorite: false,
  launchYear: null,
  categoryType: null,
  audience: null,
  intensity: 85,
  sweetness: 82,
  freshness: 35,
  elegance: 70,
  sensuality: 80,
  profileTags: [],
  containerLevel: "unknown",
  replenishmentIntent: null,
  containerLevelUpdatedAt: null,
  scores: [],
};

const winterManual: RecommenderClimateContext = {
  cidade: "Curitiba",
  clima: "Chuvoso",
  temperaturaCelsius: 12,
  estacao: "inverno",
};

function contribution(
  criterion: RecommenderContribution["criterion"],
  score: number,
  weight: number,
): RecommenderContribution {
  return { criterion, score, weight };
}

describe("explainRecommenderResult", () => {
  it("uses the highest real contributors as reasons", () => {
    const explanation = explainRecommenderResult({
      perfume,
      contextMode: "manual",
      climate: winterManual,
      contributions: [
        contribution("occasion", 92, 20),
        contribution("weather", 88, 30),
        contribution("sensory", 85, 15),
        contribution("time", 50, 15),
      ],
    });

    expect(explanation.reasons).toEqual([
      "Excelente para noites frias.",
      "Alta compatibilidade com as ocasiões escolhidas.",
      "Perfil sensorial alinhado às suas preferências.",
    ]);
  });

  it("uses the strongest penalty as the single attention point", () => {
    const explanation = explainRecommenderResult({
      perfume,
      contextMode: "automatic",
      climate: {
        cidade: "Manaus",
        clima: "Céu limpo",
        temperaturaCelsius: 34,
        estacao: "verao",
        sensacaoCelsius: 38,
      },
      contributions: [
        contribution("weather", 35, 30),
        contribution("time", 40, 15),
        contribution("occasion", 80, 20),
      ],
    });

    expect(explanation.attention).toBe("Docura elevada para a temperatura atual.");
  });

  it("does not invent reasons for a perfume with little supporting data", () => {
    const explanation = explainRecommenderResult({
      perfume: { ...perfume, intensity: null, sweetness: null },
      contextMode: "manual",
      climate: {
        cidade: "Rio de Janeiro",
        clima: null,
        temperaturaCelsius: null,
        estacao: null,
      },
      contributions: [contribution("occasion", 50, 20)],
    });

    expect(explanation.reasons).toEqual([]);
    expect(explanation.attention).toBeNull();
  });

  it("describes new real selection groups in reasons and alerts", () => {
    const explanation = explainRecommenderResult({
      perfume,
      contextMode: "manual",
      climate: winterManual,
      contributions: [
        contribution("performance", 88, 15),
        contribution("season", 82, 10),
        contribution("environment", 35, 10),
      ],
    });

    expect(explanation.reasons).toEqual([
      "Desempenho alinhado às prioridades escolhidas.",
      "Boa compatibilidade com as estações selecionadas.",
    ]);
    expect(explanation.attention).toBe(
      "Possui menor aderência ao ambiente selecionado.",
    );
  });

  it("respects manual and automatic climate contexts in reason text", () => {
    const manual = explainRecommenderResult({
      perfume,
      contextMode: "manual",
      climate: winterManual,
      contributions: [contribution("weather", 90, 30)],
    });
    const automatic = explainRecommenderResult({
      perfume,
      contextMode: "automatic",
      climate: {
        cidade: "Manaus",
        clima: "Céu limpo",
        temperaturaCelsius: 34,
        estacao: "verao",
      },
      contributions: [contribution("weather", 90, 30)],
    });

    expect(manual.reasons).toEqual(["Excelente para noites frias."]);
    expect(automatic.reasons).toEqual([
      "Frescor adequado para a temperatura atual.",
    ]);
  });
});
