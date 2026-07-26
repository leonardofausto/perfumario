# Persistent Perfume Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkboxes so progress can be resumed without rereading the whole repository.

**Goal:** Replace the browser-only perfume collection with a private Supabase-backed gallery where each perfume has a dedicated, visually rich detail page, editable structured data, private imagery, deterministic favorite ordering, and responsive three-column desktop presentation.

**Architecture:** Supabase Postgres and Storage become the source of truth. Server-only query and mutation modules enforce the authenticated user boundary, while App Router pages render collection, detail, create, and edit surfaces. Small presentational components render the olfactory pyramid, family colors, performance radar, and climate/occasion/time scores without adding a chart dependency.

**Tech Stack:** Next.js App Router, React, TypeScript, Zod, Supabase Auth/Postgres/Storage, Vitest, Testing Library, Playwright, SQL policy tests, CSS modules/global CSS, Graphify.

## Global Constraints

- Preserve the existing dirty worktree. Do not reset, clean, delete, or overwrite the user's current collection/dashboard/recommender work.
- Work in the current workspace unless the user explicitly asks to isolate or first commits the existing WIP.
- Use `graphify query`, `graphify affected`, or `graphify explain` before broad source reads. Run `graphify update .` only after implementation changes are complete.
- Follow TDD: add one focused failing test, confirm the intended failure, implement the smallest behavior, then rerun that focused test.
- Use focused tests during Tasks 1–9. Run the full validation matrix once in Task 10 to avoid redundant token and compute cost.
- Keep all data private per authenticated user. Every database query, mutation, Storage operation, and signed URL must be scoped to `auth.uid()`.
- Do not hard-code a user UUID in migrations or import scripts.
- Do not introduce a chart library for the first version; render the radar as accessible SVG.
- Use official brand, manufacturer, or authorized distributor pages as preferred image/description sources. Record every source URL. Do not treat search thumbnails as licensed assets.
- Keep dependency versions stable unless a required implementation cannot be completed with the current stack.
- Commit only files belonging to the current task. Never sweep unrelated dirty files into a commit.

---

## Task 1: Create the private Supabase persistence layer

**Files:**

- Create via CLI: `supabase/migrations/<generated_timestamp>_persistent_perfume_collection.sql`
- Create: `supabase/tests/perfumes_rls.sql`
- Reference: `supabase/migrations/20260723003616_foundation_profiles.sql`
- Reference: `supabase/tests/profiles_rls.sql`

- [ ] **Step 1: Generate the migration file without inventing a timestamp**

Run:

```powershell
npx supabase migration new persistent_perfume_collection
```

Store the exact generated path in `$migrationPath` for the remaining steps.

- [ ] **Step 2: Write failing SQL policy tests**

Cover:

- authenticated user can insert, select, update, and delete their own perfume;
- a second authenticated user cannot read or mutate it;
- child notes and scores cannot cross the perfume owner boundary;
- deleting a perfume cascades to its notes and scores;
- private `perfume-images` objects are visible and mutable only under the current user's first path segment;
- uniqueness and inspiration constraints reject invalid rows.

Run:

```powershell
npx supabase db reset
npx supabase test db supabase/tests/perfumes_rls.sql
```

Expected: FAIL because the tables, constraints, bucket, and policies do not exist.

- [ ] **Step 3: Implement tables, indexes, constraints, triggers, RLS, and Storage policies**

Create:

- `public.perfumes`;
- `public.perfume_notes`;
- `public.perfume_scores`;
- private bucket `perfume-images`, 5 MB limit, MIME types `image/jpeg`, `image/png`, `image/webp`;
- owner-only RLS policies using `(select auth.uid())`;
- composite ownership foreign keys `(perfume_id, user_id)`;
- indexes supporting `user_id`, favorite-first/name ordering, and child lookups;
- `updated_at` triggers using the project's existing trigger convention.

Enforce:

```sql
unique (id, user_id)
```

```sql
unique (user_id, legacy_key) where legacy_key is not null
```

```sql
check (
  (inspiration_kind = 'original' and inspired_by is null)
  or
  (inspiration_kind in ('dupe', 'inspiration') and nullif(trim(inspired_by), '') is not null)
)
```

Storage object names must follow:

```text
{user_id}/{perfume_id}/cover.webp
```

