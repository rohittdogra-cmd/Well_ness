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
      mockLogin: (email?: string, memberType?: string) => void;
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
  const [isInitializing, setInitializing] = useState(true);
  const [loginError, setError] = useState<Error>();
  const qc = useQueryClient();
  const currentUser = useRef<string | undefined>(undefined);

  function mockLogin(email = "alex@example.com", memberType = "professional") {
    const mockUser: User = {
      id: "11111111-1111-4111-8111-111111111111",
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { member_type: memberType, name: email.split("@")[0] },
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("wellness_mock_session", JSON.stringify(mockUser));
    }
    setUser(mockUser);
    setInitializing(false);
  }

  useEffect(() => {
    if (!isConfigured()) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("wellness_mock_session");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      }
      setInitializing(false);
      return;
    }

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("wellness_mock_session");
      localStorage.removeItem("wellness_local_profile");
    }
    if (isConfigured()) {
      try {
        const { error } = await getSupabase().auth.signOut();
        if (error) setError(error);
      } catch (e) {
        console.error(e);
      }
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
        mockLogin,
        clear,
        isInitializing,
        isLoggingIn: false,
        loginError,
      },
    },
    children,
  );
}
