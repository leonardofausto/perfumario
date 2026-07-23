# Perfumário Foundation, Authentication, and Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the stable, responsive foundation of Perfumário with invite-only Supabase authentication, a private profile, and the four-area authenticated shell.

**Architecture:** Next.js App Router uses Server Components by default and Supabase SSR for cookie-backed sessions. PostgreSQL and Storage enforce ownership with RLS; navigation guards are supplementary. Vercel Git integration publishes previews and production after the same checks used locally.

**Tech Stack:** Node.js 24.18.0, Next.js 16.2.11, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, Supabase JS 2.110.8, Supabase SSR 0.12.3, Zod 4.4.3, Vitest 4.1.10, Testing Library, Playwright 1.61.1, Vercel CLI 56.5.0, Supabase CLI 2.109.1, GRAPHIFY.

## Global Constraints

- Product copy is Brazilian Portuguese: “Perfumário — Nossa estante virtual inteligente”.
- Only stable dependencies are allowed; reject versions containing `alpha`, `beta`, `canary`, `rc`, `next`, `preview`, or `experimental`.
- Never commit or print database passwords, secret keys, `service_role`, JWT secrets, tokens, or cookies.
- Public browser configuration is limited to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Collections remain private per user; shared shelves are outside this increment.
- Validate responsive behavior at 320, 375, 768, 1024, and 1440 pixels.
- No dark mode, social login, public registration, perfume CRUD, real recommendation, or real history in this increment.
- Use applicable Superpowers, frontend-design, Supabase, Vercel, and GitHub skills/plugins; query GRAPHIFY before cross-cutting edits.

---

## File Map

- `src/app`: routes, layouts, errors, loading UI, and server actions.
- `src/components/auth`: authentication forms only.
- `src/components/layout`: sidebar, mobile navigation, and user menu.
- `src/components/ui`: focused reusable controls and empty states.
- `src/lib/supabase`: browser/server clients and session proxy.
- `src/lib/auth`: server authorization and typed form results.
- `src/lib/profile`: profile validation and mutations.
- `supabase/migrations` and `supabase/tests`: schema, RLS, Storage, and database tests.
- `tests`: Vitest setup, component tests, and Playwright journeys.
- `scripts/check-stable-deps.mjs`: stable-version policy.

### Task 1: Stable toolchain, project scaffold, and GRAPHIFY

**Files:**
- Create: `package.json`, `.nvmrc`, `.env.example`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `scripts/check-stable-deps.mjs`
- Modify: `.gitignore`
- Test: `scripts/check-stable-deps.test.mjs`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `check:stable`, `verify`; stable Next.js runtime; GRAPHIFY graph and hooks.

- [ ] **Step 1: Install and authenticate the direct CLIs**

Run in PowerShell:

```powershell
winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
npm install --global vercel@56.5.0
gh auth login --web --git-protocol https
vercel login
```

Expected: `gh auth status` and `vercel whoami` identify the intended accounts. Do not paste tokens into tracked files.

- [ ] **Step 2: Create the stable dependency manifest**

Create `package.json` with exact versions:

```json
{
  "name": "perfumario",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=24.18.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check:stable": "node scripts/check-stable-deps.mjs",
    "verify": "npm run check:stable && npm run lint && npm run typecheck && npm test && npm run build"
  },
  "dependencies": {
    "@supabase/ssr": "0.12.3",
    "@supabase/supabase-js": "2.110.8",
    "lucide-react": "1.25.0",
    "next": "16.2.11",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "1.61.1",
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "7.0.0",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "24.13.3",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "eslint": "9.39.5",
    "eslint-config-next": "16.2.11",
    "jsdom": "29.1.1",
    "supabase": "2.109.1",
    "tailwindcss": "4.3.3",
    "typescript": "6.0.3",
    "vitest": "4.1.10"
  },
  "overrides": {
    "postcss": "8.5.22",
    "sharp": "0.35.3"
  }
}
```

Run `npm install`. Expected: a new `package-lock.json` and no prerelease package at the top level.

- [ ] **Step 3: Write the stable-version policy test, verify failure, then implement it**

