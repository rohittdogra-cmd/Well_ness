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

import {
  deterministicIdForEmail,
  getStoredAccountByEmail,
  saveStoredAccount,
  setLastLoginEmail,
} from "@/lib/authAccounts";

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
      mockLogin: (
        email?: string,
        memberType?: string,
        customId?: string,
        password?: string,
      ) => void;
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

  function mockLogin(
    email = "alex@example.com",
    memberType = "professional",
    customId?: string,
    password?: string,
  ) {
    const normEmail = email.trim().toLowerCase();
    const existing = getStoredAccountByEmail(normEmail);
    const userId = customId || existing?.id || deterministicIdForEmail(normEmail);

    const mockUser: User = {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: normEmail,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {
        member_type: memberType || existing?.memberType || "professional",
        name: existing?.name || normEmail.split("@")[0],
      },
      created_at: existing?.createdAt || new Date().toISOString(),
    };

    saveStoredAccount({
      id: userId,
      email: normEmail,
      password: password !== undefined ? password : existing?.password,
      memberType:
        (memberType as "professional" | "student") ||
        existing?.memberType ||
        "professional",
      name: mockUser.user_metadata.name,
      createdAt: mockUser.created_at,
      lastLoginAt: new Date().toISOString(),
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("wellness_mock_session", JSON.stringify(mockUser));
      setLastLoginEmail(normEmail);
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
