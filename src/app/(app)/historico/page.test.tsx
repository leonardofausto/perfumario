import { describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import HistoryPage from "./page";

describe("HistoryPage compatibility route", () => {
  it("keeps old bookmarks working by forwarding to the usage diary", () => {
    HistoryPage();

    expect(redirectMock).toHaveBeenCalledWith("/diario");
  });
});
