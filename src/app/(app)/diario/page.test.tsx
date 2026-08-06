import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listOwnPerfumes: vi.fn(),
  listOwnUsages: vi.fn(),
}));

vi.mock("@/features/perfumes/queries", () => ({
  listOwnPerfumes: mocks.listOwnPerfumes,
}));
vi.mock("@/features/usage-log/repository", () => ({
  listOwnUsages: mocks.listOwnUsages,
}));
vi.mock("@/components/usage-log/usage-diary", () => ({
  UsageDiary: ({ initialPage }: { initialPage: { items: unknown[] } }) => (
    <div data-testid="diary">{initialPage.items.length} usos</div>
  ),
}));

import UsageDiaryPage from "./page";

describe("UsageDiaryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listOwnPerfumes.mockResolvedValue([]);
    mocks.listOwnUsages.mockResolvedValue({ items: [], nextCursor: null });
  });

  it("loads only the private repositories and renders the approved header", async () => {
    render(
      await UsageDiaryPage({
        searchParams: Promise.resolve({ period: "7d", compliments: "with" }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Diário de uso" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Registre e acompanhe suas experiências."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("diary")).toHaveTextContent("0 usos");
    expect(mocks.listOwnPerfumes).toHaveBeenCalledOnce();
    expect(mocks.listOwnUsages).toHaveBeenCalledWith(
      expect.objectContaining({
        compliments: "with",
        limit: 12,
        order: "newest",
      }),
    );
  });
});
