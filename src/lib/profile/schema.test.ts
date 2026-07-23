import { describe, expect, it } from "vitest";

import { avatarSchema, profileSchema } from "./schema";

describe("profile validation", () => {
  it("trims the display name and limits it to 80 characters", () => {
    expect(profileSchema.parse({ displayName: "  Leonardo  " }).displayName).toBe("Leonardo");
    expect(profileSchema.safeParse({ displayName: "a".repeat(81) }).success).toBe(false);
  });

  it("rejects avatars over 5 MB or outside JPEG, PNG, and WebP", () => {
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "avatar.jpg", {
      type: "image/jpeg",
    });
    const wrongType = new File(["avatar"], "avatar.gif", { type: "image/gif" });

    expect(avatarSchema.safeParse(tooLarge).success).toBe(false);
    expect(avatarSchema.safeParse(wrongType).success).toBe(false);
  });
});
