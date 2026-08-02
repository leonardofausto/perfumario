import { afterEach, describe, expect, it } from "vitest";

import { getAutofillEnv } from "./env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("server-only autofill environment", () => {
  it("parses bounded operational configuration without exposing secrets publicly", () => {
    Object.assign(process.env, {
      TAVILY_API_KEY: "tavily-secret",
      OPENAI_API_KEY: "openai-secret",
      SUPABASE_SECRET_KEY: "supabase-secret",
      PERFUME_AUTOFILL_ENABLED: "true",
      PERFUME_AUTOFILL_MODEL: "gpt-5.6-terra",
      PERFUME_AUTOFILL_CACHE_TTL_SECONDS: "3600",
      PERFUME_AUTOFILL_RATE_LIMIT_MAX: "5",
      PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS: "600",
      PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS: "5000",
      PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS: "20000",
      PERFUME_AUTOFILL_MAX_RESULTS: "6",
      PERFUME_AUTOFILL_MAX_CONTENT_CHARS: "4000",
    });

    expect(getAutofillEnv()).toEqual({
      TAVILY_API_KEY: "tavily-secret",
      OPENAI_API_KEY: "openai-secret",
      SUPABASE_SECRET_KEY: "supabase-secret",
      PERFUME_AUTOFILL_ENABLED: true,
      PERFUME_AUTOFILL_MODEL: "gpt-5.6-terra",
      PERFUME_AUTOFILL_CACHE_TTL_SECONDS: 3600,
      PERFUME_AUTOFILL_RATE_LIMIT_MAX: 5,
      PERFUME_AUTOFILL_RATE_LIMIT_WINDOW_SECONDS: 600,
      PERFUME_AUTOFILL_PROVIDER_TIMEOUT_MS: 5000,
      PERFUME_AUTOFILL_REQUEST_TIMEOUT_MS: 20000,
      PERFUME_AUTOFILL_MAX_RESULTS: 6,
      PERFUME_AUTOFILL_MAX_CONTENT_CHARS: 4000,
    });
  });

  it("fails closed for missing secrets or unsafe limits", () => {
    process.env.PERFUME_AUTOFILL_ENABLED = "true";
    delete process.env.TAVILY_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    expect(() => getAutofillEnv()).toThrow();

    process.env.TAVILY_API_KEY = "tavily-secret";
    process.env.OPENAI_API_KEY = "openai-secret";
    process.env.SUPABASE_SECRET_KEY = "supabase-secret";
    process.env.PERFUME_AUTOFILL_MAX_RESULTS = "1000";
    expect(() => getAutofillEnv()).toThrow();
  });
});