`scripts/check-stable-deps.test.mjs` must spawn the checker against a temporary manifest containing `next: "17.0.0-canary.1"` and assert a non-zero exit plus `Prerelease dependency`. Run `node --test scripts/check-stable-deps.test.mjs`; expected failure because the checker does not exist.

Implement `scripts/check-stable-deps.mjs`:

```js
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(process.argv[2] ?? "package.json", "utf8"));
const blocked = /(?:^|[.-])(alpha|beta|canary|rc|next|preview|experimental)(?:[.-]|$)/i;
const entries = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies });
const invalid = entries.filter(([, version]) => blocked.test(version));
if (invalid.length) {
  console.error(`Prerelease dependency: ${invalid.map(([name, version]) => `${name}@${version}`).join(", ")}`);
  process.exit(1);
}
```

Run the test and `npm run check:stable`; expected: both pass.

- [ ] **Step 4: Add the minimal Next.js configuration and test harness**

Configure strict TypeScript with `@/* -> ./src/*`, Tailwind 4 via `@tailwindcss/postcss`, Next ESLint, jsdom Vitest setup, metadata, `lang="pt-BR"`, and `@import "tailwindcss"` in globals. `.env.example` contains only the two public variable names with empty values. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; expected: pass.

- [ ] **Step 5: Install GRAPHIFY for Codex after indexable code exists**

Run:

```powershell
graphify codex install
graphify extract . --code-only
graphify hook install
graphify diagnose multigraph --json
graphify query "Where are authentication and route protection implemented?" --budget 800
```

Expected: `AGENTS.md` contains GRAPHIFY guidance, `graphify-out/graph.json` exists locally, hook status is installed, and the query returns indexed nodes. Read and obey the new `AGENTS.md` before continuing.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json .nvmrc .env.example next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs vitest.config.ts src scripts AGENTS.md .gitignore
git commit -m "chore: bootstrap stable Next.js toolchain"
```

### Task 2: Supabase schema, RLS, and private avatars

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/202607220001_foundation_profiles.sql`, `supabase/tests/profiles_rls.sql`

**Interfaces:**
- Produces: `public.profiles`; `private-avatars` bucket; `handle_new_user()` and `set_updated_at()` triggers; owner-only database and object policies.

- [ ] **Step 1: Initialize the local Supabase CLI and verify plugin access**

Run `npx supabase init` and verify project `otyxdfwoguvxakczxdpi` through the authenticated Supabase plugin. Docker is intentionally not installed. Expected: `supabase/config.toml` exists and the plugin reports project `perfumario` as healthy; no secret is written to Git.

- [ ] **Step 2: Write the failing pgTAP policy test**

Create `supabase/tests/profiles_rls.sql` to assert: table and bucket exist; RLS is enabled; an authenticated UUID can select/update its own profile; the same UUID cannot select/update another profile; avatar writes are allowed only when the first storage folder equals `auth.uid()::text`. Query the remote catalogs before implementation; expected: failure because the schema and bucket are absent.

- [ ] **Step 3: Implement the migration**

The migration must create `profiles(id uuid primary key references auth.users on delete cascade, display_name text check (char_length(display_name) <= 80), avatar_path text, created_at timestamptz default now(), updated_at timestamptz default now())`; enable RLS; add owner `select` and `update` policies; add a `security definer set search_path = ''` trigger that inserts `new.id` and metadata display name on `auth.users` insert; add the timestamp trigger; insert private bucket `private-avatars` with 5 MB limit and MIME types `image/jpeg,image/png,image/webp`; and add Storage select/insert/update/delete policies where `(storage.foldername(name))[1] = auth.uid()::text`.

Execute the migration and assertions inside a single remote `BEGIN ... ROLLBACK` transaction using the authenticated Supabase plugin. Expected: all assertions pass and catalog queries after rollback still show no permanent schema change.

- [ ] **Step 4: Apply the approved migration remotely**

Apply the reviewed migration with the authenticated Supabase plugin, then compare the local migration filename with the plugin migration history. Expected: local and remote migration names match. Never pass the database password as a command-line argument.

- [ ] **Step 5: Commit**

```powershell
git add supabase
git commit -m "feat: add private profiles and avatar policies"
```

### Task 3: Typed Supabase clients and server authorization

