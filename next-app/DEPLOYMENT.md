# Deploy Wellness Hub on Vercel + Supabase

The maintained application is `next-app/`. The old Caffeine/Internet Computer export under `src/` is historical and is not used by this deployment.

## 1. Create the database

Create a **new, dedicated Supabase project**. In its SQL editor, run these files in order, once:

1. `supabase/migrations/202609270001_wellness.sql`
2. `supabase/migrations/202609270002_operations.sql`
3. `supabase/migrations/202609270003_session_updates.sql`
4. `supabase/migrations/202609300001_connections.sql`
5. `supabase/migrations/202610010001_group_categories.sql`
6. `supabase/migrations/202610020001_scale_and_index.sql`

For a fresh, dedicated project, `supabase_setup.sql` contains all six in order. If the first five are already installed, run only migration 6. Never rerun the fresh-install bundle on an existing installation.

Migration 6 is the scalability pass and is additive: it adds indexes, adds two summary views, replaces a handful of functions with equivalent or stricter versions, and adds `admin_stats()`, `admin_user_profiles()`, `group_category_counts()` and `submit_contact_request()`. Existing installs keep all of their rows.

> **Upgrading note.** Migration 6 revokes `INSERT` on `contact_requests`. The contact form now calls `submit_contact_request()`, which validates the input and caps submissions at five per member per day. Nothing else changed: the table, its policies and the administrator inbox are untouched.

Alternatively, use the Supabase CLI migration workflow against that project. The migrations create tables, constraints, indexes, row-level policies, transactional operations, profile provisioning, and starter groups. They do not create fake people, posts, sessions, providers, or reviews. Do not run these fresh-install migrations in an unrelated shared database: the first migration revokes default execution privileges in the public schema.

## 2. Configure authentication

Enable the Email provider in Supabase Auth. The app supports email/password signup and sign-in, email access fallback, and LinkedIn OIDC when configured. Email confirmation remains required for new accounts, with PKCE code exchange and cookie refresh through the Next.js proxy.

Set the Site URL to your production origin (for example `https://wellness.example.com`) and add exact Redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://YOUR-VERCEL-DOMAIN/auth/callback`
- `https://YOUR-CUSTOM-DOMAIN/auth/callback` if used

Add only the preview origins you need. Configure your own SMTP provider for production mail delivery and adjust Supabase Auth rate limits for the expected audience.

Set **Confirm signup** to the contents of `supabase/templates/confirmation.html`, and **Magic link** to `supabase/templates/magic-link.html`. These use the configured Site URL and land at `/auth/confirm`; they work across browsers/devices without the original PKCE cookie. The user explicitly clicks Confirm and continue before the token is consumed, reducing interference from email link scanners. Both templates include a one-time code that can be entered on the sign-in page. Request a fresh email after installing the templates; previously sent emails do not change. Keep the Site URL set to the actual deployed site, not localhost. Existing PKCE callback links remain supported in their original browser and give a recoverable error otherwise.

The built-in Supabase email sender is for testing, restricts recipients to project team addresses, and is heavily rate-limited. A successful email to the project owner does not prove that corporate/student users can receive mail. Custom SMTP is needed for general registration. Never disable confirmation to work around delivery problems.

This release is **one community per deployment**, not a multi-tenant company directory. By default, anyone who can verify their email can register and view the community. For an invitation-only corporate launch, disable new user signups in Supabase Auth and invite approved users from the dashboard. Employee authorization is not inferred from a name or a client-side email-domain check. Separate companies that need isolation must use separate projects until organization membership and tenant-scoped policies are implemented.

## 3. Configure the application

