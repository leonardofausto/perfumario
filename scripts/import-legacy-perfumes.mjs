import { runImport } from "./import-legacy-perfumes-core.ts";

const dryRun = process.argv.includes("--dry-run");
const targetEmail = process.argv
  .find((argument) => argument.startsWith("--target-email="))
  ?.slice("--target-email=".length);

try {
  const audit = await runImport({ dryRun, targetEmail });
  console.log(JSON.stringify(audit, null, 2));
  if (audit.failed.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
