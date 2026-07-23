import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("../supabase/server", () => ({
  createServerSupabase: createServerSupabaseMock,
}));

import { getOptionalUser, requireUser } from "./session";

const user = { id: "d4ba822c-77ca-456f-a953-528eae0b3ca7" } as User;

describe("server session authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user", async () => {
    createServerSupabaseMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    });

    await expect(getOptionalUser()).resolves.toBe(user);
  });

  it("returns null when Supabase rejects the session", async () => {
    createServerSupabaseMock.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: new Error("invalid") }),
      },
    });

    await expect(getOptionalUser()).resolves.toBeNull();
  });

  it("redirects anonymous requests to login", async () => {
    createServerSupabaseMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    });

    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
