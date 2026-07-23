import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const checker = join(import.meta.dirname, "check-stable-deps.mjs");

test("rejects prerelease dependency versions", () => {
  const directory = mkdtempSync(join(tmpdir(), "perfumario-stable-"));
  const manifest = join(directory, "package.json");

  writeFileSync(
    manifest,
    JSON.stringify({ dependencies: { next: "17.0.0-canary.1" } }),
  );

  assert.throws(
    () => execFileSync(process.execPath, [checker, manifest], { encoding: "utf8" }),
    (error) => {
      assert.match(`${error.stdout}${error.stderr}`, /Prerelease dependency/);
      return true;
    },
  );
});
