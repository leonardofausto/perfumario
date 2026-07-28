import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: mocks.createServerSupabase,
}));

import { removePerfumeImages, uploadPerfumeCover } from "./image";

describe("private perfume images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads a cover with the original image format", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabase.mockResolvedValue({
      storage: { from: vi.fn(() => ({ upload })) },
    });
    const file = new File(["cover"], "cover.avif", { type: "image/avif" });

    const result = await uploadPerfumeCover({
      userId: "user-1",
      perfumeId: "perfume-1",
      file,
    });

    expect(result).toEqual({
      imagePath: "user-1/perfume-1/cover.avif",
    });
    expect(upload).toHaveBeenCalledWith(
      "user-1/perfume-1/cover.avif",
      file,
      expect.objectContaining({
        contentType: "image/avif",
        upsert: true,
      }),
    );
  });

  it("rejects an invalid image before contacting Storage", async () => {
    const from = vi.fn();
    mocks.createServerSupabase.mockResolvedValue({
      storage: { from },
    });

    await expect(
      uploadPerfumeCover({
        userId: "user-1",
        perfumeId: "perfume-1",
        file: new File(["gif"], "cover.gif", { type: "image/gif" }),
      }),
    ).rejects.toThrow("Imagem inválida");
    expect(from).not.toHaveBeenCalled();
  });

  it("removes every object below the owned perfume prefix", async () => {
    const list = vi.fn().mockResolvedValue({
      data: [{ name: "cover.webp" }, { name: "alternate.webp" }],
      error: null,
    });
    const remove = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabase.mockResolvedValue({
      storage: { from: vi.fn(() => ({ list, remove })) },
    });

    await removePerfumeImages({
      userId: "user-1",
      perfumeId: "perfume-1",
    });

    expect(remove).toHaveBeenCalledWith([
      "user-1/perfume-1/cover.webp",
      "user-1/perfume-1/alternate.webp",
    ]);
  });
});
