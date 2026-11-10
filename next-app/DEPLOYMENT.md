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
7. `202611010001_content_masking.sql`
8. `202611050001_member_provider_workflows.sql`
9. `202611060001_public_group_catalog.sql`
10. `202611060002_public_browsing_and_account_care.sql`
11. `202611090001_admin_member_management.sql`
12. `202611100001_admin_registration_contacts.sql`

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

Work-email verification uses Supabase's email-change flow while retaining the account ID. It changes the sign-in email after confirmation. Secure Email Change may require approval in both inboxes. A confirmed email qualifies only when its exact domain is on the administrator-approved corporate/student allowlist. Other members need individually reviewed evidence. Inbox access alone is not proof of current employment.

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

## Navigation and care release

Developed and reviewed on `codex/local-navigation-and-care`; production releases use `codex/live-auth-and-verification`. Start the member preview with `npm run dev:local` at `http://127.0.0.1:3100`. Its automatic member access and sample records are development-only. No real emails, appointments or medical services are delivered by this fixture API. Set `LOCAL_ACCESS=false` when starting the local script to exercise real sign-in UI against the isolated API (fixture password `Correct-password1`, verification code `123456`). The automatic preview recognises only the sample domains `company.example` and `college.example`; an arbitrary custom mailbox does not qualify.

This release adds a responsive top navigation and mobile drawer, five-item mobile navigation, home shortcuts to the member's groups/plans/care, profile appointment provider names, a provider workspace (`/provider`), appointment notifications, private guest care requests and safe return-to-page sign-in. Provider application writes, profile saves, and adapter RPC failures now surface errors instead of returning sample success. Empty live directories remain empty.

Pre-release audit: the old verification rule trusted confirmed domains outside a short personal-email blacklist; it is not a corporate/student allowlist. Provider applications require sign-in despite the old page saying otherwise. Approval exists, but the shipped database does not create booking/application status notifications. Calendar queries can include provider/admin-visible requests instead of only the client's requests. These are addressed by this release.

Apply only `202611050001_member_provider_workflows.sql` to an existing production database **after the localhost review and release approval**. Do not rerun the complete fresh-install bundle. This migration:

- Replaces the custom-domain blacklist with approved exact corporate/student domains or individually admin-approved evidence. The new allowlist starts empty. Approve the owner's verified organisation/institution domains through Community operations before rollout; do not approve personal-email services. Existing custom-domain users without an approved domain or approved evidence will lose interaction privileges until reviewed.
- Creates private guest appointment records and server-only gateway configuration. Signed-out visitors can read only approved psychologist listing columns. Guest requests cannot enter chat, create member accounts, expose guest contact details to community users, or confirm themselves.
- Generates in-site application/request/confirmation/cancellation notifications. Provider/admin workspace can review member and guest requests. Member bookings remain limited by verified-member rules. Both booking types share one-hour overlap checks and the next-180-days window.
- Allows a guest to view/cancel only through their unguessable receipt token. Its SHA-256 hash is stored, and the raw receipt is returned once and carried in a URL fragment (not query strings). The receipt response omits contact email. Keep links private.

Before enabling guest requests in production, generate a cryptographically random server key, store it as Vercel's **server-only** `GUEST_BOOKING_SERVER_KEY`, and insert its SHA-256 hex digest into `booking_gateway_config` (single row with `id=true`). Never put the plaintext key in Git or a `NEXT_PUBLIC_` variable. The API fails closed when it is missing. The gateway uses a keyed hash of the request address for a persistent 20-per-hour limit, plus three requests per contact email per day. Keep the configured platform proxy's request-address header trustworthy. No raw IP is stored. Rate limits are abuse reduction, not proof of email ownership or human identity.

Email booking notifications, SMS, payments, automatic clinician credential verification, availability calendars, and video consultations are not implemented. Supabase's existing SMTP handles authentication emails only; it does not deliver these care notifications. Guest pages explicitly tell visitors to save their status link and that no booking email is sent. Provider review remains a human responsibility. A preferred-time request is not a confirmed session until accepted.

Validate with `npm run typecheck`, `npm run test:db`, `npm run test:auth`, `npm run test:moderation`, `npm run test:workflows`, `npm run test:ui`, and `npm run build`. Database workflow tests run the actual migrations in isolated Postgres (PGlite), separately from UI fixtures. Browser tests cover mobile menu focus/Escape/navigation, returning and expired sessions, personal-email verification gating, provider application/admin approval, profile appointments, member and guest confirmation, notifications, and cancellation. Real inbox delivery cannot be established by fixtures.

## Public home and group discovery

Apply `202611060001_public_group_catalog.sql` before deploying this update to an existing database. It adds an anonymous catalog RPC with group descriptions and aggregate member counts only; raw membership records and conversations remain protected.

A fresh signed-out visit opens Home without a sign-in redirect. The header offers Sign in, visitors can browse group descriptions, and Join/Chat opens sign-in with a safe return path. Signed-in participation still requires the existing administrator verification rules. Private profiles, appointments, calendar and conversations still require authentication.

Validated with type checking, 34 browser tests, the database/workflow checks and a production build.

