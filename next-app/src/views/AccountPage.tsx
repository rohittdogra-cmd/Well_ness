"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { getSupabase } from "@/lib/supabase/client";
export function AccountPage() {
  const { user } = useInternetIdentity();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="hub-page account-page">
      <Link href="/" className="text-action">
        <ArrowLeft size={16} /> Back to your hub
      </Link>
      <header className="page-heading">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1>Make signing in simpler.</h1>
        <p>Manage your password and profile in one place.</p>
      </header>
      <div className="account-settings-card">
        <ShieldCheck size={28} />
        <h2>Sign-in details</h2>
        <p className="account-email">{user?.email}</p>
        <p>
          Already using email links? Set a password here to sign in with your
          email and password next time.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setSaved(false);
            if (password !== confirm) {
              setError("Your passwords don’t match.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await getSupabase().auth.updateUser({
                password,
              });
              if (error) throw error;
              setSaved(true);
              setPassword("");
              setConfirm("");
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Could not update your password. Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field-label" htmlFor="new-password">
            New password
          </label>
          <div className="password-field">
            <input
              id="new-password"
              required
              minLength={8}
              autoComplete="new-password"
              type={visible ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <label className="field-label" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            required
            minLength={8}
            autoComplete="new-password"
            type={visible ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button className="wellness-button" disabled={busy}>
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>
        {error && (
          <p role="alert" className="signin-error">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="password-saved">
            Password saved. You can use it the next time you sign in.
          </p>
        )}
        <Link href="/onboarding" className="text-action">
          Edit your community profile →
        </Link>
      </div>
    </div>
  );
}
