"use client";
// Compatibility hook name retained while all authentication now uses Supabase.
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
export const accountId = (id: string) =>
  ({
    toText: () => id,
    toString: () => id,
    isAnonymous: () => false,
  }) as Principal;
const Context = createContext<
  | {
      user?: User;
      identity?: { getPrincipal: () => Principal };
      login: () => void;
      clear: () => Promise<void>;
      isInitializing: boolean;
      isLoggingIn: boolean;
      loginError?: Error;
    }
  | undefined
>(undefined);
export function useInternetIdentity() {
  const context = useContext(Context);

  if (!context) throw new Error("Auth provider missing");
  return context;
}
export function InternetIdentityProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>();
  const [isInitializing, setInitializing] = useState(isConfigured);
  const [loginError, setError] = useState<Error>();
  const qc = useQueryClient();
  const currentUser = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!isConfigured()) return;
    const db = getSupabase();
    let active = true;
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (currentUser.current !== session?.user.id) {
        void qc.cancelQueries();
        qc.clear();
        currentUser.current = session?.user.id;
      }
      setUser(session?.user);
      setInitializing(false);
    });
    void db.auth
      .getUser()
      .then(({ data }) => {
        if (active) {
          setUser(data.user ?? undefined);
          setInitializing(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e);
          setInitializing(false);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [qc]);
  async function clear() {
    const { error } = await getSupabase().auth.signOut();
    if (error) {
      setError(error);
      throw error;
    }
    await qc.cancelQueries();
    qc.clear();
    setUser(undefined);
    window.location.assign("/signin");
  }
  return createElement(
    Context.Provider,
    {
      value: {
        user,
        identity: user ? { getPrincipal: () => accountId(user.id) } : undefined,
        login: () => window.location.assign("/signin"),
        clear,
        isInitializing,
        isLoggingIn: false,
        loginError,
      },
    },
    children,
  );
}