- [ ] **Step 4: Prove the database behavior**

Run:

```powershell
npx supabase db reset
npx supabase test db supabase/tests/perfumes_rls.sql
npx supabase db lint
```

Expected: PASS with no policy or schema errors.

- [ ] **Step 5: Commit the persistence layer**

```powershell
git add -- $migrationPath supabase/tests/perfumes_rls.sql
git commit -m "feat: add private perfume persistence"
```

---

## Task 2: Define the perfume domain contract and validation

**Files:**

- Create: `src/features/perfumes/types.ts`
- Create: `src/features/perfumes/constants.ts`
- Create: `src/features/perfumes/schema.ts`
- Create: `src/features/perfumes/schema.test.ts`
- Reference: `src/lib/profile/schema.ts`

- [ ] **Step 1: Write failing schema tests**

Test:

- valid original perfume with `inspiredBy: null`;
- dupe/inspiration requires `inspiredBy`;
- concentration and bottle format accept only approved values;
- all scores are integers from 0 through 100 or `null`;
- image accepts JPEG, PNG, or WebP up to 5 MB;
- top, heart, and base notes preserve display order;
- empty brand, name, description, or olfactory family is rejected.

Run:

```powershell
npm.cmd test -- src/features/perfumes/schema.test.ts
```

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 2: Implement constants and types**

Export:

```ts
export type NoteLayer = "top" | "heart" | "base";
export type ScoreCategory = "performance" | "season" | "occasion" | "time";
export type InspirationKind = "original" | "dupe" | "inspiration";
export type BottleFormat = "decant" | "full_bottle";
```

Define:

```ts
export interface PerfumeScore {
  category: ScoreCategory;
  metricKey: string;
  score: number | null;
}

export interface PerfumeSummary {
  id: string;
  brand: string;
  name: string;
  concentration: string;
  bottleFormat: BottleFormat;
  inspirationKind: InspirationKind;
  inspiredBy: string | null;
  olfactoryFamilies: string[];
  imageUrl: string | null;
  isFavorite: boolean;
}

export interface PerfumeDetail extends PerfumeSummary {
  description: string;
  imagePath: string | null;
  imageSourceUrl: string | null;
  descriptionSourceUrls: string[];
  notes: Record<NoteLayer, string[]>;
  scores: PerfumeScore[];
  createdAt: string;
  updatedAt: string;
}
```

Constants must include:

- performance: `fixacao`, `projecao`, `rastro`, `versatilidade`, `presenca`;
- seasons: `primavera`, `verao`, `outono`, `inverno`;
- occasions: `trabalho`, `casual`, `encontro`, `formal`, `festa`, `ar_livre`;
- times: `manha`, `tarde`, `noite`, `madrugada`.

- [ ] **Step 3: Implement Zod schemas**

Export:

```ts
export const perfumeFormSchema: z.ZodType<PerfumeFormInput>;
export const perfumeImageSchema: z.ZodType<File>;
```

Normalize trimmed strings and form-array inputs in one place so create and edit use identical validation.

- [ ] **Step 4: Run the focused test**

```powershell
npm.cmd test -- src/features/perfumes/schema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the domain contract**

```powershell
git add -- src/features/perfumes/types.ts src/features/perfumes/constants.ts src/features/perfumes/schema.ts src/features/perfumes/schema.test.ts
git commit -m "feat: define perfume domain contract"
```

---

## Task 3: Add authenticated server queries and signed image URLs

**Files:**

- Create: `src/features/perfumes/queries.ts`
- Create: `src/features/perfumes/queries.test.ts`
- Reference: `src/lib/profile/queries.ts`
- Reference: `src/lib/supabase/server.ts`
- Reference: `src/lib/auth/require-user.ts`

- [ ] **Step 1: Write failing query tests**

Mock the server Supabase client and test:

- `listOwnPerfumes()` always filters by the authenticated user's ID;
- ordering is `is_favorite DESC`, then case-insensitive `name ASC`, then `brand ASC`;
- list images use one batched `createSignedUrls` request;
- `getOwnPerfume(id)` fetches parent, ordered notes, and scores only for the owner;
- missing or foreign perfume returns `null`;
- `getOwnPerfumeDashboard()` returns total, favorite count, and recent summaries without loading full detail payloads.

Run:

```powershell
npm.cmd test -- src/features/perfumes/queries.test.ts
```

Expected: FAIL because `queries.ts` does not exist.

- [ ] **Step 2: Implement query interfaces**

Export:

```ts
export async function listOwnPerfumes(): Promise<PerfumeSummary[]>;
export async function getOwnPerfume(id: string): Promise<PerfumeDetail | null>;
export async function getOwnPerfumeDashboard(): Promise<{
  totalCount: number;
  favoriteCount: number;
  recent: PerfumeSummary[];
}>;
```

Use `requireUser()` before querying. Convert snake_case database rows into domain types at the module boundary.

- [ ] **Step 3: Implement private image URL resolution**

For collection lists, batch distinct paths through:

```ts
supabase.storage.from("perfume-images").createSignedUrls(paths, 3600)
```

For one detail, use a single signed URL. An absent image or failed signature must produce `imageUrl: null`, not fail the entire page.

- [ ] **Step 4: Run the focused test**

```powershell
npm.cmd test -- src/features/perfumes/queries.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit queries**