**Files:**
- Create: `src/lib/env.ts`, `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`, `src/lib/auth/session.ts`, `src/lib/auth/types.ts`, `src/lib/auth/session.test.ts`, `src/proxy.ts`

**Interfaces:**
- Produces: `createBrowserSupabase()`, `createServerSupabase()`, `updateSupabaseSession(request)`, `getOptionalUser()`, `requireUser()` and `ActionState`.

- [ ] **Step 1: Write failing authorization tests**

Mock the server client and assert `getOptionalUser()` returns `null` on Auth failure, `requireUser()` returns the user on success, and `requireUser()` calls `redirect("/login")` when missing. Run `npm test -- src/lib/auth/session.test.ts`; expected: module-not-found failure.

- [ ] **Step 2: Implement environment and Supabase factories**

Use Zod to require the two public variables. The server factory adapts async `cookies()` to `@supabase/ssr`; the browser factory uses `createBrowserClient`; the proxy copies every cookie update to both request and response. Never import a server module from a Client Component.

- [ ] **Step 3: Implement session helpers and proxy routing**

`getOptionalUser()` calls `supabase.auth.getUser()` and returns `data.user ?? null`. `requireUser()` redirects when null. `src/proxy.ts` refreshes sessions for all routes except static assets and image files; protected layouts still call `requireUser()` independently.

Run the focused tests, typecheck, and lint; expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/lib src/proxy.ts
git commit -m "feat: add server-validated Supabase sessions"
```

### Task 4: Public presentation and approved 70/30 login visual

**Files:**
- Create: `public/images/login-perfumes.webp`, `src/components/brand/brand-mark.tsx`, `src/components/public/public-header.tsx`, `src/components/public/hero.tsx`, `src/components/auth/auth-shell.tsx`, `src/components/auth/auth-shell.test.tsx`, `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/app/page.tsx` after the public route-group page replaces it

**Interfaces:**
- Produces: `AuthShell({ children })`; responsive public presentation; original production image asset.

- [ ] **Step 1: Generate the original image asset using the imagegen skill**

Prompt: “Wide editorial still life of refined perfume bottles on a dark walnut desk, warm amber glass, subtle scent strips and botanical shadow, deep forest-green room, cinematic side lighting, sophisticated Brazilian luxury catalog, no people, no labels, no text, no logos, generous negative space on the left, photorealistic, 16:9.” Save the approved result as optimized `public/images/login-perfumes.webp`; do not reuse the screenshot as a production asset.

- [ ] **Step 2: Write the failing visual structure test**

Render `AuthShell` and assert an image region labeled “Coleção de perfumes”, a form region, product name, and child content exist. Assert classes/tokens expose desktop `70% 30%` and a single-column mobile layout. Run the focused test; expected: missing-component failure.

- [ ] **Step 3: Implement the public and auth shells**

Use semantic `header`, `main`, `section`, and `nav`; `next/image` with explicit responsive sizes; CSS variables for marfim, verde profundo, verde suave, areia, and ink; image overlay for AA text contrast. At <=768 px, show a compact image header and full-width form. Preserve visible focus and reduced-motion behavior.

Run tests at this task, lint, and typecheck; expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add public src
git commit -m "feat: add public experience and photographic auth shell"
```

### Task 5: Email/password authentication and recovery

**Files:**
- Create: `src/lib/auth/schemas.ts`, `src/app/(auth)/actions.ts`, `src/components/auth/login-form.tsx`, `src/components/auth/forgot-password-form.tsx`, `src/components/auth/reset-password-form.tsx`, `src/components/auth/login-form.test.tsx`, `src/app/(auth)/recuperar-senha/page.tsx`, `src/app/(auth)/redefinir-senha/page.tsx`, `src/app/auth/callback/route.ts`

**Interfaces:**
- Produces: `loginAction`, `requestPasswordResetAction`, `resetPasswordAction`, and neutral typed `ActionState` errors.

- [ ] **Step 1: Write failing form and action tests**

Assert invalid email/password never calls Supabase; rejected login returns “Não foi possível entrar com essas credenciais.” while retaining email; recovery always returns the same success copy; reset requires matching passwords of at least 8 characters; successful login redirects to `/dashboard`. Run focused tests; expected: failures.

