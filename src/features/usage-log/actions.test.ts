import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createOwnUsage: vi.fn(),
  deleteOwnUsage: vi.fn(),
  revalidatePath: vi.fn(),
  updateOwnUsage: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("./repository", () => ({
  createOwnUsage: mocks.createOwnUsage,
  deleteOwnUsage: mocks.deleteOwnUsage,
  updateOwnUsage: mocks.updateOwnUsage,
}));

import {
  createUsageAction,
  deleteUsageAction,
  updateUsageAction,
} from "./actions";

function validFormData() {
  const data = new FormData();
  data.set("perfumeId", "11111111-1111-4111-8111-111111111111");
  data.set("usedAt", "2026-08-03T12:00");
  data.set("occasionKey", "trabalho");
  data.set("timeKey", "manha");
  data.set("environmentKey", "fechado");
  data.set("complimentsCount", "0");
  data.set("satisfaction", "4");
  data.set("performanceRating", "");
  data.set("weatherSource", "");
  data.set("temperature", "");
  data.set("feelsLike", "");
  data.set("weatherCondition", "");
  data.set("seasonKey", "");
  data.set("city", "");
  data.set("notes", "");
  return data;
}

describe("usage actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a usage with zero compliments and optional fields absent", async () => {
    mocks.createOwnUsage.mockResolvedValue({ id: "usage-1" });

    const result = await createUsageAction({ status: "idle" }, validFormData());

    expect(result).toMatchObject({ status: "success", message: "Uso registrado." });
    expect(mocks.createOwnUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        complimentsCount: 0,
        performanceRating: null,
        weatherSource: null,
        notes: null,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/diario");
  });

  it("returns field errors before persistence when required values are invalid", async () => {
    const data = validFormData();
    data.set("satisfaction", "8");

    const result = await createUsageAction({ status: "idle" }, data);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.satisfaction).toBeDefined();
    expect(mocks.createOwnUsage).not.toHaveBeenCalled();
  });

  it("updates and deletes through owner-scoped repository functions", async () => {
    mocks.updateOwnUsage.mockResolvedValue({ id: "usage-1" });
    mocks.deleteOwnUsage.mockResolvedValue(true);

    await expect(
      updateUsageAction("22222222-2222-4222-8222-222222222222", { status: "idle" }, validFormData()),
    ).resolves.toMatchObject({ status: "success" });
    await expect(
      deleteUsageAction("22222222-2222-4222-8222-222222222222"),
    ).resolves.toMatchObject({ status: "success" });

    expect(mocks.updateOwnUsage).toHaveBeenCalled();
    expect(mocks.deleteOwnUsage).toHaveBeenCalled();
  });
});