## Browse before sign-in and account-based care

Local review update: visitors can browse anonymous lounge conversations, limited People cards, groups and upcoming activities. Messaging, reactions, connection requests and joins require sign-in; corporate/student approval still gates community participation. The public lounge excludes named posts, named replies, hidden posts and all group conversations. The People projection excludes account identifiers, email, availability and alias seeds. Public activity results contain counts rather than participant/creator identities. Existing anonymous lounge posts and People/activity listings become public at the owner's explicit request.

Apply `202611060001_public_group_catalog.sql` if missing, then `202611060002_public_browsing_and_account_care.sql` before releasing this frontend. The second migration adds public read RPCs without opening underlying tables. Care requests now require an account with a confirmed email, a contact name, a preferred time and consent. Corporate/student approval is not required for care. The server records the authenticated account email and exposes booking contact details only to its provider and administrators. The unauthenticated request endpoint rejects new requests; existing guest receipt links remain valid for viewing/cancelling previous requests. Existing booking notifications and overlap checks remain active.

The redesigned care directory uses approved live providers only. Three clearly labelled sample professional cards exist solely in the isolated local demo API; none are added to production. No real doctor has been added or approved by this UI change.

Local validation: 37 browser tests, 69 database checks, migration-upgrade workflow checks, authentication and moderation suites, TypeScript checking and the production build passed. This local review has not applied the new public-browsing migrations to the production database.

## Administrator monitoring

The platform admin panel is `/admin`. Old `/dashboard` links redirect there. Regular members have no dashboard link or personal dashboard; they use their profile and calendar. The Admin panel link appears in the account menu and mobile account navigation only after `is_admin()` returns true. Both the page and its data loaders check administrator access; existing database RLS stays in force. No new privileges or migration are required.

The overview shows exact counts for current registered accounts (including unconfirmed accounts), accounts created in the last seven days, future scheduled activities, all activities, groups, approved providers, pending member/provider reviews, future pending member care requests, unresolved reports and all contact messages. Registration dates come from the automatically created profile record. Deleted accounts are excluded. Counts refresh once a minute while the overview is open, on window focus, and through Refresh.

Active participants is the distinct number of members with an activity-log entry in the rolling last seven days. Existing logs cover activity creation/join/leave, task actions and member care bookings. It excludes sign-ins, browsing, chat and current online presence. All result pages are read to avoid the API row limit silently reducing this count. Activity end times are not stored, so the interface uses Scheduled activities rather than claiming to count currently running activities.

The registered-member list is paginated at 20 accounts with display-name search and registration dates. Provider Review, Activity Logs, Booking Reports and Provider Performance remain available; Community operations now has its own tab for verification reviews, organisation domains, conversation reports and the contact inbox. The provider workspace retains access to legacy guest requests. Failed count requests show an error rather than zero.

The top navigation also includes a directly visible Log out button on desktop and mobile, in addition to the existing account-menu and drawer options. Administrators can enter `/admin` without first completing a community profile; the role check still blocks ordinary members, including accounts with no profile name.

## Member management release

Apply only `202611090001_admin_member_management.sql` to the existing deployment before publishing this client release. It adds reversible suspension, protected admin group creation, mandatory member profile completion, and caller-only permanent account deletion. Never rerun the full setup bundle on production.

An admin shortcut is visible in the top navigation. Member names open profile preferences, up to 100 group memberships, up to 50 created activities/current activity memberships, and the latest 50 audit records. Activity history shows display names and related activity/task titles when records still exist. Private messages and anonymous-post authorship are not included.

Suspension requires a reason and typed SUSPEND confirmation; restoration requires RESTORE. Existing authenticated tokens are denied protected RPC operations and direct REST access by database checks/RLS. The UI refreshes account status every 30 seconds. Public visitor browsing remains available. Administrators cannot suspend themselves or other administrators. No live suspension is part of deployment.

Regular members must provide a name (at least two characters), one interest, one availability choice and a goal. Bio remains optional. Existing incomplete profiles return to onboarding; admin management and account/security remain accessible without completing a community profile. Database participation functions enforce completion too.

Account → Delete your account requires the exact phrase DELETE MY ACCOUNT. Deletion is caller-only, permanent and cascades linked member records. Administrator accounts are protected, and providers must first cancel/transfer future appointments. Deletion tests use isolated sample accounts only. No production account is deleted during release.

Validation adds `node tests/admin-management.mjs` alongside the existing database, workflow, moderation, browser and production-build checks.


## Registration contacts, email delivery and office networks (10 November 2026)

Apply only `202611100001_admin_registration_contacts.sql` after the preceding
member-management migration, before deploying this frontend. Do not rerun the
fresh-install bundle. This additive migration provides an administrator-only RPC
that joins Auth accounts to optional profiles. Existing and future registrations
appear with their current account email, email confirmation status and profile
completion status, even before onboarding or email confirmation. Search matches
literal name/email substrings; the incomplete-profile filter resets pagination.
The member details dialog also shows account email. Addresses remain outside
public profile projections. No service-role key is required in the client, and
this change does not send outreach email. Test with `npm run test:contacts`.

### OTP delivery: evidence and remaining configuration

