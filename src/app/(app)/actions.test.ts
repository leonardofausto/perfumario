import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: createServerSupabaseMock,
}));

import { logoutAction } from "./actions";

describe("logoutAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ends the Supabase session and redirects home", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseMock.mockResolvedValue({ auth: { signOut } });

    await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(signOut).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
