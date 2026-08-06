import { z } from "zod";

import { ANALYTICS_PERIODS } from "./types";

function isTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export const analyticsFilterSchema = z.object({
  period: z.enum(ANALYTICS_PERIODS),
  timezone: z.string().trim().min(1).max(80).refine(isTimezone, "Timezone inválido."),
});
