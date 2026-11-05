# Wellness Hub — Next.js

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel and Supabase setup, supported workflows, tests, and current integration boundaries.

Commands: `npm run dev`, `npm run typecheck`, `npm run test:db`, `npm run test:ui`, `npm run build`.


Member-written text is masked through the shared Supabase REST client in
`src/lib/moderation.mjs`, including existing content loaded into the app. The
local demo API uses the same dictionary. Inputs stay editable; submissions and
public previews are masked. Passwords, tokens, identifiers, URLs, and verification
evidence are excluded.

Apply `202611010001_content_masking.sql` with the other Supabase migrations to
enforce masking on database writes from every client. Existing database rows are
not rewritten; their displayed content is masked when read by this app.
After editing the English/Hinglish/Hindi dictionary, run `npm run moderation:sql`
to regenerate the database migration and standalone setup SQL. Run
`npm run test:moderation` for dictionary, transport, and database enforcement tests.
This is dictionary matching, so context-dependent abuse and unlisted spellings
may need additions to the list.