Read-only checks on 10 November 2026 found:

- `stress-unwind.com` SPF: `v=spf1 include:secureserver.net -all`.
- `_dmarc.stress-unwind.com`: `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`.
- The DNS authority is GoDaddy (`ns75.domaincontrol.com`, `ns76.domaincontrol.com`).
- A subsequent authenticated Chrome inspection confirmed custom SMTP enabled,
  host `smtp.gmail.com`, port `465`, and sender display name `Wellness`.
  Supabase explicitly warns that this provider is designed for personal rather
  than transactional messages and that deliverability may be impacted.
- The live Site URL is `https://stress-unwind.com`; eight exact callback URLs
  cover the custom domain, www, production Vercel URL and branch preview,
  including their account-recovery query variants. The live OTP template
  contains the one-time code and the existing `/auth/confirm` link.
- A later authorized update retained the existing Gmail SMTP account and changed
  the sender display name to `Stress Unwind`. The sign-in and signup subjects
  now identify Stress Unwind, and the templates put the OTP before the optional
  scanner-resistant confirmation link. Both saves were confirmed in Supabase.
  This is a recognition/usability improvement, not proof of improved placement.
- Sender SMTP credentials, DNS, confirmation requirements and rate limits were
  preserved. A transactional provider and verified-domain SMTP configuration
  remain an optional later delivery upgrade, not a prerequisite to using the
  existing sender.

These records do not establish the sender address, actual SMTP provider, DKIM
selector/signature, Return-Path alignment or the cause of a particular spam
classification. Do not add a guessed SPF include, create a second SPF record,
change DMARC to bypass failures, or replace DNS with Vercel DNS: GoDaddy is the
authoritative DNS provider and existing mail must keep working.

To finish delivery configuration, inspect Supabase Authentication email/SMTP
settings and the sending service's domain verification page. Use a dedicated
transactional sender on a domain the owner controls. Publish the provider's exact
DKIM and SPF/return-path records in authoritative DNS and verify them with that
provider. Preserve other legitimate senders in a single SPF record. Keep DKIM or
SPF aligned with the visible From domain for DMARC. Disable link/open tracking on
authentication emails, as described in Supabase's SMTP guide. Use the existing
scanner-resistant confirmation flow and OTP alternative.

Validate with an owner-controlled Gmail address and an affected corporate
address. In Gmail's Show original, check SPF, DKIM and DMARC results and sender
alignment; never paste the OTP or sign-in link into tickets. Confirm an actual
sign-in with the latest code, check provider delivery/bounce logs, and record
Inbox/Spam placement. Gmail decides placement and its Primary/Promotions tabs;
no template or authentication setting can guarantee Primary placement.

References: [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=en).

### Office Wi-Fi: diagnose the specific block

The production apex returned HTTPS 200 with HSTS, and Vercel's domain check
reported `misconfigured: false` with no conflicting records. This validates the
site from the checking network only. It does not demonstrate reachability from
an affected office or establish a firewall category.

Obtain the exact blocked URL, error text, security vendor/category and time from
one affected office. Compare the same URL using mobile data. If the home page
loads but sign-in/data fail, inspect whether the office blocks the Supabase host
`lxtsiwgepjrglxdvhvpm.supabase.co`, which the browser currently contacts directly.
An application change cannot override an employer's network policy.

Have the office IT team review HTTPS access to `stress-unwind.com`,
`www.stress-unwind.com` and the exact Supabase hostname above; do not ask them to
allow all Vercel/Supabase domains or disable TLS inspection globally. If their
security service misclassifies the site, use that vendor's category-review
process and recheck from the affected Wi-Fi after its policy/cache updates.
Palo Alto does not accept category-change requests for some automatic categories,
including newly registered domains and risk categories; office IT must decide
whether a scoped exception is appropriate. No request or allowlist change has
been submitted as part of these read-only checks.

References: [Fortinet URL rating review](https://docs.fortinet.com/document/fortigate/7.0.13/administration-guide/104823/online-security-tools),
[Palo Alto URL category review](https://docs.paloaltonetworks.com/advanced-url-filtering/administration/monitoring/request-to-change-the-category-for-a-url).


### Release status for the existing-resource improvements

The sign-in UI now explains how to find the sender, mark a legitimate email as
not spam, use the code when an email link is blocked, and use existing password
sign-in. This cannot restore access when the office blocks the site itself.
The administrator contacts migration was applied to production after explicit
approval. Live SQL checks verified 29 Auth accounts, a 20-row administrator page,
anonymous execution denied, and the non-admin access guard. No private email
values were included in the verification output. Earlier profile-completion and
suspension functions were confirmed present before the migration ran.

Source is committed locally on `codex/registration-and-email-delivery` at
`f7802e1`. GitHub push could not authenticate as the repository owner; the existing
working GitHub account has read-only access. Vercel CLI credentials were also
rejected. The authenticated Vercel connector accepted a direct source deployment
(`dpl_Dan4bru74wHhB65Lcu5ExEc3Wjdb`) to the existing production project. Synchronize
this branch to GitHub before the next Git-based production release, to prevent
an older repository revision from replacing the directly deployed changes.