```powershell
git add -- src/features/perfumes/queries.ts src/features/perfumes/queries.test.ts
git commit -m "feat: query private perfume collection"
```

---

## Task 4: Implement mutations, favorite reordering, deletion, and image upload

**Files:**

- Create: `src/features/perfumes/actions.ts`
- Create: `src/features/perfumes/actions.test.ts`
- Create: `src/features/perfumes/image.ts`
- Create: `src/features/perfumes/image.test.ts`
- Reference: `src/app/(app)/perfil/actions.ts`
- Reference: `src/lib/actions/action-state.ts`

- [ ] **Step 1: Write failing mutation tests**

Test:

- create inserts the owner ID and all child rows;
- update checks ownership and replaces notes/scores transactionally;
- favorite changes only `is_favorite` and revalidates collection/detail/dashboard/recommender paths;
- delete removes the database record and then its owned Storage prefix;
- invalid form returns `ActionState` field errors;
- foreign IDs cannot be changed;
- failed image validation never uploads;
- uploaded cover is normalized to the canonical object path.

Run:

```powershell
npm.cmd test -- src/features/perfumes/actions.test.ts src/features/perfumes/image.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 2: Implement image validation and upload helper**

Export:

```ts
export async function uploadPerfumeCover(input: {
  userId: string;
  perfumeId: string;
  file: File;
}): Promise<{ imagePath: string }>;

export async function removePerfumeImages(input: {
  userId: string;
  perfumeId: string;
}): Promise<void>;
```

Upload with `upsert: true` only to the canonical owned path. Keep browser-side resizing/conversion separate from trust-boundary validation.

- [ ] **Step 3: Implement server actions**

Export:

```ts
export async function createPerfumeAction(
  previousState: ActionState<PerfumeFormFields>,
  formData: FormData,
): Promise<ActionState<PerfumeFormFields>>;

export async function updatePerfumeAction(
  id: string,
  previousState: ActionState<PerfumeFormFields>,
  formData: FormData,
): Promise<ActionState<PerfumeFormFields>>;

export async function toggleFavoriteAction(
  id: string,
  next: boolean,
): Promise<{ status: "success" | "error"; message?: string }>;

export async function deletePerfumeAction(
  id: string,
): Promise<{ status: "success" | "error"; message?: string }>;
```

Use the authenticated ID in every mutation, never a client-provided owner. Revalidate:

```text
/colecao
/colecao/{id}
/dashboard
/recomendador
```

Redirect only after successful create/update/delete.

- [ ] **Step 4: Run focused mutation tests**

```powershell
npm.cmd test -- src/features/perfumes/actions.test.ts src/features/perfumes/image.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit mutations**

```powershell
git add -- src/features/perfumes/actions.ts src/features/perfumes/actions.test.ts src/features/perfumes/image.ts src/features/perfumes/image.test.ts
git commit -m "feat: mutate private perfume collection"
```

---

## Task 5: Remodel the collection as a responsive server-backed gallery

**Files:**

