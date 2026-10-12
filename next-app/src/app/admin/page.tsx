"use client";

import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import { AdminDashboardView } from "@/views/AdminDashboardPage";
import { Shield, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isAdminEmail } from "@/lib/authAccounts";

export default function AdminPage() {
  const { user, isInitializing, mockLogin } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // If user is authenticated and is admin, render dashboard
  if (user && (isAdmin || isAdminEmail(user.email))) {
    return <AdminDashboardView />;
  }

  if (user && adminLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Verifying admin credentials…</p>
        </div>
      </main>
    );
  }

  // Otherwise, render dedicated Admin Login Gate
  function handleAdminLogin(email: string, pass: string) {
    setError("");
    setLoggingIn(true);
    const norm = email.trim().toLowerCase();

    if (!isAdminEmail(norm)) {
      setError("This email does not have administrative privileges.");
      setLoggingIn(false);
      return;
    }

    if (norm === "chhavi.dogra@gmail.com" && pass !== "Stress@420") {
      setError("Invalid password for this admin account.");
      setLoggingIn(false);
      return;
    }

    if (norm === "chhavi0889@gmail.com" && pass !== "Stress@421") {
      setError("Invalid password for this admin account.");
      setLoggingIn(false);
      return;
    }

    mockLogin(norm, "professional", undefined, pass);
    setLoggingIn(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold font-display text-center text-foreground mb-2">
          Admin Portal Authentication
        </h1>
        <p className="text-xs text-center text-muted-foreground mb-6 leading-relaxed">
          Restricted administrative access. Please authenticate with your authorized administrator email and password.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdminLogin(adminEmail, adminPass);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Admin Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-input bg-background"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-medium"
          >
            {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Unlock Admin Panel
          </Button>
        </form>
      </div>
    </main>
  );
}
