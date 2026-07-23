import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseMock, headersMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn(),
  headersMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: createServerSupabaseMock,
}));

import {
  loginAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "./actions";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("authentication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ origin: "https://perfumario.example" }));
  });

  it("does not call Supabase when login fields are invalid", async () => {
    const result = await loginAction(
      { status: "idle" },
      formData({ email: "invalido", password: "" }),
    );

    expect(createServerSupabaseMock).not.toHaveBeenCalled();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(result.fieldErrors?.password).toBeDefined();
  });

  it("returns a neutral login error and retains the email", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: new Error("invalid") });
    createServerSupabaseMock.mockResolvedValue({ auth: { signInWithPassword } });

    const result = await loginAction(
      { status: "idle" },
      formData({ email: "pessoa@example.com", password: "segredo" }),
    );

    expect(result).toMatchObject({
      status: "error",
      message: "Não foi possível entrar com essas credenciais.",
      fields: { email: "pessoa@example.com" },
    });
  });

  it("redirects a successful login to the dashboard", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseMock.mockResolvedValue({ auth: { signInWithPassword } });

    await expect(
      loginAction(
        { status: "idle" },
        formData({ email: "pessoa@example.com", password: "segredo" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("returns the same recovery message when Supabase accepts or rejects", async () => {
    const resetPasswordForEmail = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("unknown email") });
    createServerSupabaseMock.mockResolvedValue({ auth: { resetPasswordForEmail } });

    const first = await requestPasswordResetAction(
      { status: "idle" },
      formData({ email: "pessoa@example.com" }),
    );
    const second = await requestPasswordResetAction(
      { status: "idle" },
      formData({ email: "outra@example.com" }),
    );

    expect(first.message).toBe(second.message);
    expect(resetPasswordForEmail).toHaveBeenCalledWith("pessoa@example.com", {
      redirectTo: "https://perfumario.example/auth/callback?next=/redefinir-senha",
    });
  });

  it("does not call Supabase when the recovery email is invalid", async () => {
    const result = await requestPasswordResetAction(
      { status: "idle" },
      formData({ email: "invalido" }),
    );

    expect(createServerSupabaseMock).not.toHaveBeenCalled();
    expect(result.fieldErrors?.email).toBeDefined();
  });

  it("requires matching passwords with at least eight characters", async () => {
    const result = await resetPasswordAction(
      { status: "idle" },
      formData({ password: "curta", confirmPassword: "diferente" }),
    );

    expect(createServerSupabaseMock).not.toHaveBeenCalled();
    expect(result.fieldErrors?.password).toBeDefined();
    expect(result.fieldErrors?.confirmPassword).toBeDefined();
  });

  it("updates the password, ends the recovery session, and redirects", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    createServerSupabaseMock.mockResolvedValue({ auth: { signOut, updateUser } });

    await expect(
      resetPasswordAction(
        { status: "idle" },
        formData({ password: "nova-senha", confirmPassword: "nova-senha" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(updateUser).toHaveBeenCalledWith({ password: "nova-senha" });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(redirectMock).toHaveBeenCalledWith("/login?senha=alterada");
  });
});