- Modify: `src/app/(app)/colecao/page.tsx`
- Modify: `src/components/collection/collection-view.tsx`
- Modify: `src/components/collection/perfume-card.tsx`
- Create: `src/components/collection/collection-view.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing gallery tests**

Test:

- card title links to `/colecao/{id}`;
- card click does not open the old edit modal;
- favorite button toggles without triggering card navigation;
- favorites appear first and each group is alphabetical;
- truthful empty state appears when the database has no perfumes;
- add action links to `/colecao/novo`;
- card has image fallback and visible concentration/bottle/inspiration metadata.

Run:

```powershell
npm.cmd test -- src/components/collection/collection-view.test.tsx
```

Expected: FAIL against the current localStorage/modal behavior.

- [ ] **Step 2: Move collection loading to the server page**

In `page.tsx`, call `listOwnPerfumes()` and pass serializable summaries into the view. Keep search/filter state client-side, but do not own persistence in React state.

- [ ] **Step 3: Replace modal interaction with navigation**

Update `PerfumeCard` so:

- the card identity area is a link to detail;
- favorite is a separate accessible button;
- no edit callback opens from the card;
- keyboard focus and hover states remain visible.

- [ ] **Step 4: Implement deterministic client filtering**

After text/filter operations, retain:

```ts
isFavorite DESC
name.localeCompare(name, "pt-BR", { sensitivity: "base" })
brand.localeCompare(brand, "pt-BR", { sensitivity: "base" })
```

- [ ] **Step 5: Set responsive columns**

Use explicit breakpoints:

- mobile: 1 column;
- tablet: 2 columns;
- desktop: 3 columns.

Avoid `auto-fill` producing four or more columns on wide screens.

- [ ] **Step 6: Run focused gallery tests**

```powershell
npm.cmd test -- src/components/collection/collection-view.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the gallery**

Stage only the files changed for this task after reviewing the pre-existing WIP diff:

```powershell
git diff -- "src/app/(app)/colecao/page.tsx" src/components/collection/collection-view.tsx src/components/collection/perfume-card.tsx src/app/globals.css
git add -- "src/app/(app)/colecao/page.tsx" src/components/collection/collection-view.tsx src/components/collection/perfume-card.tsx src/components/collection/collection-view.test.tsx src/app/globals.css
git commit -m "feat: remodel perfume collection gallery"
```

---

## Task 6: Build the approved editorial perfume detail page

**Files:**

- Create: `src/app/(app)/colecao/[id]/page.tsx`
- Create: `src/app/(app)/colecao/[id]/page.test.tsx`
- Create: `src/components/collection/perfume-detail.tsx`
- Create: `src/components/collection/olfactory-family-chips.tsx`
- Create: `src/components/collection/olfactory-pyramid.tsx`
- Create: `src/components/collection/performance-radar.tsx`
- Create: `src/components/collection/suitability-grid.tsx`
- Create: `src/components/collection/perfume-detail.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing detail tests**

Test the approved Option A composition:

- identity/header with image, brand, name, concentration, bottle format, inspiration status, and favorite;
- explanatory description;
- solid-color olfactory family chips with text labels;
- visibly pyramidal top/heart/base structure with headings;
- performance radar plus textual values;
- every season, occasion, and time period rendered with icon, label, percentage, and unknown state;
- edit links to `/colecao/{id}/editar`;
- delete action is present but requires confirmation;
- inaccessible/foreign ID resolves through `notFound()`.

Run:

```powershell
npm.cmd test -- "src/app/(app)/colecao/[id]/page.test.tsx" src/components/collection/perfume-detail.test.tsx
```

Expected: FAIL because the route and components do not exist.

- [ ] **Step 2: Implement route and editorial layout**

Call `getOwnPerfume(params.id)`. If it returns `null`, call `notFound()`. Render the approved balanced editorial hierarchy rather than a modal or dashboard.

- [ ] **Step 3: Implement accessible visual encodings**

`OlfactoryFamilyChips` must use both color and readable text.

`OlfactoryPyramid` must:

- render top notes in the widest top band;
- render heart notes in the middle band;
- render base notes in the foundation band;
- preserve semantic headings and list markup.

`PerformanceRadar` must:

- render an SVG polygon for five axes;
- expose an accessible name;
- provide the same values as visible text or a list;
- represent `null` as “Não informado”, not zero.

`SuitabilityGrid` must use icons and labels in addition to color and percentages.

- [ ] **Step 4: Run focused detail tests**

```powershell
npm.cmd test -- "src/app/(app)/colecao/[id]/page.test.tsx" src/components/collection/perfume-detail.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit detail presentation**

