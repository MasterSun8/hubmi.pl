@AGENTS.md

# hubmi.pl — Małopolski Hub Innowacji Społecznych

HackYeah prototype for ROPS Kraków (Regionalny Ośrodek Polityki Społecznej). Residents report social
problems or offer help through an AI chat; the institution reviews submissions, matches them with
proven innovations from the ROPS library and manages them in an admin panel.

The challenge brief is `CRITERIA Wojewodztwo Malopolskie HUBMI.pdf` (plus a duplicate `-1.pdf`) in the
repo root. Do not commit either PDF.

## Hard product decisions

- **No login anywhere, including `/admin`.** The jury has about a minute per project and said it does
  not want to log in. Do not add auth, gates or "demo account" screens.
- **UI copy is Polish.** Code, comments, commit messages and PR text are English.
- **WCAG 2.1 AA is a requirement**, not a nice-to-have (see Accessibility below).
- The database is shared by the team and holds test data. It gets cleaned and reseeded before the
  final demo, so do not build cleanup into features; do not delete data unasked.

## Stack

- Next.js 16.3.8 App Router, React 19 (read `node_modules/next/dist/docs/` first, see AGENTS.md).
  `params` is a Promise; use the global `PageProps<"/route">` / `LayoutProps` types; `after()` for
  post-response work. React 19: `use(Context)` and `<Context value={…}>`.
- Tailwind CSS v4 **only** — no CSS modules, no inline style objects, no other CSS. Tokens live in
  `@theme` in `app/globals.css`.
- `motion` for animations (`shared/components/motion/`).
- Drizzle ORM + Postgres with pgvector (`server/db/schema.ts`, migrations in `server/db/migrations`).
- OpenAI: Responses API (streaming SSE chat), `text-embedding-3-small` embeddings
  (`OPENAI_EMBEDDING_MODEL`). Env vars are listed in `.env.example`; never print or commit `.env`.
- zod for request validation, `react-markdown` for chat messages (`shared/components/markdown.tsx`).

## Commands

Use **pnpm** (12.8.1, pinned in `packageManager`). Never npm or yarn — their lockfiles are gitignored,
and an outdated `pnpm-lock.yaml` breaks the Jenkins build (`ERR_PNPM_OUTDATED_LOCKFILE`), so commit the
lockfile whenever dependencies change.

```bash
pnpm dev                 # dev server
pnpm typecheck && pnpm lint
pnpm seed                # server/db/seed.ts (wipes embeddings, see below)
node --env-file=.env scripts/embed-solutions.mts   # embed solutions; run after every seed
pnpm enrich:submissions  # AI title/summary/category/targetGroup for submissions
```

- The database is on the LAN. The app-preview server cannot reach it (`EHOSTUNREACH`), so run
  `pnpm dev` from a normal shell / Bash in the background. `next.config.ts` allows `127.0.0.1` as a
  dev origin.
- After moving or renaming routes, stale types in `.next` cause phantom errors: stop the server,
  `rm -rf .next`, start again. Don't kill servers you didn't start without asking.
- Verify UI changes in the browser on real data before calling them done.

## Project layout and conventions

- `app/` — routes. Public: `/` (landing), `/zglos-problem` (report a problem chat),
  `/zaoferuj-pomoc` (offer help / idea chat) → `/zaoferuj-pomoc/kanwa` (innovation canvas + hand-off)
  → `/zaoferuj-pomoc/wniosek` (grant application). Admin ("Panel instytucji"): `/admin` (statistics),
  `/admin/zgloszenia` (+ `[id]`), `/admin/inicjatywy` (+ `[id]`), `/admin/nabory` (+ `[id]`),
  `/admin/mapa-potrzeb`. The idea-creator flow for users and admins is described in
  `docs/kreator-pomyslow.md`.
- **`page.tsx` holds the full page skeleton** (landmarks, layout grid, section order) and composes
  components; it should read like an outline of the screen.
- Components used by a single route go in `app/<route>/components/`. Components shared by several
  routes go in `shared/components/`. Data-fetching state lives in a `*-provider.tsx` next to the
  components that consume it (pattern: `XProvider` + `useX()` + `WhenXLoaded`).
- `lib/server/` — server-only data access and AI (`submissions.ts`, `solutions.ts`, `groups.ts`,
  `ai/`, `chat/`). Route handlers in `app/api/**` stay thin: validate with zod, call `lib/server`,
  map errors to 400/404/503.
- `lib/chat/chat-client.ts` — browser SSE client for `/api/chat`.
- `app/data/` — scraped source data (innovations, contacts, chat samples); `app/data/obserwator/` is
  gitignored. `app/tools/scrapper` — scraper.
