import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseMock, requireUserMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn(),
  requireUserMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: createServerSupabaseMock,
}));

import { updateAvatarAction } from "./actions";

function avatarData(file: File) {
  const data = new FormData();
  data.set("avatar", file);
  return data;
}

describe("profile avatar action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-123" });
  });

  it("stores the object below the authenticated user id", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    createServerSupabaseMock.mockResolvedValue({
      from: vi.fn(() => ({ update })),
      storage: { from: vi.fn(() => ({ remove, upload })) },
    });

    const result = await updateAvatarAction(
      { status: "idle" },
      avatarData(new File(["avatar"], "foto.png", { type: "image/png" })),
    );

    expect(upload.mock.calls[0][0]).toMatch(/^user-123\/avatar-[\w-]+\.png$/);
    expect(eq).toHaveBeenCalledWith("id", "user-123");
    expect(result.status).toBe("success");
  });

  it("does not update avatar_path after a failed upload", async () => {
    const upload = vi.fn().mockResolvedValue({ error: new Error("upload failed") });
    const update = vi.fn();
    createServerSupabaseMock.mockResolvedValue({
      from: vi.fn(() => ({ update })),
      storage: { from: vi.fn(() => ({ upload })) },
    });

    const result = await updateAvatarAction(
      { status: "idle" },
      avatarData(new File(["avatar"], "foto.webp", { type: "image/webp" })),
    );

    expect(update).not.toHaveBeenCalled();
    expect(result.status).toBe("error");
  });

  it("removes the new object when the profile update fails", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn().mockResolvedValue({ error: null });
    const eq = vi.fn().mockResolvedValue({ error: new Error("profile failed") });
    createServerSupabaseMock.mockResolvedValue({
      from: vi.fn(() => ({ update: vi.fn(() => ({ eq })) })),
      storage: { from: vi.fn(() => ({ remove, upload })) },
    });

    const result = await updateAvatarAction(
      { status: "idle" },
      avatarData(new File(["avatar"], "foto.jpg", { type: "image/jpeg" })),
    );

    const uploadedPath = upload.mock.calls[0][0];
    expect(remove).toHaveBeenCalledWith([uploadedPath]);
    expect(result.status).toBe("error");
  });
});
