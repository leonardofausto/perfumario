import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(app)/perfil/actions", () => ({
  updateAvatarAction: vi.fn().mockResolvedValue({ status: "idle" }),
  updateProfileAction: vi.fn().mockResolvedValue({ status: "idle" }),
}));

import { ProfileForm } from "./profile-form";

describe("ProfileForm", () => {
  it("keeps email read-only and caps the display-name input", () => {
    render(
      <ProfileForm
        email="leo@example.com"
        profile={{ avatarUrl: null, displayName: "Leonardo" }}
      />,
    );

    expect(screen.getByLabelText("Nome de exibição")).toHaveAttribute("maxlength", "80");
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("E-mail")).toHaveValue("leo@example.com");
    expect(screen.getByLabelText("Foto do perfil")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp",
    );
  });
});