```powershell
git add -- "src/app/(app)/colecao/[id]/page.tsx" "src/app/(app)/colecao/[id]/page.test.tsx" src/components/collection/perfume-detail.tsx src/components/collection/olfactory-family-chips.tsx src/components/collection/olfactory-pyramid.tsx src/components/collection/performance-radar.tsx src/components/collection/suitability-grid.tsx src/components/collection/perfume-detail.test.tsx src/app/globals.css
git commit -m "feat: add editorial perfume details"
```

---

## Task 7: Add dedicated create and edit flows

**Files:**

- Create: `src/app/(app)/colecao/novo/page.tsx`
- Create: `src/app/(app)/colecao/[id]/editar/page.tsx`
- Create: `src/components/collection/perfume-form.tsx`
- Create: `src/components/collection/perfume-form.test.tsx`
- Create: `src/components/collection/delete-perfume-button.tsx`
- Create: `src/components/collection/delete-perfume-button.test.tsx`
- Modify: `src/components/collection/perfume-detail.tsx`

- [ ] **Step 1: Write failing form and deletion tests**

Test:

- create renders blank defaults and submits all structured fields;
- edit loads existing detail and preserves values;
- inspiration reference appears and becomes required only for dupe/inspiration;
- bottle format is independent from concentration;
- note fields preserve layer and order;
- all score categories expose the approved metric sets;
- image preview communicates accepted format and size;
- delete requires explicit confirmation and cancellation is harmless;
- pending and server error states are announced accessibly.

Run:

```powershell
npm.cmd test -- src/components/collection/perfume-form.test.tsx src/components/collection/delete-perfume-button.test.tsx
```

Expected: FAIL because the components do not exist.

- [ ] **Step 2: Implement one reusable form**

Use `useActionState` with `createPerfumeAction` or a bound `updatePerfumeAction`. Keep labels and help text explicit. Use arrays for note rows and fixed score controls for known metrics.

- [ ] **Step 3: Implement create and edit routes**

`/colecao/novo` renders the form without a perfume.

`/colecao/[id]/editar` fetches `getOwnPerfume(id)`, calls `notFound()` for inaccessible IDs, and renders the populated form.

- [ ] **Step 4: Implement confirmed deletion**

The detail page delete button must show a confirmation dialog describing that the perfume and its private image will be removed. Only the confirmed path calls `deletePerfumeAction`.

- [ ] **Step 5: Run focused tests**

