import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync(process.argv[2] ?? "package.json", "utf8"),
);
const blocked =
  /(?:^|[.-])(alpha|beta|canary|rc|next|preview|experimental)(?:[.-]|$)/i;
const entries = Object.entries({
  ...manifest.dependencies,
  ...manifest.devDependencies,
});
const invalid = entries.filter(([, version]) => blocked.test(version));

if (invalid.length) {
  console.error(
    `Prerelease dependency: ${invalid
      .map(([name, version]) => `${name}@${version}`)
      .join(", ")}`,
  );
  process.exit(1);
}
