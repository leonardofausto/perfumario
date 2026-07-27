import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export type ImportManifestItem = {
  legacyKey: string;
  brand: string;
  name: string;
  description: string;
  concentration: string;
  bottleFormat: "decant" | "full_bottle";
  inspirationKind: "original" | "dupe" | "inspiration";
  inspiredBy: string | null;
  olfactoryFamilies: string[];
  isFavorite: boolean;
  imageLocalPath: string | null;
  imageSourceUrl: string | null;
  descriptionSourceUrls: string[];
  notes: Record<"top" | "heart" | "base", string[]>;
  scores: Array<{
    category: "accord" | "performance" | "season" | "occasion" | "time";
    metricKey: string;
    score: number | null;
  }>;
};

type ExistingItem = {
  legacyKey: string;
  fingerprint: string;
};

export function validateManifest(items: ImportManifestItem[]) {
  const keys = new Set<string>();

  for (const item of items) {
    if ("userId" in item) {
      throw new Error(`${item.legacyKey}: o manifesto não pode conter userId.`);
    }
    if (keys.has(item.legacyKey)) {
      throw new Error(`${item.legacyKey}: legacyKey duplicada.`);
    }
    if (item.imageSourceUrl && item.descriptionSourceUrls.length === 0) {
      throw new Error(`${item.legacyKey}: imagem externa sem fonte de descrição.`);
    }
    if (!item.brand.trim() || !item.name.trim() || !item.description.trim()) {
      throw new Error(`${item.legacyKey}: identidade ou descrição vazia.`);
    }
    keys.add(item.legacyKey);
  }

  return items;
}

function fingerprint(item: ImportManifestItem) {
  return createHash("sha256").update(JSON.stringify(item)).digest("hex");
}

export function canonicalImagePath(userId: string, perfumeId: string) {
  return `${userId}/${perfumeId}/cover.webp`;
}

export const planImport = Object.assign(
  (manifest: ImportManifestItem[], existing: ExistingItem[]) => {
    const byKey = new Map(existing.map((item) => [item.legacyKey, item.fingerprint]));

    return manifest.map((item) => ({
      legacyKey: item.legacyKey,
      operation: !byKey.has(item.legacyKey)
        ? ("create" as const)
        : byKey.get(item.legacyKey) === fingerprint(item)
          ? ("skip" as const)
          : ("update" as const),
    }));
  },
  { fingerprint },
);

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
}

async function loadManifest() {
  const manifestPath = path.resolve("data/perfume-import/collection.json");
  const content = await readFile(manifestPath, "utf8");
  return validateManifest(JSON.parse(content) as ImportManifestItem[]);
}