Copy `.env.example` to `.env.local` inside `next-app/` and set:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://wellness.example.com
```

Only public client credentials are needed. Do not put a service-role/secret key into the browser environment. All writes use the signed-in user's token; Postgres policies and functions enforce authorization. Missing configuration shows a setup state instead of starting a fake/demo account.

`GET /api/health` answers the only question that matters after a deploy: can this build actually serve traffic?

| Response | Meaning | Action |
| --- | --- | --- |
| `200 {"status":"ok","schema":"current"}` | Environment and schema are both good | Ship it |
| `503 {"status":"misconfigured"}` | A Supabase variable is missing or malformed | Set it and redeploy |
| `503 {"status":"degraded","schema":"missing","migration":"..."}` | The project is on an older schema | Apply the named migration |
| `200 {"schema":"unknown"}` | Configured, but the probe could not resolve the schema | Check the key can reach the PostgREST API |

It probes `group_summaries`, which only exists after migration 6, and runs as `anon` so no session is needed. Because that view is granted to `authenticated` only, a correctly-installed database answers with a permission error and a stale one answers with a missing-relation error. It never returns a key, a URL or member data.

If the schema is missing, members see the migration filename in the app too, rather than a blank page or a raw Postgres error.

### `NEXT_PUBLIC_SITE_URL` must be set at build time

Every page's canonical URL, Open Graph tags, `sitemap.xml` and `robots.txt` are produced during the build, because the public marketing pages are statically prerendered. Set `NEXT_PUBLIC_SITE_URL` in the **build** environment, not only at runtime. Vercel exposes environment variables during the build, so adding it to the project's variables and redeploying is enough. If it is unset, `siteUrl()` falls back to the Vercel production domain, then to `VERCEL_URL`, then to `http://localhost:3000`.

Setting it to the stable production origin also stops preview deployments from advertising themselves as the canonical home of your content.

From `next-app/`:

```sh
npm ci
npm run dev
```

## 4. Deploy to Vercel

Import the repository and set:

- **Root Directory:** `next-app`
- **Framework Preset:** Next.js
- **Node.js:** 22.x
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** leave at the Next.js default

`vercel.json` already pins the framework, install and build commands and the `iad1` region, so those four fields are optional.

Add all three environment variables for Production and any Preview environment that should access Supabase. Redeploy after changing them: `NEXT_PUBLIC_*` values are bundled at build time. Keep test-only `NEXT_DIST_DIR` unset. No filesystem persistence, long-running server, service-role key, or Vercel cron job is required. Supabase holds the durable data.

After the first deploy, confirm the deployment rather than trusting it:

```sh
curl -fsS https://YOUR-VERCEL-DOMAIN/api/health          # {"status":"ok",...}
curl -fsS https://YOUR-VERCEL-DOMAIN/robots.txt          # Sitemap: https://YOUR-VERCEL-DOMAIN/sitemap.xml
curl -fsS https://YOUR-VERCEL-DOMAIN/sitemap.xml | head  # <loc>https://YOUR-VERCEL-DOMAIN</loc>
curl -fsSI https://YOUR-VERCEL-DOMAIN/                  # content-security-policy, x-frame-options: DENY
```

If `/robots.txt` or the sitemap report `localhost:3000`, `NEXT_PUBLIC_SITE_URL` was not present during the build.

## 5. Create your first administrator

Sign in once to create an account and profile. In Supabase SQL editor, grant administration using the user's verified Auth UUID:

```sql
insert into public.admins(user_id)
values ('REPLACE-WITH-AUTH-USER-UUID')
on conflict do nothing;
```

Users cannot grant themselves this role. Open `/dashboard` as the administrator to review provider applications, inspect reports, confirm appointment requests, read the contact inbox, and inspect operational data. Before approving a professional, verify their identity and credentials outside the app; the software does not perform credential verification.

## Included workflows

- Email signup/signin/signout, session restoration, profile onboarding and cross-device preferences.
- Groups: browse by category, server-side search, create a subgroup in any category, join/leave, real membership counts. Member counts are resolved in Postgres rather than shipped to the browser.
- People: searchable member directory with only name, avatar, bio and interests; connection requests; recipient acceptance/decline; private text conversations after acceptance. Database policies exclude unrelated members and application admins from message reads. Chats refresh every 5 seconds while active, and connections every 10 seconds; no WebSocket quota is consumed. This is not end-to-end encryption; project/database operators retain administrative access.
- Conversations: paginated posts, replies, anonymous aliases, likes, own-content deletion, reporting, moderator hide/dismiss, reply notifications. Foreground refresh every 15 seconds; this is not an instant-message or video-call service.
- Private daily mood check-ins. These are excluded from administrator views and policies.
- Activities: search/filter, creation, joining/leaving, transactional capacity checks, organizer editing/cancellation, cancellation notifications, personal calendar and `.ics` export. Calendar exports use a one-hour duration.
- Session tasks: participant assignment, ownership-checked completion and persisted audit history.
- Providers: applications, admin approval/rejection, one-hour appointment requests with overlap prevention, confirmation and cancellation. Requests are not paid bookings. No payment, video-call, provider availability calendar or external calendar synchronization is implied.
- Notifications, contact inbox, responsive navigation, accessible form labels, retry/error/empty states, reduced-motion support, optimized local WebP imagery.

