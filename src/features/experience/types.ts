import type { BottleFormat } from "@/features/perfumes/types";

export const CONTAINER_LEVELS = [
  "unknown",
  "full",
  "half",
  "low",
  "empty",
] as const;

export type ContainerLevel = (typeof CONTAINER_LEVELS)[number];
export type ContainerType = BottleFormat;

export const REPLENISHMENT_INTENTS_BY_CONTAINER = {
  decant: ["buy_decant", "buy_bottle", "review_later", "do_not_restock"],
  full_bottle: ["buy_again", "review_later", "do_not_restock"],
} as const satisfies Record<ContainerType, readonly string[]>;

export type ReplenishmentIntentFor<T extends ContainerType> =
  (typeof REPLENISHMENT_INTENTS_BY_CONTAINER)[T][number];

export type ReplenishmentIntent = ReplenishmentIntentFor<ContainerType>;

export function isReplenishmentIntentAllowed<T extends ContainerType>(
  containerType: T,
  intent: ReplenishmentIntent,
): intent is ReplenishmentIntentFor<T> {
  return (REPLENISHMENT_INTENTS_BY_CONTAINER[containerType] as readonly string[]).includes(
    intent,
  );
}

export type UsageRecordBase = {
  id: string;
  userId: string;
  perfumeId: string;
  usedAt: string;
};

export type AnalyticsAggregate<TMetric extends string = string> = {
  metric: TMetric;
  value: number;
  hasEnoughData: boolean;
};
