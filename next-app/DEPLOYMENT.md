# Wellness Hub: Vercel + Supabase

The maintained application is `next-app/`. The original Caffeine export under `src/` is retained as historical source.

## Current production connection

- GitHub: https://github.com/rohittdogra-cmd/Well_ness
- Production branch: `codex/live-auth-and-verification`
- Vercel: `well-ness`, team `well-ness1`, root directory `next-app`
- Custom domain: https://stress-unwind.com (`www` redirects to the apex)
- Vercel verification URL: https://well-ness-pink.vercel.app
- Scheduled public opening: 5 November 2026 at 11:12 PM IST (`2026-11-05T17:42:00.000Z`)
- Supabase: project `lxtsiwgepjrglxdvhvpm`, owned by `rohittdogra-cmd`

The updated branch preserves the repository's separate `scalable-backend-and-seo` history. Future pushes to the production branch deploy through Vercel's existing GitHub connection.

Supabase has the original 18 wellness tables plus `verification_requests`. All 19 tables have row-level security. The verification migration adds nine triggers to protect participation. The live Site URL and exact production and branch-preview authentication callbacks are configured. The callback for the deleted `well-ness-pigf` deployment was removed. Custom SMTP is enabled, with the existing sender credentials retained.

No GitHub token, SMTP password, service-role key or other server secret is included in the repository. Vercel receives only the two Supabase public client settings, for Production and Preview. A new deployment is required after changing public environment values.

## Run locally

Use Node.js 22:

```sh
cd next-app
npm ci
cp .env.example .env.local
# Fill in the public client settings for your Supabase project.
npm run dev
```

For an isolated preview with sample data and automatic local access:

```sh
npm run dev:local
```

Open http://127.0.0.1:3100. This command starts the development app and an in-memory demo API on port 54329. Demo verification uses code `123456` after requesting a code; no email is sent, no employment is verified, and ID photos are not retained. Demo data resets when the API restarts. `PORT=3102 npm run dev:local` selects another app port. Automatic local access is disabled in production builds.

## Database installation

For a **new, empty, dedicated project**, apply `supabase_setup.sql` once. It contains these migrations in order:

1. `202609270001_wellness.sql`
2. `202609270002_operations.sql`
3. `202609270003_session_updates.sql`
4. `202609300001_connections.sql`
5. `202610010001_group_categories.sql`
6. `202610250001_verification.sql`

For an existing installation, apply only missing migrations. Never rerun the fresh-install bundle or apply it to an unrelated shared database. This deployment uses one private community per project, without company-level tenant isolation.

## Authentication

Enable Supabase Email authentication and keep email confirmation required. Live authentication accepts only successful Supabase responses. It never accepts arbitrary passwords, arbitrary six-digit codes, one-click production demo accounts, or legacy local mock sessions. Legacy stored mock sessions and stored passwords are discarded on startup.

The sign-in page supports email/password login, confirmed signup, email-link/OTP login, resends with a cooldown, and password recovery. Corporate/student selection is profile metadata; it does not itself verify employment or student status.

Use these email template sources in Supabase:

- Confirm signup: `supabase/templates/confirmation.html`
- Magic link / OTP: `supabase/templates/magic-link.html`
- Reset password: `supabase/templates/recovery.html`
- Change email address: `supabase/templates/email-change.html`

These templates were saved to the supplied live project. Confirmation and magic links go to `/auth/confirm`, where a person explicitly confirms before the token is consumed. This supports another browser/device and reduces accidental consumption by email scanners. Both include an OTP alternative. Recovery links return to `/account`, including for a member who has not completed onboarding. Existing PKCE links through `/auth/callback` remain supported. Callback destinations are limited to `/` and `/account`.

Set Site URL to the production origin. Allow only the exact `/auth/callback` URLs for production and any preview you use, including the recovery query `?next=/account`. Do not use a broad wildcard across unrelated sites.

The configured SMTP provider remains responsible for delivery, sender limits and spam handling. A configured sender is not proof of delivery to every recipient. Real delivery and the final signed-in session must be checked with an owner-controlled email; fixture tests cannot establish that.

## Member verification

Unverified members may browse. Database triggers protect group creation/joining, reactions, posts/replies, connections, direct messages, activity creation/joining and provider bookings. Reports, account management, private check-ins, leaving groups/activities and cancellation remain available according to their existing permissions.

Work-email verification uses Supabase's email-change flow while retaining the account ID. It changes the sign-in email after confirmation. Secure Email Change may require approval in both inboxes. A confirmed organisation email qualifies; common personal-email domains are excluded. Inbox access is not proof of current employment. A stricter organisation policy needs an explicit domain allowlist.

Alternate verification accepts a LinkedIn URL or a JPG/PNG employee, government, student, educator or professional ID, up to 2 MB. Requests stay pending until reviewed through Dashboard → Community operations → Verification requests. RLS limits evidence to its owner and administrators; members cannot approve themselves. Proof is removed after the decision. Pending evidence remains until review or account deletion.

Create the first administrator only after the owner has registered and the intended account ID is confirmed, using the existing `public.admins` table. Never grant administrator access through client-side metadata.

## Validation

```sh
npm run typecheck
npm run test:db
npm run test:ui
npm run build
```

The browser tests use an isolated fixture backend on port 54330 and a separate app on port 3101. They do not require the live project, send real emails, or authenticate test identities against production. The production connection was checked for healthy Auth settings, rejection of invalid passwords, denied anonymous profile access, and denied anonymous verification RPC access.

## Timed custom-domain launch

Production `LAUNCH_AT` is `2026-11-05T17:42:00.000Z`; `LAUNCH_HOSTS` is `stress-unwind.com,www.stress-unwind.com`. The server proxy serves an uncached launch screen on those hosts before that instant, then passes requests through to the authenticated hub. The countdown uses server time, and the page reloads automatically at opening. Vercel URLs remain available for release checks. DNS and HTTPS must be validated before launch. No later manual deployment or scheduled chat is required to open the hub.

Run `node --test tests/launch.mjs` to verify the exact time boundary and host scoping. Authentication callbacks for both custom-domain hosts are allowlisted in Supabase. Set the Supabase Site URL to `https://stress-unwind.com` when DNS is connected.
