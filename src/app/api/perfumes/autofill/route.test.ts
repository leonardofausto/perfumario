import { describe, expect, it, vi } from "vitest";

import { createAutofillRoute } from "./route";

function request(body: unknown) {
  return new Request("https://perfumario.example/api/perfumes/autofill", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/perfumes/autofill", () => {
  it("requires a server-confirmed authenticated user", async () => {
    const execute = vi.fn();
    const POST = createAutofillRoute({
      getUser: vi.fn().mockResolvedValue(null),
      execute,
    });

    const response = await POST(request({ name: "Fakhar Black" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "unauthorized", message: "Autenticação obrigatória." },
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    [{ name: " " }],
    [{ name: "x".repeat(121) }],
    [{ name: "Fakhar Black", brand: "x".repeat(121) }],
    [{ name: "Fakhar Black", ignoreCache: "yes" }],
    [{ name: "Fakhar Black", bottleFormat: "full_bottle" }],
  ])("rejects invalid or prohibited input without leaking details", async (body) => {
    const execute = vi.fn();
    const POST = createAutofillRoute({
      getUser: vi.fn().mockResolvedValue({ id: "user-1" }),
      execute,
    });

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: { code: "invalid_request", message: "Entrada inválida." },
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("maps success and controlled operational outcomes without exposing internals", async () => {
    const outcomes = [
      [{ status: "success", cache: "miss", data: { safe: true } }, 200],
      [{ status: "partial", cache: "hit", data: { safe: true } }, 200],
      [{ status: "not_found" }, 404],
      [{ status: "rate_limited" }, 429],
      [{ status: "timeout" }, 504],
      [{ status: "invalid_model" }, 502],
      [{ status: "internal_error" }, 500],
    ] as const;

    for (const [outcome, expectedStatus] of outcomes) {
      const POST = createAutofillRoute({
        getUser: vi.fn().mockResolvedValue({ id: "user-1" }),
        execute: vi.fn().mockResolvedValue(outcome),
      });
      const response = await POST(
        request({
          name: " Fakhar Black ",
          brand: " Lattafa ",
          ignoreCache: true,
        }),
      );
      const payload = await response.json();

      expect(response.status).toBe(expectedStatus);
      expect(JSON.stringify(payload)).not.toContain("stack");
      expect(JSON.stringify(payload)).not.toContain("prompt");
      expect(JSON.stringify(payload)).not.toContain("key");
    }
  });

  it("converts unexpected dependency failures to a generic internal error", async () => {
    const POST = createAutofillRoute({
      getUser: vi.fn().mockResolvedValue({ id: "user-1" }),
      execute: vi.fn().mockRejectedValue(
        new Error("OPENAI_API_KEY=secret prompt=external stack=private"),
      ),
    });

    const response = await POST(request({ name: "Fakhar Black" }));
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(500);
    expect(serialized).toContain("internal_error");
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("prompt");
    expect(serialized).not.toContain("stack");
  });

  it("fails generically when authentication verification is unavailable", async () => {
    const POST = createAutofillRoute({
      getUser: vi.fn().mockRejectedValue(new Error("auth secret")),
      execute: vi.fn(),
    });

    const response = await POST(request({ name: "Fakhar Black" }));
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(500);
    expect(serialized).toContain("internal_error");
    expect(serialized).not.toContain("secret");
  });
});
