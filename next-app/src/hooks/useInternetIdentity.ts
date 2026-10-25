"use client";
// Compatibility hook name retained; live sessions are validated by Supabase.
import { useRouter } from "next/navigation";
import type { Principal } from "@dfinity/principal";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase, isConfigured } from "@/lib/supabase/client";
import { localAccess } from "@/lib/localAccess";
export const accountId = (id: string) =>
  ({
    toText: () => id,
    toString: () => id,
    isAnonymous: () => false,
  }) as Principal;
type AuthContext = {
  user?: User;
  identity?: { getPrincipal: () => Principal };
  login: () => void;
  clear: () => Promise<void>;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
};
const Context = createContext<AuthContext | undefined>(undefined);
export function useInternetIdentity() {
  const context = useContext(Context);
  if (!context) throw new Error("Auth provider missing");
  return context;
}
export function InternetIdentityProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined>(
    localAccess
      ? {
          id: "11111111-1111-4111-8111-111111111111",
          aud: "authenticated",
          role: "authenticated",
          email: "alex@example.test",
          app_metadata: {},
          user_metadata: { name: "Smash Scorer", member_type: "professional" },
          created_at: "2026-10-25T00:00:00.000Z",
        }
      : undefined,
  );
  const [isInitializing, setInitializing] = useState(
    !localAccess && isConfigured(),
  );
  const [loginError, setError] = useState<Error>();
  const qc = useQueryClient();
  const currentUser = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (localAccess) return;
    // Discard legacy demo state. It is never an authentication credential.
    localStorage.removeItem("wellness_mock_session");
    localStorage.removeItem("wellness_stored_accounts");
    if (!isConfigured()) return;
    let active = true;
    let authEventReceived = false;
    const db = getSupabase();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      if (!active || _event === "INITIAL_SESSION") return;
      // Initial persisted sessions are accepted only after getUser validates them.
      authEventReceived = true;
      const nextId = session?.user.id;
      if (currentUser.current !== nextId) {
        void qc.cancelQueries();
        qc.clear();
        currentUser.current = nextId;
      }
      setUser(session?.user);
      setInitializing(false);
    });
    void db.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (error && error.name !== "AuthSessionMissingError")
          setError(new Error(error.message));
        if (!authEventReceived) setUser(data.user ?? undefined);
        setInitializing(false);
      })
      .catch(() => {
        if (active) {
          setError(
            new Error("Could not connect to sign-in. Please try again."),
          );
          setInitializing(false);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [qc]);
  async function clear() {
    if (!localAccess && isConfigured()) {
      const { error } = await getSupabase().auth.signOut();
      if (error) throw error;
    }
    await qc.cancelQueries();
    qc.clear();
    if (!localAccess) setUser(undefined);
    router.replace(localAccess ? "/" : "/signin");
    router.refresh();
  }
  return createElement(
    Context.Provider,
    {
      value: {
        user,
        identity: user ? { getPrincipal: () => accountId(user.id) } : undefined,
        login: () => router.push("/signin"),
        clear,
        isInitializing,
        isLoggingIn: false,
        loginError,
      },
    },
    children,
  );
}
