"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export function ConfirmEmailPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    setBusy(true);
    setError("");
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");
    if (
      !token_hash ||
      !["email", "signup", "magiclink", "invite"].includes(type || "")
    ) {
      setError(
        "This confirmation link is incomplete. Request a new sign-in email.",
      );
      setBusy(false);
      return;
    }
    try {
      const { error } = await getSupabase().auth.verifyOtp({
        token_hash,
        type: type as "email" | "signup" | "magiclink" | "invite",
      });
      if (error) throw error;
      window.history.replaceState(null, "", "/auth/confirm");
      window.location.replace("/");
    } catch {
      setError(
        "We couldn’t confirm this link. It may have expired or already been used. Request a new email, or enter the latest email code on the sign-in page.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="signin-page">
      <section
        className="signin-card"
        style={{ maxWidth: 520, margin: "60px auto" }}
      >
        <span className="eyebrow">WELCOME TO YOUR HUB</span>
        <h1>Confirm your email.</h1>
        <p>
          Continue to sign in and set up your profile. You can use this link on
          any device.
        </p>
        <button className="wellness-button" onClick={confirm} disabled={busy}>
          {busy ? "Confirming…" : "Confirm and continue"}
        </button>
        {error && (
          <p role="alert" className="signin-error">
            {error}
          </p>
        )}
        <Link href="/signin" className="text-action">
          Request a new sign-in email
        </Link>
      </section>
    </main>
  );
}