## Data access and scalability

Reads are filtered, sorted and bounded in Postgres. No component or adapter method fetches a whole table and filters the result in JavaScript.

- `group_summaries` and `session_summaries` are `security_invoker` views that resolve member counts, participant counts and the caller's membership. List pages receive one bounded page of rows; the full member roster is only read for a single session, where it is actually displayed. Row-level security still applies, because the view runs with the caller's permissions.
- Single-record reads (`getSession`, `getTask`, `getProvider`, `getBooking`) select one row by primary key.
- The group directory filters by category, membership and free text in Postgres and pages with a fixed page size. The activity directory filters by program type and "has not started" in Postgres; only free-text search and the capacity toggle are applied client-side, over one bounded page.
- The feed (`get_feed`) uses keyset pagination on post id and caps the replies embedded in each post at 50.
- Administrator counters come from `admin_stats()` and the member activity table from `admin_user_profiles()`, so the dashboard is a fixed number of round trips regardless of table size.
- Indexes were added for each of these access patterns in migration 6.

Every list read is capped. If you raise a cap, raise the matching page size in the hook at the same time.

## SEO and crawler policy

This is a private community, so SEO has to be scoped carefully. Enumerating it in a sitemap would disclose member-facing content to anyone.

- **Public and indexable:** `/`, `/landing`, `/about`, `/careers`, `/membership`, `/coming-soon`, `/contact`, `/signin`, and the program landing pages `/programs/[type]`, `/meetup-activities`, `/social-gathering`, `/task-sharing`. These render for signed-out visitors and carry a title, description, canonical URL, Open Graph and Twitter cards, and `robots: index, follow`.
- **Private and excluded:** groups, conversations, people, appointments, providers, the dashboard, the account page and session detail pages. These are behind `AuthGate`, marked `noindex, nofollow`, and disallowed in `robots.txt`.
- `src/lib/routes.ts` is the single source of truth for that split. The proxy (caching and security headers), `AuthGate`, `robots.ts` and `sitemap.ts` all read it, so the policy cannot drift from what the app enforces.
- `sitemap.ts` is generated from the public route list plus the category and program registries, so adding a public page automatically adds it to the sitemap.

Routes render server-side metadata, so `page.tsx` files are Server Components that render a Client Component view. Do not add `"use client"` to a page that exports `metadata` or `generateMetadata`; move the client logic into `src/views/`.

## Response headers

The proxy attaches `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` and a Content Security Policy to every route. The policy's `connect-src` and `img-src` are derived from the configured Supabase origin plus `api.dicebear.com`, which serves the avatars. Production adds `Strict-Transport-Security` and `upgrade-insecure-requests`; development does not, so a loopback test origin is not rewritten to https.

`Cache-Control: private, no-store` is applied only to the signed-in routes. An earlier version applied it to every response, which also prevented the sitemap, robots.txt and the public pages from being cached.

## First deploy, in order

1. Apply all six migrations to the target project. **This is the hard blocker** — the app cannot run against a project without migration 6.
2. Set all three environment variables, including `NEXT_PUBLIC_SITE_URL`, in the Vercel project. They are needed at build time.
3. Deploy.
4. Check `/api/health`. It must return `200` with `"schema":"current"`.
5. Register `/sitemap.xml` in Google Search Console and confirm `robots.txt` reports your production origin.

If step 4 returns `schema: "missing"`, step 1 did not take effect. Rerun the migration and check for a PostgREST schema-cache reload in the Supabase dashboard (Settings → API → Reload schema) before assuming the SQL failed.

## Verification

```sh
npm run typecheck
npm run test:db
npx playwright install chromium
npm run test:ui
npm run build
```

Expect 86 database checks and 21 browser scenarios to pass.

