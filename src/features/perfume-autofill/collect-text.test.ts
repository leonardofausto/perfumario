import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { collectPermittedText } from "./collect-text";

const fixture = readFileSync(
  join(
    process.cwd(),
    "src/features/perfume-autofill/__fixtures__/external-page.html",
  ),
  "utf8",
);

const publicResolver = vi.fn(async () => ["93.184.216.34"]);

describe("collectPermittedText", () => {
  it("removes active content and preserves final provenance", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "https://www.example.com/final#section" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(fixture, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );

    await expect(
      collectPermittedText("https://example.com/start", {
        fetchImpl,
        maxBytes: 10_000,
        maxContentChars: 1_000,
        maxRedirects: 2,
        now: () => new Date("2026-08-02T20:00:00.000Z"),
        resolveHost: publicResolver,
        timeoutMs: 100,
      }),
    ).resolves.toEqual({
      canonicalUrl: "https://www.example.com/final",
      collectedAt: "2026-08-02T20:00:00.000Z",
      content: "Fragrância fictícia Conteúdo permitido para teste.",
      title: "Evidência de teste",
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchImpl.mock.calls) {
      expect(init).toMatchObject({ redirect: "manual" });
    }
  });

  it.each([
    "http://127.0.0.1/private",
    "http://[::1]/private",
    "file:///etc/passwd",
    "https://user:password@example.com/private",
  ])("blocks unsafe URL %s before fetch", async (url) => {
    const fetchImpl = vi.fn();

    await expect(
      collectPermittedText(url, {
        fetchImpl,
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow(/não permitid/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("blocks public hostnames resolving to private addresses", async () => {
    const fetchImpl = vi.fn();

    await expect(
      collectPermittedText("https://example.com/private", {
        fetchImpl,
        resolveHost: vi.fn(async () => ["10.0.0.8"]),
      }),
    ).rejects.toThrow("endereço de rede não permitido");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("revalidates redirects and blocks cloud metadata destinations", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: "http://169.254.169.254/latest/meta-data" },
      }),
    );

    await expect(
      collectPermittedText("https://example.com/start", {
        fetchImpl,
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow(/não permitid/i);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("enforces content type, redirect, and body size limits", async () => {
    await expect(
      collectPermittedText("https://example.com/image", {
        fetchImpl: vi.fn().mockResolvedValue(
          new Response("binary", {
            headers: { "content-type": "image/png" },
          }),
        ),
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow("Tipo de conteúdo não permitido");

    await expect(
      collectPermittedText("https://example.com/large", {
        fetchImpl: vi.fn().mockResolvedValue(
          new Response("x".repeat(101), {
            headers: { "content-type": "text/plain" },
          }),
        ),
        maxBytes: 100,
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow("Conteúdo excede o limite");

    await expect(
      collectPermittedText("https://example.com/redirect", {
        fetchImpl: vi.fn().mockResolvedValue(
          new Response(null, {
            status: 302,
            headers: { location: "/again" },
          }),
        ),
        maxRedirects: 0,
        resolveHost: publicResolver,
      }),
    ).rejects.toThrow("Redirecionamentos excedem o limite");
  });
});
