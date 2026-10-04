# Wellness Hub — Next.js

A corporate wellness hub on Next.js 16 (App Router, Turbopack) with Supabase Auth and Postgres row-level security, deployed on Vercel.

```sh
cp .env.example .env.local   # then fill in the two Supabase values
npm ci
npm run dev
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/app/**/page.tsx` | Server Components. Own `metadata` / `generateMetadata` and render a client view. |
| `src/app/sitemap.ts`, `src/app/robots.ts` | Generated from `src/lib/routes.ts`, the single source of truth for public vs private routes. |
| `src/app/api/health/route.ts` | Deployment check. Returns 503 with the specific problem when Supabase is not configured. |
| `src/proxy.ts` | Next.js 16 proxy: session cookie refresh, security headers, per-route caching. |
| `src/lib/routes.ts` | Route access classification shared by the proxy, `AuthGate`, robots and sitemap. |
| `src/lib/backend.ts` | Data adapter. Filtering, ordering and limits happen in Postgres; single records are read by primary key. |
| `src/hooks/useCommunity.ts` | Group directory and conversation feed. Server-side filtering plus cursor pagination. |
| `supabase/migrations/` | Six ordered migrations. `supabase_setup.sql` is the fresh-install bundle. |
| `tests/` | `database.mjs` applies the real migrations to embedded Postgres; `ui.spec.ts` drives the app against a local fixture service. |

## Commands

`npm run dev`, `npm run build`, `npm run typecheck`, `npm run test:db`, `npm run test:ui`.

## Conventions

- Pages are Server Components. Anything interactive lives in `src/views/` or `src/components/` with `"use client"`.
- Authorization belongs in Postgres, not the client. Never add a service-role key to the browser environment.
- Do not fetch a table and filter it in JavaScript. Add an index and a filter to the query, or a function to a migration.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Supabase and Vercel setup, SEO and crawler policy, scalability notes and verification.
