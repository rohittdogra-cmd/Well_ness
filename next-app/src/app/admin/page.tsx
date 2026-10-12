"use client";

import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import { AdminDashboardView } from "@/views/AdminDashboardPage";
import Link from "next/link";
import { Shield, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isAdminEmail, isValidAdminCredentials } from "@/lib/authAccounts";

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

  // If user is authenticated but NOT an admin, block access
  if (user && !isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your corporate account ({user.email}) does not have administrative privileges.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold w-full">
            <Link href="/">Return to Wellness Hub</Link>
          </Button>
        </div>
      </main>
    );
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

    if (!isValidAdminCredentials(norm, pass)) {
      setError("Invalid password for this admin account. Use Stress@420 or Stress@421.");
      setLoggingIn(false);
      return;
    }

    mockLogin(norm, "professional", undefined, pass.trim());
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