- [ ] **Step 2: Implement schemas and server actions**

Use Zod schemas with Portuguese messages. Call `signInWithPassword`, `resetPasswordForEmail` using `${origin}/auth/callback?next=/redefinir-senha`, and `updateUser({ password })`. Validate callback `next` against an internal allowlist. After reset, call `signOut({ scope: "local" })` and redirect to `/login?senha=alterada`.

- [ ] **Step 3: Implement accessible forms**

Use `useActionState`, explicit labels, `aria-describedby`, disabled pending buttons, password visibility controls, field-level errors, neutral recovery copy, and no Google/social-login controls.

Run focused tests, lint, typecheck, and build; expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/app src/components/auth src/lib/auth
git commit -m "feat: add invite-only email authentication flows"
```

### Task 6: Responsive protected shell and navigation

**Files:**
- Create: `src/config/navigation.ts`, `src/components/layout/app-sidebar.tsx`, `src/components/layout/mobile-navigation.tsx`, `src/components/layout/user-menu.tsx`, `src/components/layout/app-shell.tsx`, `src/components/layout/app-shell.test.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/actions.ts`

**Interfaces:**
- Produces: `navigationItems`; `AppShell({ user, profile, children })`; `logoutAction()`.

- [ ] **Step 1: Write failing shell tests**

Assert all four Portuguese menu entries and links exist, the current route is exposed with `aria-current`, mobile menu has an accessible label, user menu includes “Editar perfil” and “Sair”, and logout action calls Supabase then redirects to `/`. Run focused tests; expected: missing-module failure.

- [ ] **Step 2: Implement desktop and mobile shells**

Desktop uses a fixed green sidebar at >=1024 px. Tablet uses a compact trigger without shrinking touch targets. Mobile uses a focus-trapped dialog/sheet, closes after navigation, restores trigger focus, and prevents background scroll. Server layout calls `requireUser()` and fetches the owner profile.

- [ ] **Step 3: Implement the dropdown and logout**

Use buttons and links with native semantics, Escape/outside-click handling, initials fallback, and a server logout action. Do not treat `src/proxy.ts` as the authorization boundary.

Run tests, lint, typecheck, and build; expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/config src/components/layout 'src/app/(app)'
git commit -m "feat: add responsive authenticated navigation"
```

### Task 7: Dashboard and future-area empty states

**Files:**
- Create: `src/components/ui/page-header.tsx`, `src/components/ui/empty-state.tsx`, `src/components/dashboard/stat-card.tsx`, `src/components/ui/empty-state.test.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/colecao/page.tsx`, `src/app/(app)/recomendador/page.tsx`, `src/app/(app)/historico/page.tsx`

**Interfaces:**
- Produces: `PageHeader`, `EmptyState`, and `StatCard`; navigable zero-data pages with no fake user data.

- [ ] **Step 1: Write the failing empty-state test**

Assert semantic heading, description, optional action link, and decorative-icon accessibility. Run focused test; expected: component missing.

- [ ] **Step 2: Implement the four pages**

Dashboard shows zero collection/favorite/history counts and links toward Collection. Collection explains that perfume registration arrives in the next increment. Recommender explains it needs a collection. History explains it will record future recommendations and use. Do not create perfume tables or mock records.

- [ ] **Step 3: Verify responsive layouts**

Add Playwright screenshot assertions at 320, 375, 768, 1024, and 1440 for the shell and empty states, masking only nondeterministic avatar URLs. Expected: no horizontal overflow and no clipped controls.

- [ ] **Step 4: Commit**

```powershell
git add src/components/ui src/components/dashboard 'src/app/(app)'
git commit -m "feat: add dashboard and guided empty states"
```

### Task 8: Private profile and avatar editing

**Files:**
- Create: `src/lib/profile/schema.ts`, `src/lib/profile/queries.ts`, `src/app/(app)/perfil/actions.ts`, `src/app/(app)/perfil/page.tsx`, `src/components/profile/profile-form.tsx`, `src/components/profile/avatar-upload.tsx`, `src/components/profile/profile-form.test.tsx`

