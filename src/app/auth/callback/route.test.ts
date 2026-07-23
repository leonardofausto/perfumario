import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: createServerSupabaseMock,
}));

import { GET } from "./route";

describe("auth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an external next destination", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseMock.mockResolvedValue({ auth: { exchangeCodeForSession } });
    const request = new NextRequest(
      "https://perfumario.example/auth/callback?code=abc&next=https://evil.example",
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://perfumario.example/dashboard");
  });

  it("allows the password-reset destination", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseMock.mockResolvedValue({ auth: { exchangeCodeForSession } });
    const request = new NextRequest(
      "https://perfumario.example/auth/callback?code=abc&next=/redefinir-senha",
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://perfumario.example/redefinir-senha",
    );
  });
});