export async function runImport({
  dryRun,
  targetEmail: explicitTargetEmail,
}: {
  dryRun: boolean;
  targetEmail?: string;
}) {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secret =
    process.env.SUPABASE_SECRET_KEY ?? requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const targetEmail = explicitTargetEmail ?? requiredEnv("E2E_USER_EMAIL");
  const client = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const manifest = await loadManifest();
  let userId: string | null = null;
  let userPage = 1;
  while (!userId) {
    const { data, error } = await client.auth.admin.listUsers({
      page: userPage,
      perPage: 100,
    });
    if (error) throw error;
    userId =
      data.users.find(
        (candidate) =>
          candidate.email?.toLocaleLowerCase() === targetEmail.toLocaleLowerCase(),
      )?.id ?? null;
    if (userId || data.users.length < 100) break;
    userPage += 1;
  }
  if (!userId) throw new Error(`Usuário não encontrado para ${targetEmail}.`);
  const { data: existingRows, error: existingError } = await client
    .from("perfumes")
    .select("id, legacy_key, description_source_urls")
    .eq("user_id", userId)
    .in(
      "legacy_key",
      manifest.map((item) => item.legacyKey),
    );
  if (existingError) throw existingError;

  const existing = new Map(
    (existingRows ?? []).map((row) => [
      row.legacy_key as string,
      {
        id: row.id as string,
        fingerprint:
          (row.description_source_urls as string[]).find((source) =>
            source.startsWith("urn:perfumario:import-fingerprint:"),
          )?.replace("urn:perfumario:import-fingerprint:", "") ?? "",
      },
    ]),
  );
  const plan = planImport(
    manifest,
    [...existing.entries()].map(([legacyKey, value]) => ({
      legacyKey,
      fingerprint: value.fingerprint,
    })),
  );
  const audit = {
    targetEmail,
    targetUserId: userId,
    dryRun,
    created: [] as string[],
    updated: [] as string[],
    skipped: [] as string[],
    failed: [] as Array<{ legacyKey: string; message: string }>,
  };

  for (const [index, item] of manifest.entries()) {
    const operation = plan[index].operation;
    if (operation === "skip") {
      audit.skipped.push(item.legacyKey);
      continue;
    }
    if (dryRun) {
      audit[operation === "create" ? "created" : "updated"].push(item.legacyKey);
      continue;
    }

    try {
      const perfumeId = existing.get(item.legacyKey)?.id ?? randomUUID();
      const importFingerprint = `urn:perfumario:import-fingerprint:${fingerprint(item)}`;
      const descriptionSources = [
        ...item.descriptionSourceUrls.filter(
          (source) => !source.startsWith("urn:perfumario:import-fingerprint:"),
        ),
        importFingerprint,
      ];
      const perfumeRow = {
        id: perfumeId,
        user_id: userId,
        legacy_key: item.legacyKey,
        brand: item.brand,
        name: item.name,
        description: item.description,
        concentration: item.concentration,
        bottle_format: item.bottleFormat,
        inspiration_kind: item.inspirationKind,
        inspired_by: item.inspiredBy,
        olfactory_families: item.olfactoryFamilies,
        image_source_url: item.imageSourceUrl,
        description_source_urls: descriptionSources,
        is_favorite: item.isFavorite,
      };
      const perfumeResult =
        operation === "create"
          ? await client.from("perfumes").insert(perfumeRow)
          : await client
              .from("perfumes")
              .update(perfumeRow)
              .eq("id", perfumeId)
              .eq("user_id", userId);
      const perfumeError = perfumeResult.error;
      if (perfumeError) throw perfumeError;

      await client
        .from("perfume_notes")
        .delete()
        .eq("perfume_id", perfumeId)
        .eq("user_id", userId);
      const noteRows = Object.entries(item.notes).flatMap(([layer, notes]) =>
        notes.map((note, displayOrder) => ({
          perfume_id: perfumeId,
          user_id: userId,
          layer,
          note,
          display_order: displayOrder,
        })),
      );
      if (noteRows.length > 0) {
        const { error } = await client.from("perfume_notes").insert(noteRows);
        if (error) throw error;
      }

      await client
        .from("perfume_scores")
        .delete()
        .eq("perfume_id", perfumeId)
        .eq("user_id", userId);
      if (item.scores.length > 0) {
        const { error } = await client.from("perfume_scores").insert(
          item.scores.map((score) => ({
            perfume_id: perfumeId,
            user_id: userId,
            category: score.category,
            metric_key: score.metricKey,
            score: score.score,
          })),
        );
        if (error) throw error;
      }

      if (item.imageLocalPath) {
        const source = await readFile(path.resolve(item.imageLocalPath));
        const webp = await sharp(source)
          .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 88 })
          .toBuffer();
        const imagePath = canonicalImagePath(userId, perfumeId);
        const { error: uploadError } = await client.storage
          .from("perfume-images")
          .upload(imagePath, webp, {
            contentType: "image/webp",
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const { error: imageError } = await client
          .from("perfumes")
          .update({ image_path: imagePath })
          .eq("id", perfumeId)
          .eq("user_id", userId);
        if (imageError) throw imageError;
      }

      audit[operation === "create" ? "created" : "updated"].push(item.legacyKey);
    } catch (error) {
      audit.failed.push({
        legacyKey: item.legacyKey,
        message:
          error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 0) || String(error),
      });
    }
  }

  return audit;
}
