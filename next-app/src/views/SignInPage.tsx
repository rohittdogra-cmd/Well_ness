"use client";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { getSupabase, isConfigured } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
const subscribe = () => () => {};
type Mode = "signin" | "signup" | "code" | "reset";
function message(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "Could not connect. Please try again.";
}
export function SignInPage() {
  const { user, isInitializing } = useInternetIdentity();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [audience, setAudience] = useState("professional");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const expired = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(location.search).has("error"),
    () => false,
  );
  useEffect(() => {
    if (user && !isInitializing) router.replace("/");
  }, [user, isInitializing, router]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  function changeMode(next: Mode) {
    setMode(next);
    setSent(false);
    setCode("");
    setError("");
    setPassword("");
    setCooldown(0);
  }
  async function send() {
    const auth = getSupabase().auth;
    const address = email.trim().toLowerCase();
    const callback = location.origin + "/auth/callback";
    if (mode === "signup") {
      const { data, error } = await auth.signUp({
        email: address,
        password,
        options: { emailRedirectTo: callback, data: { member_type: audience } },
      });
      if (error) throw error;
      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }
    } else if (mode === "reset") {
      const { error } = await auth.resetPasswordForEmail(address, {
        redirectTo: callback + "?next=/account",
      });
      if (error) throw error;
    } else {
      const { error } = await auth.signInWithOtp({
        email: address,
        options: { shouldCreateUser: false, emailRedirectTo: callback },
      });
      if (error) throw error;
    }
    setSent(true);
    setCooldown(60);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        const { data, error } = await getSupabase().auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        if (!data.session)
          throw new Error("Please confirm your email before signing in.");
        router.replace("/");
        router.refresh();
      } else await send();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error } = await getSupabase().auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      if (!data.session)
        throw new Error(
          "The code did not create a session. Request a new email.",
        );
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        const { error } = await getSupabase().auth.resend({
          type: "signup",
          email: email.trim().toLowerCase(),
          options: { emailRedirectTo: location.origin + "/auth/callback" },
        });
        if (error) throw error;
        setCooldown(60);
      } else await send();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="welcome-auth">
      <section className="welcome-story">
        <Link href="/signin" className="welcome-brand">
          <span>
            <Heart size={23} />
          </span>
          wellness<span className="welcome-brand-dot">.</span>
        </Link>
        <div className="welcome-story-copy">
          <span className="welcome-eyebrow">
            <span /> GOOD PEOPLE. GOOD ENERGY.
          </span>
          <h1>
            A place to
            <br />
            pause.
            <br />
            <em>And belong.</em>
          </h1>
          <p>
            Find your lunch-break people, your weekend team, and a little more
            space to be yourself.
          </p>
        </div>
        <div className="welcome-photos">
          <figure className="welcome-photo-large">
            <Image
              src="/images/walk-together.webp"
                loading="eager"
              alt="Friends taking a sunny walk together"
              width="660"
              height="600"
            />
            <figcaption>Small moments. Better together.</figcaption>
          </figure>
          <figure className="welcome-photo-small">
            <Image
              src="/images/community-hero.webp"
              alt="Friends sharing a relaxed conversation"
              width="350"
              height="260"
            />
            <figcaption>Your kind of company.</figcaption>
          </figure>
          <span className="welcome-sun" aria-hidden="true">
            ✳
          </span>
          <span className="welcome-photo-note">
            <Sparkles size={17} /> A little connection goes a long way.
          </span>
        </div>
        <div className="welcome-story-footer">
          <span>
            <CheckCircle2 size={15} /> Shared interests
          </span>
          <span>
            <CheckCircle2 size={15} /> Real connections
          </span>
          <span>
            <CheckCircle2 size={15} /> Room to recharge
          </span>
        </div>
      </section>
      <section className="welcome-form-side">
        <div className="welcome-form-card">
          <span className="welcome-form-kicker">
            <ShieldCheck size={16} /> YOUR SPACE STARTS HERE
          </span>
          <h2>
            {sent
              ? "Check your inbox."
              : mode === "signup"
                ? "Find your people."
                : mode === "code"
                  ? "One email. A fresh start."
                  : mode === "reset"
                    ? "Let’s get you back in."
                    : "Welcome to your hub."}
          </h2>
          <p className="welcome-form-intro">
            {sent
              ? `If an eligible account exists, we’ve sent an email to ${email.trim()}. Open its link${mode === "reset" ? " to reset your password" : " or enter the code below"}.`
              : mode === "signup"
                ? "A little connection. A lot of possibility. Create your account to get started."
                : mode === "code"
                  ? "We’ll send a secure sign-in link to your inbox. No password needed."
                  : mode === "reset"
                    ? "Enter your account email and we’ll send a secure password reset link."
                    : "Your circles, conversations and next good thing are waiting."}
          </p>
          {!isConfigured() && (
            <p className="welcome-error" role="status">
              Sign-in is temporarily unavailable. Please try again once setup is
              complete.
            </p>
          )}
          {sent ? (
            <>
              {mode !== "reset" && (
                <form onSubmit={verify}>
                  <label htmlFor="email-code">Email verification code</label>
                  <input
                    id="email-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Code from your email"
                    pattern="[0-9]{6,10}"
                    minLength={6}
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <button
                    className="wellness-button welcome-submit"
                    disabled={busy}
                  >
                    {busy ? (
                      <LoaderCircle size={18} className="spin" />
                    ) : (
                      "Verify code and continue"
                    )}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
              <p className="welcome-email-tip">
                Use the latest email. Check spam if it hasn’t arrived. Email
                links can be opened in this browser; codes work across devices
                when included in the email.
              </p>
              <button
                type="button"
                className="welcome-text-button"
                disabled={busy || cooldown > 0}
                onClick={resend}
              >
                {cooldown ? `Resend email in ${cooldown}s` : "Resend email"}
              </button>
              <button
                type="button"
                className="welcome-back"
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setError("");
                }}
              >
                <ArrowLeft size={16} /> Change email or go back
              </button>
            </>
          ) : (
            <>
              {mode === "signup" && (
                <div className="welcome-audience">
                  <button
                    type="button"
                    aria-pressed={audience === "professional"}
                    onClick={() => setAudience("professional")}
                  >
                    <BriefcaseBusiness size={17} /> Professional
                  </button>
                  <button
                    type="button"
                    aria-pressed={audience === "student"}
                    onClick={() => setAudience("student")}
                  >
                    <GraduationCap size={19} /> Student
                  </button>
                </div>
              )}
              <form onSubmit={submit}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={
                    audience === "student"
                      ? "you@college.edu"
                      : "you@example.com"
                  }
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {(mode === "signin" || mode === "signup") && (
                  <>
                    <div className="welcome-label-row">
                      <label htmlFor="password">
                        {mode === "signup" ? "Create a password" : "Password"}
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => changeMode("reset")}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="welcome-password">
                      <input
                        id="password"
                        type={visible ? "text" : "password"}
                        autoComplete={
                          mode === "signup"
                            ? "new-password"
                            : "current-password"
                        }
                        required
                        minLength={mode === "signup" ? 8 : 1}
                        placeholder={
                          mode === "signup"
                            ? "At least 8 characters"
                            : "Enter your password"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label={visible ? "Hide password" : "Show password"}
                        aria-pressed={visible}
                        onClick={() => setVisible(!visible)}
                      >
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                )}
                <button
                  className="wellness-button welcome-submit"
                  disabled={busy || isInitializing || !isConfigured()}
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={18} className="spin" /> Please wait…
                    </>
                  ) : (
                    <>
                      {mode === "signup"
                        ? "Create account"
                        : mode === "code"
                          ? "Send sign-in email"
                          : mode === "reset"
                            ? "Send reset link"
                            : "Sign in"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              {mode === "signin" ? (
                <>
                  <div className="welcome-divider">
                    <span />
                    or keep it simple
                    <span />
                  </div>
                  <button
                    type="button"
                    className="welcome-email-button"
                    aria-label="No password yet? Use email access"
                    onClick={() => changeMode("code")}
                  >
                    <Mail size={18} /> Email me a sign-in link
                    <ArrowRight size={17} />
                  </button>
                  <p className="welcome-switch">
                    New around here?{" "}
                    <button type="button" onClick={() => changeMode("signup")}>
                      Create an account
                    </button>
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  className="welcome-back"
                  onClick={() => changeMode("signin")}
                >
                  <ArrowLeft size={16} /> Back to sign in
                </button>
              )}
            </>
          )}
          {(error || (expired && !sent)) && (
            <p role="alert" className="welcome-error">
              {error ||
                "That sign-in link could not be confirmed. Request a fresh email and try again."}
            </p>
          )}
          <div className="welcome-verification-note">
            <ShieldCheck size={21} />
            <p>
              Start by exploring.
              <br />
              <span>
                Verify your profile to unlock chat, messages and bookings.
              </span>
            </p>
          </div>
        </div>
        <p className="welcome-bottom">
          Make time for yourself. Make room for connection.
        </p>
      </section>
    </main>
  );
}