```powershell
npm.cmd test -- src/components/collection/perfume-form.test.tsx src/components/collection/delete-perfume-button.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit create/edit flows**

```powershell
git add -- "src/app/(app)/colecao/novo/page.tsx" "src/app/(app)/colecao/[id]/editar/page.tsx" src/components/collection/perfume-form.tsx src/components/collection/perfume-form.test.tsx src/components/collection/delete-perfume-button.tsx src/components/collection/delete-perfume-button.test.tsx src/components/collection/perfume-detail.tsx
git commit -m "feat: add perfume create and edit flows"
```

---

## Task 8: Import the existing collection and its researched images

**Files:**

- Create: `scripts/import-legacy-perfumes.mjs`
- Create: `scripts/import-legacy-perfumes.test.ts`
- Create: `data/perfume-import/collection.json`
- Create: `data/perfume-import/README.md`
- Modify: `.gitignore` only if downloaded working images need an ignored staging directory
- Reference: `src/lib/data/collection.ts`
- Reference: `public/images/perfumes/`

- [ ] **Step 1: Write failing importer tests**

Test:

- each legacy item has a stable `legacyKey`;
- a second run updates or skips instead of duplicating;
- no user UUID is embedded in the manifest;
- source URLs are required for researched text and external images;
- unsupported or oversized images are rejected before upload;
- canonical object path is derived from the authenticated target user and inserted perfume ID;
- partial failures produce an audit report and non-zero exit status.

Run:

```powershell
npm.cmd test -- scripts/import-legacy-perfumes.test.ts
```

Expected: FAIL because the importer does not exist.

- [ ] **Step 2: Build the initial manifest from the 16 existing records**

Map existing data into the new schema without fabricating unknown performance, season, occasion, time, pyramid, or inspiration values. Use `null`/empty arrays where research has not established a value.

Each manifest record must include:

```json
{
  "legacyKey": "stable-slug",
  "brand": "Brand",
  "name": "Perfume",
  "imageSourceUrl": null,
  "descriptionSourceUrls": []
}
```

- [ ] **Step 3: Research sources in one batch**

Browse the web only now, after the schema and importer are stable. For each perfume:

1. prefer the official brand product page;
2. use an authorized distributor only when the brand page is unavailable;
3. record the direct page URL used for description/note claims;
4. record the direct image source URL separately;
5. do not download a search-result thumbnail;
6. mark uncertain mappings for manual review rather than guessing.

Summarize provenance and unresolved items in `data/perfume-import/README.md`.

- [ ] **Step 4: Prepare image files**

Convert accepted source images to WebP, maximum 1200×1200, keeping aspect ratio. Do not commit downloaded image binaries unless the repository intentionally owns them; upload them through the importer to the private bucket.

- [ ] **Step 5: Implement idempotent authenticated import**

Require an explicit target user email or resolved authenticated user at runtime. Upsert by `(user_id, legacy_key)`, then replace child notes/scores and upload the canonical cover. Emit a JSON audit containing created, updated, skipped, failed, and source URLs.

- [ ] **Step 6: Prove idempotency locally**

Run:

```powershell
npm.cmd test -- scripts/import-legacy-perfumes.test.ts
node scripts/import-legacy-perfumes.mjs --dry-run
node scripts/import-legacy-perfumes.mjs --dry-run
```

Expected: tests PASS; both dry runs report the same target operations and no duplicate keys.

- [ ] **Step 7: Ask for approval before mutating the linked project**

Present:

- exact target Supabase project;
- resolved target user;
- record count;
- sourced image count;
- unresolved source count;
- dry-run audit path.

Do not execute the live import until the user confirms these exact targets.

- [ ] **Step 8: Apply the approved import and audit it**

After approval, run the importer once, then a second time in audit/dry-run mode. Confirm 16 unique `legacy_key` records for the target user and verify every stored object belongs to that user's prefix.

- [ ] **Step 9: Commit importer and provenance**

```powershell
git add -- scripts/import-legacy-perfumes.mjs scripts/import-legacy-perfumes.test.ts data/perfume-import/collection.json data/perfume-import/README.md .gitignore
git commit -m "feat: import legacy perfume collection"
```

Omit `.gitignore` from `git add` if it was not changed.

---

## Task 9: Remove localStorage persistence and migrate dependent screens

**Files:**

- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/dashboard/dashboard.test.tsx`
- Modify: `src/app/(app)/recomendador/page.tsx`
- Modify: `src/components/recommender/recommender-view.tsx`
- Create: `src/components/recommender/recommender-view.test.tsx`
- Delete after consumers migrate: `src/hooks/use-collection.ts`
- Delete after consumers migrate: `src/components/collection/perfume-modal.tsx`
- Retire from runtime after import: `src/lib/data/collection.ts`

- [ ] **Step 1: Confirm the complete consumer set with Graphify**

Run:

```powershell
graphify affected "useCollection" --depth 3
```

Expected consumers include collection, dashboard, and recommender. Update this task if the graph shows an additional runtime consumer.

- [ ] **Step 2: Write failing dashboard and recommender tests**

Test:

- dashboard uses server-provided collection totals and truthful empty data;
- recommender receives persisted perfume summaries rather than reading localStorage;
- favorite-first ordering does not silently become recommendation ranking;
- no runtime code reads or writes the old collection localStorage key.

Run:

```powershell
npm.cmd test -- "src/app/(app)/dashboard/dashboard.test.tsx" src/components/recommender/recommender-view.test.tsx
```

Expected: FAIL while both screens still depend on `useCollection`.

- [ ] **Step 3: Move dashboard and recommender data loading to server pages**

Use `getOwnPerfumeDashboard()` for dashboard aggregates. Use a purpose-sized server query for recommender candidates; do not load descriptions, notes, or scores the current recommender does not use.

- [ ] **Step 4: Remove obsolete browser persistence and modal**

