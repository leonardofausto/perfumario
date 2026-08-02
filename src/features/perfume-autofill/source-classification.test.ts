import { describe, expect, it } from "vitest";

import type { AutofillSourceKind } from "./types";
import {
  classifySource,
  sourcePriority,
} from "./source-classification";

const policy = {
  officialHosts: ["lattafa.com"],
  specializedHosts: ["parfumo.com"],
  technicalHosts: ["example-technical.org"],
};

describe("source classification", () => {
  it("classifies configured hosts and subdomains without trusting suffix matches", () => {
    expect(classifySource("https://lattafa.com/perfumes/fakhar", policy)).toBe(
      "official",
    );
    expect(classifySource("https://www.parfumo.com/Perfumes/Lattafa/Fakhar", policy)).toBe(
      "specialized",
    );
    expect(
      classifySource("https://shop.example-technical.org/fakhar", policy),
    ).toBe("technical");
    expect(classifySource("https://lattafa.com.evil.example/fakhar", policy)).toBe(
      "community",
    );
  });

  it("prioritizes official, specialized, technical, and community sources", () => {
    expect(
      ([
        "community",
        "technical",
        "official",
        "specialized",
      ] satisfies AutofillSourceKind[]).sort(
        (left, right) => sourcePriority(left) - sourcePriority(right),
      ),
    ).toEqual(["official", "specialized", "technical", "community"]);
  });
});
