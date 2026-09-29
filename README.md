# Sakyk

A Lithuanian course with guided examples, conversations, grammar practice and spaced retrieval. Course and Practice use the same exercise runtime and learning records.

## Run

```sh
npm install
npm run dev
```

Open the printed local URL. `?chapter=2` opens chapter 2 directly. Progress saves in IndexedDB and works offline after the production app has been cached. Settings provides account sign-in and JSON backup import/export.

## Check

```sh
npm test
npm run content:check
npm run build
npm run test:browser
npm run format:check
```

The browser check requires a running app (`APP_URL`, default `http://127.0.0.1:5173/`) and Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an installed Chrome. Results go to ignored `test-results/`.

## Project map

| Directory        | Responsibility                                                        |
| ---------------- | --------------------------------------------------------------------- |
| `src/app`        | Navigation, course views, exercise controls, account settings         |
| `src/components` | Shared layout, branding, conversations and map                        |
| `src/curriculum` | Chapter definitions, compiler, catalog and language reference         |
| `src/learning`   | Session transitions, answer assessment, evidence and review selection |
| `src/progress`   | Progress model, IndexedDB repository, backup and cloud transport      |
| `src/styles`     | App and lesson presentation                                           |
| `tests`          | Content contracts and learning behavior                               |

Read [Architecture](docs/architecture.md), [Authoring](docs/authoring.md), [Learning contract](docs/learning.md) and [Curriculum status](docs/curriculum.md).

## Cloud configuration

Use the Supabase URL and publishable key in `.env.example` or the configured project defaults. Apply `supabase/schema.sql` to the project database, including `course_states` and `save_course_state`. Enable email/password authentication and configure allowed confirmation URLs. Database row-level security restricts records to their owner.

Sync combines immutable learning events and saved course sessions. Local learning and backups remain available when the network or database is unavailable. Unit checks cover merge semantics; a production account round trip must also be checked when configuring a deployment.
