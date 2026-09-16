# Sakyk

A personal, responsive Lithuanian learning app for English speakers. React + Vite, with offline local progress and optional private Supabase sync across devices. No paid AI calls, audio, or subscriptions.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. On the same Wi-Fi, open the Network URL printed by Vite on your phone. Use an HTTPS deployment for offline installation across devices.

```sh
npm test
npm run build
npm run preview
```

Deploy `dist/` to any static HTTPS host at the domain root. The build includes a web app manifest and service worker; after the first successful online load, lessons and local progress work offline. Install with your browser’s “Install app” or “Add to Home Screen”. Account login and sync require internet access. A new version activates once previous app tabs close. Google Fonts are optional; local system fonts are the fallback offline.

Node 22.13+ is recommended; the optional PDF extraction script requires it. PDF.js is development-only and is not shipped in the app.

## Cloud sync and deployment

The recommended personal deployment uses Vercel for the static app and Supabase for authentication and Postgres storage. Both services have free tiers suitable for one person's learning progress.

1. Create a [Supabase project](https://database.new/).
2. Open its **SQL Editor**, paste `supabase/schema.sql`, and run it. This creates an event table with row-level security: signed-in users can only read and insert their own rows.
3. In **Project Settings → API**, copy the Project URL and Publishable key. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The publishable key is intended for frontend use; never put a service-role key in the app.
4. For local development, restart Vite. Open Settings in Sakyk and create your account. If email confirmation is enabled, confirm it before signing in.
5. Import the GitHub repository into [Vercel](https://vercel.com/new). Vercel detects Vite automatically. Add the same two environment variables under project settings and deploy.
6. In Supabase **Authentication → URL Configuration**, set the Site URL to the Vercel production URL. After creating your account, you can disable new-user signups under Authentication settings if this will remain a single-user app.

Answers save locally immediately. Signed-in sessions sync after 10 seconds without a new answer, on leaving an exercise session, on returning to the app, or via **Sync now**. Authentication sessions persist securely in the browser and refresh automatically. Signing out does not delete local or cloud progress.

Sync stores immutable progress events. Downloads and local events merge by UUID, so simultaneous devices do not overwrite each other’s history, and retrying an upload is safe. Do not delete database rows unless you intend to discard the cloud backup. A failed sync retains all local data for a later retry.

## Learning behavior

The course now contains **226 main-path classes, 1,663 scheduled sessions, and 2,264 target entries** across ten chapters. See [the teaching design](docs/teaching-design.md) for the reasoning, research references, per-chapter counts, café walkthrough, and limitations.

- **Today:** a compact next-lesson card and visible course journey. Continue course follows the curriculum in the last studied chapter; a separate optional practice card offers weak-spot or due review.
- **Course:** chapters contain classes, and each class has several short sessions. Meet & use (at most three new targets), guided construction, later recall, and application all live in the main path. A class is not finished after recognition alone. Each chapter ends with short prerequisite-gated checks requiring 80% first-attempt accuracy. Retakes rotate the sampled targets.
- **Reading and writing:** 27 original text situations progress from supported comprehension to short typed answers. Ten writing workshops save submitted drafts and provide a model and checklist for self-review; they do not automatically grade grammar or award vocabulary mastery.
- **Reference:** searchable alphabet and grammar tables have a direct Reference entry. Ten extra country/language classes are optional and do not block the main path.
- **Practice:** finite review or small named sets, grouped into words, grammar, numbers, and reading/writing. Selecting a word opens its introduction set or a small related set. New targets receive supported rounds; sets never refill from a category.
- Vocabulary, grammar, and conversation have different model introductions and starting tasks. Discovery sessions repeat the small target set in several modalities, including short productive responses. Later recall hides the answer list. Builders omit punctuation clues and can contain extra words. Hints and easier corrections cannot satisfy a task that requires a harder response.
- Finite sessions have a retry limit. Unfinished sessions keep their answer history without receiving a course pass. Difficult completed sessions offer optional consolidation practice without redirecting course continuation.
- Answer history is stored per target. Within-session performance adjusts support. Review intervals only advance with success separated by at least four hours, so quick repetition cannot inflate long-term retention. Errors become due in one minute; spaced successes progress through 4 hours, 1, 3, 7, 14, and 30 days.
- Typing ignores basic punctuation and case, while retaining Lithuanian diacritics. Some subject-pronoun omission is accepted. Sentence building uses the model order; this is not a general Lithuanian syntax parser.
- Old progress remains valid. An old class completion credits the first introduction; the newly added sessions still need to be done. Export/import JSON backups in Settings. Imports merge rather than replace progress.
- Goals count responses, including mistakes. There are no hearts or practice limits.

## Curriculum

The [coverage ledger](docs/coverage.md) maps learning objectives and inventories the current classes. The curriculum includes original English guidance, reading situations, and self-reviewed writing. Audio and speaking assessment are outside scope. The authored coverage does not establish validated language proficiency.

Course structure: `src/curriculum.js`; teaching material: `src/content/` and `src/teaching-content.js`; scheduling and saved progress: `src/engine.js`; practice sets: `src/practice.js`. Run `npm run content:coverage` to validate mappings and regenerate the ledger.

## Verification

`npm test` checks curriculum integrity, staged task plans, class and checkpoint completion, legacy progress, retention timing, event merging, and sync behavior. With the dev server running and a current build, `node scripts/browser-check.mjs` reproduces the café-class flow, checks productive practice before advancing, separate recall, grammar-specific teaching, checkpoint prerequisites, legacy migration, mobile reading, saved writing drafts and self-review, optional appendix routing, and offline production. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an existing browser, or run `npx playwright install chromium`. `npm run test:practice:browser` checks finite word practice, Enter navigation, writing newlines, reference search, and mobile action placement. Screenshots are written to your system temporary directory.

## App updates

Navigations check the network for the latest page and fall back to the bundled page offline. Each build has a versioned asset cache. Worker updates bypass the HTTP cache, activate after precaching succeeds, and trigger a page reload only outside an active lesson or settings screen. Cookies, local storage, and saved progress are not cleared. Vercel headers prevent caching the worker and require page revalidation. An existing installation using the old worker may need another normal refresh after its replacement activates.

`npm run test:updates:browser` tests replacement of the old worker, deferred reload during a lesson, preservation of progress and cookies, and unavailable-server fallback. The mobile layout check simulates visual viewport resize separately from layout resize; it does not emulate a physical phone keyboard.

The app also checks an uncached build-version endpoint on open/resume and every minute, independently of service-worker lifecycle notifications. Reloads remain deferred during lessons and settings. Mobile lesson entry requests browser fullscreen when supported; denial leaves the full-height overlay usable. Touch devices no longer autofocus answer inputs when opening a lesson. The compact progress label identifies the chapter, module, and lesson within that module.
