import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabase: vi.fn(),
  redirect: vi.fn(),
  removePerfumeImages: vi.fn(),
  requireUser: vi.fn(),
  revalidatePath: vi.fn(),
  uploadPerfumeCover: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: mocks.createServerSupabase,
}));
vi.mock("./image", () => ({
  removePerfumeImages: mocks.removePerfumeImages,
  uploadPerfumeCover: mocks.uploadPerfumeCover,
}));

import {
  createPerfumeAction,
  deletePerfumeAction,
  toggleFavoriteAction,
  updatePerfumeAction,
} from "./actions";

function validFormData() {
  const data = new FormData();
  data.set("brand", "Natura");
  data.set("name", "Essencial");
  data.set("description", "Amadeirado intenso.");
  data.set("concentration", "eau_de_parfum");
  data.set("bottleFormat", "full_bottle");
  data.set("inspirationKind", "original");
  data.set("inspiredBy", "");
  data.set("olfactoryFamilies", JSON.stringify(["Amadeirado"]));
  data.set(
    "notes",
    JSON.stringify({
      top: ["Bergamota"],
      heart: ["Cedro"],
      base: ["Âmbar"],
    }),
  );
  data.set(
    "scores",
    JSON.stringify([
      { category: "performance", metricKey: "fixacao", score: 85 },
    ]),
  );
  return data;
}

describe("perfume mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user-1" });
  });

  it("creates the parent and children atomically through one RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: "perfume-1", error: null });
    mocks.createServerSupabase.mockResolvedValue({ rpc });

    const result = await createPerfumeAction({ status: "idle" }, validFormData());

    expect(result.status).toBe("success");
    expect(rpc).toHaveBeenCalledWith(
      "create_perfume",
      expect.objectContaining({
        p_user_id: "user-1",
        p_brand: "Natura",
        p_notes: expect.any(Array),
        p_scores: expect.any(Array),
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/colecao");
    expect(mocks.redirect).toHaveBeenCalledWith("/colecao/perfume-1");
  });

  it("returns field errors without calling Supabase for invalid data", async () => {
    const rpc = vi.fn();
    mocks.createServerSupabase.mockResolvedValue({ rpc });
    const formData = validFormData();
    formData.set("brand", " ");

    const result = await createPerfumeAction({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.brand).toBeDefined();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("updates only an owned perfume through the atomic RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    mocks.createServerSupabase.mockResolvedValue({ rpc });

    const result = await updatePerfumeAction(
      "perfume-1",
      { status: "idle" },
      validFormData(),
    );

    expect(result.status).toBe("success");
    expect(rpc).toHaveBeenCalledWith(
      "update_perfume",
      expect.objectContaining({
        p_id: "perfume-1",
        p_user_id: "user-1",
      }),
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/colecao/perfume-1");
  });

  it("favorites only the authenticated user's perfume", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const update = vi.fn(() => ({ eq: firstEq }));
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => ({ update })),
    });

    const result = await toggleFavoriteAction("perfume-1", true);

    expect(result.status).toBe("success");
    expect(update).toHaveBeenCalledWith({ is_favorite: true });
    expect(firstEq).toHaveBeenCalledWith("id", "perfume-1");
    expect(secondEq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("deletes only an owned perfume and then removes its private images", async () => {
    const deleteUserEq = vi.fn().mockResolvedValue({ error: null });
    const deleteIdEq = vi.fn(() => ({ eq: deleteUserEq }));
    const selectSingle = vi.fn().mockResolvedValue({
      data: { image_path: "user-1/perfume-1/cover.webp" },
      error: null,
    });
    const selectUserEq = vi.fn(() => ({ maybeSingle: selectSingle }));
    const selectIdEq = vi.fn(() => ({ eq: selectUserEq }));
    mocks.createServerSupabase.mockResolvedValue({
      from: vi.fn(() => ({
        delete: vi.fn(() => ({ eq: deleteIdEq })),
        select: vi.fn(() => ({ eq: selectIdEq })),
      })),
    });

    const result = await deletePerfumeAction("perfume-1");

    expect(result.status).toBe("success");
    expect(deleteIdEq).toHaveBeenCalledWith("id", "perfume-1");
    expect(deleteUserEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(mocks.removePerfumeImages).toHaveBeenCalledWith({
      userId: "user-1",
      perfumeId: "perfume-1",
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/colecao");
  });
});
