import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const enabledSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const autofillEnvSchema = z
  .object({
    TAVILY_API_KEY: z.string().trim().min(1).optional(),
    OPENAI_API_KEY: z.string().trim().min(1).optional(),
    SUPABASE_SECRET_KEY: z.string().trim().min(1).optional(),
    PERFUME_AUTOFILL_ENABLED: enabledSchema,
    PERFUME_AUTOFILL_MODEL: z.string().trim().min(1).default("gpt-5.6-terra"),
    PERFUME_AUTOFILL_CACHE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(60)
      .max(2_592_000)
      .default(604_800),
    PERFUME_AUTOFILL_RATE_LIMIT_MAX: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),
    PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS: z.coerce
      .number()
      .int()
      .min(60)
      .max(86_400)
      .default(3_600),
    PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(500)
      .max(20_000)
      .default(8_000),
    PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(30_000)
      .default(25_000),
    PERFUME_AUTOFILL_MAX_RESULTS: z.coerce
      .number()
      .int()
      .min(1)
      .max(10)
      .default(6),
    PERFUME_AUTOFILL_MAX_CONTENT_CHARS: z.coerce
      .number()
      .int()
      .min(200)
      .max(8_000)
      .default(4_000),
  })
  .superRefine((env, context) => {
    if (!env.PERFUME_AUTOFILL_ENABLED) return;
    if (!env.TAVILY_API_KEY) {
      context.addIssue({
        code: "custom",
        message: "TAVILY_API_KEY obrigatória quando o autofill está ativo.",
        path: ["TAVILY_API_KEY"],
      });
    }
    if (!env.OPENAI_API_KEY) {
      context.addIssue({
        code: "custom",
        message: "OPENAI_API_KEY obrigatória quando o autofill está ativo.",
        path: ["OPENAI_API_KEY"],
      });
    }
    if (!env.SUPABASE_SECRET_KEY) {
      context.addIssue({
        code: "custom",
        message: "SUPABASE_SECRET_KEY obrigatória quando o autofill está ativo.",
        path: ["SUPABASE_SECRET_KEY"],
      });
    }
  });

export function getPublicEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getAutofillEnv() {
  return autofillEnvSchema.parse({
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    PERFUME_AUTOFILL_ENABLED: process.env.PERFUME_AUTOFILL_ENABLED,
    PERFUME_AUTOFILL_MODEL: process.env.PERFUME_AUTOFILL_MODEL,
    PERFUME_AUTOFILL_CACHE_TTL_SECONDS:
      process.env.PERFUME_AUTOFILL_CACHE_TTL_SECONDS,
    PERFUME_AUTOFILL_RATE_LIMIT_MAX:
      process.env.PERFUME_AUTOFILL_RATE_LIMIT_MAX,
    PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS:
      process.env.PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS,
    PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS:
      process.env.PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS,
    PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS:
      process.env.PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS,
    PERFUME_AUTOFILL_MAX_RESULTS:
      process.env.PERFUME_AUTOFILL_MAX_RESULTS,
    PERFUME_AUTOFILL_MAX_CONTENT_CHARS:
      process.env.PERFUME_AUTOFILL_MAX_CONTENT_CHARS,
  });
}
