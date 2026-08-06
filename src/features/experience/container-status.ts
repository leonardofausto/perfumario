import { z } from "zod";

import {
  CONTAINER_LEVELS,
  REPLENISHMENT_INTENTS_BY_CONTAINER,
  type ContainerLevel,
  type ReplenishmentIntent,
  isReplenishmentIntentAllowed,
} from "./types";

export const CONTAINER_LEVEL_LABELS: Record<ContainerLevel, string> = {
  unknown: "Não informado",
  full: "Cheio",
  half: "Pela metade",
  low: "No final",
  empty: "Acabou",
};

export const REPLENISHMENT_INTENT_LABELS: Record<ReplenishmentIntent, string> = {
  buy_decant: "Comprar outro decant",
  buy_bottle: "Comprar o frasco",
  buy_again: "Comprar novamente",
  review_later: "Avaliar depois",
  do_not_restock: "Não pretendo repor",
};

export const containerStatusSchema = z
  .object({
    bottleFormat: z.enum(["decant", "full_bottle"]),
    level: z.enum(CONTAINER_LEVELS),
    replenishmentIntent: z.enum([
      "buy_decant",
      "buy_bottle",
      "buy_again",
      "review_later",
      "do_not_restock",
    ]).nullable(),
  })
  .superRefine((value, context) => {
    if (
      value.replenishmentIntent &&
      !isReplenishmentIntentAllowed(value.bottleFormat, value.replenishmentIntent)
    ) {
      context.addIssue({
        code: "custom",
        message: "A intenção não é compatível com o tipo de recipiente.",
        path: ["replenishmentIntent"],
      });
    }
  });

export function canSetReplenishmentIntent(
  level: ContainerLevel,
  nextIntent: ReplenishmentIntent | null,
  currentIntent: ReplenishmentIntent | null,
) {
  return (
    nextIntent === null ||
    nextIntent === currentIntent ||
    level === "low" ||
    level === "empty"
  );
}

export function getContainerAlert(level: ContainerLevel) {
  if (level === "low") return { tone: "attention" as const, label: "No final" };
  if (level === "empty") return { tone: "action" as const, label: "Acabou" };
  return null;
}

export function intentsForContainer(bottleFormat: "decant" | "full_bottle") {
  return REPLENISHMENT_INTENTS_BY_CONTAINER[bottleFormat];
}
