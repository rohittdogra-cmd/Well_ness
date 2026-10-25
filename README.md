# Wellness Hub

The production application lives in **next-app/** and targets **Vercel + Supabase**.

To run locally without an email, password, or Supabase account (Node.js 22):

```sh
cd next-app
npm ci
npm run dev:local
```

Open http://127.0.0.1:3100. This starts the app and its isolated demo API,
automatically enters a demo profile, and uses sample data held in memory.
Demo changes reset when the API restarts; some workflows are simulated.
Use `PORT=3102 npm run dev:local` to choose another app port. The demo API
uses port 54329. Automatic access is enabled only by this development command;
production builds retain the regular sign-in flow.

Start with [the deployment guide](next-app/DEPLOYMENT.md) for database migrations, email sign-in, environment variables and Vercel settings.

```sh
cd next-app
npm ci
npm run dev
```

The application includes persistent profiles, groups, discussions, private check-ins, activities, tasks, appointment requests, notifications and administrator moderation. The original Caffeine export in `src/` is retained as historical source, not the deployed backend.