Delete `use-collection.ts` and `perfume-modal.tsx` only after Graphify and `rg` show no runtime imports. Keep `src/lib/data/collection.ts` only as import history if documented; otherwise delete it after the manifest becomes canonical.

Run:

```powershell
rg -n "useCollection|perfume-modal|localStorage" src
```

Expected: no collection persistence or modal references.

- [ ] **Step 5: Run focused integration tests**

```powershell
npm.cmd test -- "src/app/(app)/dashboard/dashboard.test.tsx" src/components/recommender/recommender-view.test.tsx src/components/collection/collection-view.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit consumer migration**

Review the user's pre-existing page diffs before staging:

```powershell
git diff -- "src/app/(app)/dashboard/page.tsx" "src/app/(app)/recomendador/page.tsx"
git add -u -- "src/app/(app)/dashboard" "src/app/(app)/recomendador" src/components/recommender src/hooks/use-collection.ts src/components/collection/perfume-modal.tsx src/lib/data/collection.ts
git add -- src/components/recommender/recommender-view.test.tsx
git commit -m "refactor: remove browser perfume persistence"
```

---

## Task 10: Validate the complete journey, apply migration safely, and refresh Graphify

**Files:**

- Create: `tests/e2e/perfume-collection.spec.ts`
- Modify: Playwright configuration only if the existing authenticated test fixture requires it
- Modify generated graph: `graphify-out/`

- [ ] **Step 1: Write the end-to-end journey**

Cover:

1. authenticated user sees private collection;
2. collection renders at three columns on a desktop viewport;
3. favorite moves to the top while both groups remain alphabetical;
4. card opens dedicated detail route;
5. detail shows family colors, pyramid, radar, and suitability values;
6. edit changes explanatory text and persists after reload;
7. add creates a perfume with decant/full-bottle and inspiration fields;
8. delete confirmation can cancel, then confirmed delete removes it;
9. another user cannot open the created perfume or its signed image.

- [ ] **Step 2: Run local database and focused E2E validation**

```powershell
npx supabase db reset
npx supabase test db
npm.cmd exec playwright test -- tests/e2e/perfume-collection.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run the full project validation once**

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Expected: all commands PASS. If lint still traverses `.worktrees`, fix the lint ignore configuration without deleting any worktree.

- [ ] **Step 4: Review Supabase changes before applying remotely**

```powershell
npx supabase db push --linked --dry-run
```

Inspect the exact linked project and SQL. Apply only after confirming it is the intended project:

```powershell
npx supabase db push --linked
npx supabase db query --linked --file supabase/tests/perfumes_rls.sql
```

Expected: migration applied and remote policy checks PASS.

- [ ] **Step 5: Verify visually in the browser**

Use the browser verification skill to inspect mobile, tablet, and desktop layouts. Confirm the approved Option A direction, keyboard navigation, dialog focus, image fallbacks, and that the radar/pyramid remain understandable without color.

- [ ] **Step 6: Refresh the project graph**

```powershell
graphify update .
graphify query "How does the persistent perfume collection flow from Supabase through collection detail edit dashboard and recommender?"
```

Expected: graph includes new tables, queries, actions, routes, and removal of `useCollection`.

- [ ] **Step 7: Review the final diff and commit validation artifacts**

```powershell
git status --short
git diff --check
git add -- tests/e2e/perfume-collection.spec.ts graphify-out
git commit -m "test: verify persistent perfume collection"
```

Do not include screenshots, browser artifacts, local environment files, or unrelated WIP.

---

## Completion Criteria

- Supabase is the only runtime source of truth for the collection.
- Every database and Storage operation is owner-scoped and covered by policy tests.
- Existing 16 perfumes have an auditable, idempotent import path; live import occurs only after target approval.
- Collection cards open dedicated detail pages, never an edit modal.
- Favorites are first; favorites and nonfavorites are each alphabetized with a brand tie-breaker.
- Desktop has exactly three columns, tablet two, mobile one.
- Detail includes explanatory text, concentration, bottle format, inspiration reference, solid family colors, an olfactory pyramid, accessible radar chart, and icon-based scored suitability.
- Edit and delete are explicit detail-page actions.
- Dashboard and recommender no longer depend on localStorage.
- SQL tests, unit/component tests, E2E, lint, typecheck, build, and Graphify refresh all pass.
