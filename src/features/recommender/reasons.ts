import type {
  RecommenderClimateContext,
  RecommenderContribution,
  RecommenderContextMode,
  RecommenderPerfume,
} from "./types";

type ReasonInput = {
  perfume: RecommenderPerfume;
  contextMode: RecommenderContextMode;
  climate: RecommenderClimateContext;
  contributions: RecommenderContribution[];
};

type ReasonOutput = {
  reasons: string[];
  attention: string | null;
};

const GOOD_SCORE = 70;
const ATTENTION_SCORE = 45;

function normalize(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

function isCold(climate: RecommenderClimateContext) {
  return (
    climate.estacao === "inverno" ||
    (typeof climate.temperaturaCelsius === "number" &&
      climate.temperaturaCelsius <= 16)
  );
}

function isHot(climate: RecommenderClimateContext) {
  return (
    climate.estacao === "verao" ||
    (typeof climate.temperaturaCelsius === "number" &&
      climate.temperaturaCelsius >= 28)
  );
}

function isPresent(value: string | null): value is string {
  return value !== null;
}

function phraseForContribution(
  contribution: RecommenderContribution,
  input: ReasonInput,
): string | null {
  if (contribution.score < GOOD_SCORE) {
    return null;
  }

  const climate = input.climate;
  const climateText = normalize(climate.clima);

  switch (contribution.criterion) {
    case "weather":
      if (isCold(climate)) return "Excelente para noites frias.";
      if (isHot(climate)) return "Frescor adequado para a temperatura atual.";
      if (climateText) return "Boa leitura do clima atual.";
      return null;
    case "performance":
      return "Desempenho alinhado às prioridades escolhidas.";
    case "sensory":
      return "Perfil sensorial alinhado às suas preferências.";
    case "season":
      return "Boa compatibilidade com as estações selecionadas.";
    case "occasion":
      return "Alta compatibilidade com as ocasiões escolhidas.";
    case "time":
      return "Boa aderência aos horários selecionados.";
    case "environment":
      return "Bom desempenho para o ambiente escolhido.";
  }
}

function attentionForContribution(
  contribution: RecommenderContribution,
  input: ReasonInput,
): string | null {
  if (contribution.score > ATTENTION_SCORE) {
    return null;
  }

  switch (contribution.criterion) {
    case "performance":
      return "Desempenho abaixo das prioridades selecionadas.";
    case "sensory":
      return "Perfil sensorial menos alinhado às suas escolhas.";
    case "season":
      return "Menor compatibilidade com as estações selecionadas.";
    case "time":
      return "Possui menor aderência aos horários selecionados.";
    case "environment":
      if (isHot(input.climate) && (input.perfume.intensity ?? 0) >= 80) {
        return "Pode ficar intenso em ambientes fechados e quentes.";
      }
      return "Possui menor aderência ao ambiente selecionado.";
    case "weather":
      if (isHot(input.climate) && (input.perfume.sweetness ?? 0) >= 80) {
        return "Docura elevada para a temperatura atual.";
      }
      return "Possui menor aderência ao clima atual.";
    case "occasion":
      return "Possui menor aderência às ocasiões selecionadas.";
  }
}

export function explainRecommenderResult(input: ReasonInput): ReasonOutput {
  const sortedContributions = [...input.contributions].sort(
    (left, right) => right.score * right.weight - left.score * left.weight,
  );
  const reasons = sortedContributions
    .map((contribution) => phraseForContribution(contribution, input))
    .filter(isPresent)
    .filter((reason, index, all) => all.indexOf(reason) === index)
    .slice(0, 3);
  const attention =
    [...input.contributions]
      .sort((left, right) => left.score - right.score)
      .map((contribution) => attentionForContribution(contribution, input))
      .find(isPresent) ?? null;

  return { reasons, attention };
}