Database tests apply the actual migrations to embedded Postgres (PGlite) with simulated Supabase Auth roles. They exercise RLS, ownership, aliases, moderation, booking constraints and audit behavior. UI tests run the real Next app against a **test-only local fixture service**, so screenshots and flow checks do not require production credentials and do not prove live Supabase email delivery. Test servers are only started by Playwright and are never imported into the application.

Before inviting users, verify against your real project using two different accounts: email delivery/redirect, profile refresh, group join, cross-account post/reply visibility, private check-ins, full-session rejection, appointment confirmation and signout. No live project or Vercel deployment was provisioned as part of the local implementation.

## Operations and current boundaries

Use Supabase backups and monitoring appropriate to your project. The community is shared among authenticated members; aliases hide authors from ordinary feed responses, while moderators can see the author of reported content. Do not describe the community as untraceably anonymous. Check-ins remain private even to application administrators.

Provider hours are requested by users, with conflict prevention and manual confirmation. Paid subscriptions, payments, video meetings, push/email notifications beyond sign-in, file attachments, verified corporate domains, multi-company tenancy and co-working bookings are separate integrations, not simulated successes. Contact messages are stored in the admin inbox; no support email is automatically sent.

## Free-plan capacity and launch status — 30 September 2026

Official limits checked against [Supabase pricing](https://supabase.com/pricing), [Realtime limits](https://supabase.com/docs/guides/realtime/limits), and [SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

| Resource | Free plan | What this means for the hub |
| --- | --- | --- |
| Authentication | 50,000 monthly active users | A monthly sign-in allowance, not a guarantee of concurrent chat capacity |
| Database | 500 MB per project, shared compute | Profiles, groups, memberships, posts, messages, activity records and indexes share this space |
| File storage | 1 GB | This app currently uses bundled avatars and has no user file attachments |
| Egress | 5 GB uncached plus 5 GB cached | Repeatedly fetching chat history consumes bandwidth; these are separate allowances |
| Realtime | 200 concurrent connections, 2 million messages/month | Current conversations use foreground polling, so these WebSocket quotas do not set this app’s chat limit |
| Projects | 2 active Free projects | Projects may pause after a week of inactivity |
| Built-in email sender | Team addresses only; currently 2 emails/hour | General work/student signup needs custom SMTP and appropriate provider/Auth limits |

There is no separate Supabase quota for application groups or activities: they are database rows. This app has no fixed total count of groups or activities. Each activity currently allows 1–200 participants (an application constraint), and groups have no fixed member cap. Group feeds are shared discussions, while accepted connections enable one-to-one text chat. Live video/audio is not implemented.

Practical capacity depends on traffic and message size. For illustration, 100 open chats polling once every five seconds generate about 20 reads/second before directory/notification traffic. If each response averages 10 KB, one hour consumes roughly 720 MB of response payload. This is an estimate, not a load-test result. Start with a measured pilot, inspect database size and egress, and load-test before opening registration widely. A Realtime subscription can reduce repeated reads, but introduces its own connection and delivery quotas. Do not claim 50,000 simultaneously active chat users on this plan.

The 30 September read-only check of the project configured in `.env.local` found Email Auth enabled, signup enabled, and confirmation required. Requests for `profiles`, `groups`, and `connections` returned HTTP 404 / `PGRST205` (tables unavailable in the API schema cache). Database installation/exposure must be verified in the project dashboard before real users can use the app. This check cannot inspect SMTP, Site URL, redirect allowlists, or mail templates with the public key.

Local verification covers migration permissions and two-account messaging in embedded Postgres, plus browser flows against a fixture backend. It does not prove live email delivery or production deployment. Remaining launch work: install the missing schema, apply both email templates, verify Site URL/redirects and SMTP, deploy this source, then test signup, confirmation, onboarding, profile reload, request acceptance, and bidirectional chat with two real accounts in separate browsers. Registration currently accepts any verified email; company/student domain restrictions require an explicit allowlist and server-side enforcement before being advertised.

## Reference links

- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/auth-smtp
- https://vercel.com/docs/frameworks/full-stack/nextjs

## Live setup progress — 1 October 2026

Applied all four migrations from `supabase_setup.sql` to the configured, dedicated Supabase project after confirming its public schema was empty. The dashboard reported successful execution. A follow-up query verified 18 public tables and row-level security enabled on all 18. Anonymous API reads of profiles, groups, connections and direct_messages now return permission denied (401 / 42501), replacing the previous missing-table response. No anonymous grants were added.

Remaining verified blockers: Site URL is still `http://localhost:3000`, the redirect allowlist is empty, and custom SMTP is disabled. The dashboard currently requires custom SMTP before editing email subjects and bodies. The prepared confirmation and magic-link templates have therefore not been applied. Obtain the deployed website URL, configure its Site URL and callback allowlist, configure the email sender in Supabase, apply both templates, deploy the current application, and verify two real accounts. The SMTP settings tab is left open for continuation.

### Local-only setup — 1 October 2026

The user selected localhost operation. Site URL remains `http://localhost:3000`; the exact `http://localhost:3000/auth/callback` redirect was added and verified in Supabase. Started the app with `npm run dev -- --hostname 127.0.0.1` and verified that `http://localhost:3000/signin` renders the configured email sign-in form. Request a fresh sign-in email and open it in the same browser that requested it while the server is running (default PKCE email flow). Custom templates remain unapplied and custom SMTP remains disabled. General recipient delivery and two-account chat are not yet verified. The loopback-bound server is accessible on this computer only.

### Vercel production deployment — 1 October 2026

Deployed to https://corporate-wellness-hub-henna.vercel.app (project `corporate-wellness-hub`, deployment `dpl_47FcCzoB3cvZomwUGjiERYpTWTm9`). Both Supabase public environment variables were supplied for this deployment and saved in the project's Production environment for future deployments. `.vercelignore` excludes local environment files, build outputs, dependencies and test artifacts.

Supabase Site URL is now the production origin; the exact production `/auth/callback` URL is allowlisted alongside the existing localhost callback. Read-back confirmed both settings. The public production sign-in page returned HTTP 200 and rendered its configured email form without requiring Vercel login. A callback without a code correctly redirected to the recoverable sign-in error page. Local production build, Vercel production build and all 52 database checks passed.

Request fresh login emails from the deployed site and open them in the same browser. Custom SMTP and the custom confirmation templates remain unconfigured; general recipient email delivery and real two-account messaging remain unverified. Deployment alone does not remove the default Supabase sender restrictions.

### Community redesign and sign-in options — 1 October 2026

The main sign-in flow now supports email/password login and signup, with professional/student presentation choices and email access as a fallback. A profile type is self-declared; it does not verify corporate employment, college enrollment, or restrict email domains. New signup still requires email confirmation under the existing Supabase setting. Existing email-link members can sign in through email access, open their account via the top-right profile link, and set a password at `/account`. Sign-out now shows progress and reports errors.

LinkedIn OIDC is integrated using `linkedin_oidc`. The sign-in page checks the public Supabase Auth settings and disables the LinkedIn option with an explanatory status while the provider is unavailable. The owner confirmed that no LinkedIn Developer app exists yet. Activation requires a LinkedIn app, the Sign In with LinkedIn using OpenID Connect product, and its client ID/secret in Supabase Auth. Register `https://pclwqijgxsxzvvciilka.supabase.co/auth/v1/callback` as the LinkedIn redirect URI. See https://supabase.com/docs/guides/auth/social-login/auth-linkedin. Do not expose the LinkedIn client secret to frontend environment variables.

Migration `202610010001_group_categories.sql` adds persistent category assignment and category-aware subgroup creation. It was applied to the live database and read back: Sports 9, Wellbeing 4, Arts & culture 5, Learning & growth 5, Social & food 4, Outdoors 3 (30 subgroups total). Existing memberships and discussions are retained. New installs use the regenerated five-migration bundle; existing installations run only the new migration once.

The redesigned home and groups pages use the shared navy/teal visual system, six category tiles, filtered subgroup cards, direct member/activity/conversation actions, joined-group shortcuts, and mobile navigation. The default sender remains configured; unrestricted signup emails and real LinkedIn authentication require external provider setup and have not been verified.

Redesign validation: 58 embedded-Postgres checks passed; all 15 browser scenarios passed (14 initial scenarios plus account-password setup), and category navigation passed again after removing a redundant effect. The production build passed. Changed-file lint has no remaining errors; the two bundled-image warnings are retained. Browser test accounts and screenshots use an isolated fixture service, not production identities.