- **Every clickable element shows `cursor: pointer`, including disabled ones** (global base rule in
  `globals.css`; don't override it).
- **Whole cards are clickable**: put a stretched link (`after:absolute after:inset-0` on the `<Link>`,
  `relative` on the card) instead of a small "more" link.
- Match the surrounding code: comment density, naming, idiom.

## Design and accessibility

- Source of truth: Figma file (Hubmi page) and `DESIGN.md`. Use tokens (`text-subtitle`, `text-lead`,
  `text-caption`, `bg-surface`, `text-primary`, `border-line`, `border-field`, `text-muted`, …), never
  raw hex/px when a token exists. Primary is magenta `#c32882`, font Roboto (weights 100–500).
- Contrast tokens (fixed for WCAG AA): `--color-muted` `#6b6b6b` for secondary text (≥4.5:1),
  `--color-field` `#858585` for form-field borders (≥3:1), `--color-line` only for decorative dividers,
  `--color-error` `#c8322f`. Don't lighten them.
- Accessibility bar (gov.pl style) in `shared/components/accessibility-bar.tsx`, shown on public pages
  and in the admin panel: text size A / A+ / A++ (scales every `--text-*` via `--text-scale`) and high
  contrast (`data-contrast="high"`, style with the `hc:` variant). Preferences persist in
  localStorage key `hubmi-a11y`. We deliberately dropped PJM, ETR, "deklaracja dostępności" and
  "przejdź do treści" links.
- Placeholders are gray, focus outlines must look intentional (no default ugly outline), forms use
  `border-field`.
- Labels that are not buttons must not look like buttons (e.g. the "Panel instytucji" caption under
  the admin logo).

## AI, data and matchmaking

- Chat (`/api/chat`, `lib/server/ai/chat.ts`, prompts in `lib/server/ai/prompts/`) streams SSE and does
  RAG over `solutions` (`lib/server/ai/rag/search.ts`). Each conversation has a `flow`
  (`help` = report a problem, `idea` = offer help); the chat ends with a submission draft the user
  confirms (`createSubmission`).
- Submissions are enriched by AI (`lib/server/ai/enrich-submission.ts`): title, summary, one of 14
  fixed categories, target group, embedding. The admin details page shows the AI summary first.
- **Solutions (ROPS innovation library, ~115 rows) need embeddings.** `pnpm seed` recreates them
  without embeddings, which silently breaks chat RAG and all match counts. Always run
  `scripts/embed-solutions.mts` after seeding.
- Matchmaking (`lib/server/solutions.ts`): for each submission, the 3 closest **published** solutions
  by cosine distance (`<=>`), only if distance `< 0.5` (real matches sit below 0.50, junk/test chats
  start around 0.52). Both directions (submission → solutions, solution → submissions) use the same
  pairs, so counts agree.
- Statuses: submissions are changed via `PATCH /api/submissions/[id]`; solutions are
  `published` / `draft` / `retired` via `PATCH /api/solutions/[id]` — only published ones are offered
  by the chat and matched.
- Location map in submission details uses Nominatim geocoding + OpenStreetMap embed (no API key).

## API (summary)

`/api/chat` · `/api/conversations/[id]` · `/api/submissions` (list, create) ·
`/api/submissions/[id]` (GET, PATCH status) · `/api/submissions/[id]/matches` ·
`/api/solutions` (list + `matchedSubmissions`) · `/api/solutions/[id]` (GET + matching submissions,
PATCH status) · `/api/regional-statistics` · `/api/groups` ·
`/api/conversations/[id]/idea-card` · `/api/conversations/[id]/canvas` (GET, PUT, POST = AI draft) ·
`/api/conversations/[id]/application` (GET, PUT, `/draft`, `/submit`) · `/api/grant-calls` (list, create) ·
`/api/grant-calls/[id]` · `/api/submissions/[id]/applications`.

When extending a teammate's endpoint, keep it additive (don't remove or rename existing fields) and
tell them.

## Team ownership

- Piotr Wittig — frontend, admin panel, integration.
- Karol Wroński (Kajox) — chat backend, AI, embeddings, RAG, enrichment.
- MiniowaPM — DB schema, seeding, `/api/solutions`, `/api/regional-statistics`.
- DudeQ — submissions endpoints.
- Pablo — submission creation endpoint.

Don't rewrite another person's area unasked; if a change there is needed, keep it minimal and say so.

## Git workflow

- Never push directly to `main`. Branch (`feat/…`, `fix/…`), open a PR with `gh`, squash-merge when
  the user asks ("PR i merge"), then pull `main`.
- Never force-push without explicit approval for that push; fix mistakes with a follow-up commit.
- Commit messages and PR descriptions in English, with no AI attribution / co-author lines.
- Never commit: the CRITERIA PDFs, `.claude/`, `.figwright/`, `.env*`, `app/data/obserwator/`.
- Stage files explicitly; one missing path in `git add` aborts the whole command.
- CI is Jenkins. Its logs may contain secrets — never paste them into PRs or issues.

## Status vs the challenge brief (modules)

| Module | Status |
| --- | --- |
| I. Matchmaking | Done in chat and admin (submission ↔ innovations, match counts) |
| II. Knowledge base | Partial: needs map and innovation library in admin; no public library yet |
| III. Idea creator | Done: live idea card, innovation canvas (our own fields until ROPS's file), grant calls and AI-drafted applications; no visualization |
| IV. Innovation tester | Not started |
| V. Communication | Not started: notify admin of new submissions, ROPS reply to the author |
| VI. Admin panel | Done: submissions with statuses, innovations with publish/retire, needs map |
| VII. Middleman | Not started: "Jak wdrożyć u nas?" from `implementation_recommendations` |
| WCAG AA | Contrast fixed; keep checking new screens |

Also required: one-page maintenance cost estimate; anonymize the `contacts` table before the demo;
AI Score is either implemented or hidden.