**Interfaces:**
- Produces: `getOwnProfile(userId)`, `updateProfileAction`, `updateAvatarAction`; signed avatar display URLs.

- [ ] **Step 1: Write failing profile tests**

Assert display name is trimmed and capped at 80 characters; email is read-only; upload rejects files over 5 MB or outside JPEG/PNG/WebP; object path starts with authenticated user ID; failed upload does not update `avatar_path`. Run focused tests; expected: missing modules.

- [ ] **Step 2: Implement profile queries and mutations**

Every function calls `requireUser()`. Query/update uses `.eq("id", user.id)`. Avatar path is `${user.id}/avatar-${crypto.randomUUID()}.${validatedExtension}`. Upload first, update profile second, and remove the new object if the profile update fails. Generate a short-lived signed URL on the server.

- [ ] **Step 3: Implement the responsive profile UI**

Use preview, progress/pending feedback, initials fallback, read-only email, and success/errors announced through an `aria-live` region. Run tests, lint, typecheck, and build; expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/profile 'src/app/(app)/perfil' src/components/profile
git commit -m "feat: add private profile and avatar editing"
```

### Task 9: Resilience, end-to-end verification, CI, and deployment

**Files:**
- Create: `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/(app)/loading.tsx`, `tests/e2e/authenticated-shell.spec.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `docs/operations/deployment.md`
- Modify: `package.json`

**Interfaces:**
- Produces: resilient application states; repeatable CI; documented GitHub/Vercel/Supabase/GRAPHIFY operations.

- [ ] **Step 1: Add failure-state tests before implementation**

Test that the error boundary offers “Tentar novamente”, not-found links home, skeletons have accessible status text, and protected E2E routes redirect to `/login` without a session. Run tests; expected: missing UI failures.

- [ ] **Step 2: Implement resilient states and Playwright journey**

Add branded loading/error/not-found UI. E2E uses dedicated test-user secrets to execute login → Dashboard → profile name update → logout and verifies unauthenticated rejection. Store test credentials only in local/CI secret stores.

- [ ] **Step 3: Add the GitHub Actions gate**

`.github/workflows/ci.yml` runs on pull requests and pushes: checkout, setup Node 24.18.0 with npm cache, `npm ci`, `npm run check:stable`, lint, typecheck, unit tests, build, and Playwright with the documented CI environment. Expected: any failed check blocks the workflow.

- [ ] **Step 4: Link Vercel and configure safe variables**

Run `vercel link`, then add only the two public Supabase variables to Development, Preview, and Production using `vercel env add`. Connect the GitHub repository in Vercel so branches create previews and `main` creates production. Run `vercel pull --yes` and `vercel build`; expected: production build succeeds locally.

- [ ] **Step 5: Run full verification and GRAPHIFY impact checks**

```powershell
npm run verify
npm run test:e2e
graphify update . --force
graphify affected "requireUser" --depth 3
graphify affected "profiles" --depth 3
graphify benchmark graphify-out/graph.json
git status --short
```

Expected: checks pass, affected routes are understood, benchmark completes, and only intended files remain.

- [ ] **Step 6: Commit, push, and verify deployments**

```powershell
git add .github src tests playwright.config.ts package.json package-lock.json docs/operations
git commit -m "ci: verify and deploy the authenticated foundation"
git push -u origin main
gh run watch --exit-status
vercel ls
```

Expected: GitHub CI succeeds, Vercel production deployment for `main` is Ready, and the production smoke test confirms public page, login, authenticated shell, profile, and logout.

## Final Acceptance

- [ ] Invite-only e-mail/password login, recovery, reset, and logout work.
- [ ] Protected data and routes are enforced by server checks plus RLS.
- [ ] Profile and private avatar operations are owner-only.
- [ ] Public page, 70/30 login, sidebar, dropdown, and four routes match the approved direction.
- [ ] No horizontal overflow at 320, 375, 768, 1024, or 1440 pixels.
- [ ] Stable dependency check, lint, types, unit/integration tests, E2E, and production build pass.
- [ ] GitHub, Vercel, Supabase CLI, relevant skills/plugins, and GRAPHIFY are configured and documented.
- [ ] No secret is tracked, bundled, logged, or present in command history.
