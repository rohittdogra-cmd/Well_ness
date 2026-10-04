import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configurationProblem, isConfigured, SETUP_MESSAGE, supabaseConfig } from "../env";

/**
 * A Supabase client bound to the request cookies, for Server Components,
 * Server Actions and Route Handlers.
 *
 * `setAll` is called whenever Supabase decides a refreshed session should be
 * persisted. That write is only legal in a Route Handler or Server Action, so
 * it is guarded: without the guard a token refresh during a Server Component
 * render throws instead of simply rendering.
 */
export async function serverSupabase() {
  if (!isConfigured())
    throw new Error(configurationProblem() ?? SETUP_MESSAGE);
  const jar = await cookies();
  return createServerClient(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          for (const { name, value, options } of values) jar.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. The proxy refreshes the
          // session on the next navigation, so this is safe to ignore.
        }
      },
    },
  });
}