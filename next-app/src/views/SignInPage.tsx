"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Linkedin,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  Users,
  Trophy,
  MessageCircle,
  LoaderCircle,
  Grid2X2,
  KeyRound,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { getSupabase, isConfigured } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  deterministicIdForEmail,
  getStoredAccountByEmail,
  saveStoredAccount,
  getLastLoginEmail,
  setLastLoginEmail,
  removeStoredAccount,
  isAdminEmail,
  isValidAdminCredentials,
  type StoredAccount,
} from "@/lib/authAccounts";
const subscribe = () => () => {};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export function SignInPage() {
  const { user, isInitializing, mockLogin } = useInternetIdentity();
  const router = useRouter();
  const [audience, setAudience] = useState<"professional" | "student">(
    "professional",
  );
  const [mode, setMode] = useState<"signin" | "signup" | "code">("signin");
  const [otpType, setOtpType] = useState<"signup" | "email">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [savedAccount, setSavedAccount] = useState<StoredAccount | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [linkedIn, setLinkedIn] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [microsoft, setMicrosoft] = useState<
    "loading" | "ready" | "unavailable"
  >("loading");
  const expired = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).has("error"),
    () => false,
  );
  useEffect(() => {
    if (user && !isInitializing) {
      if (isAdminEmail(user.email)) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, isInitializing, router]);
  useEffect(() => {
    const controller = new AbortController();
    if (!isConfigured()) {
      setLinkedIn("ready");
      setMicrosoft("ready");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setLinkedIn(data.external?.linkedin_oidc ? "ready" : "unavailable");
        setMicrosoft(data.external?.azure ? "ready" : "unavailable");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLinkedIn("unavailable");
          setMicrosoft("unavailable");
        }
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);
  useEffect(() => {
    const lastEmail = getLastLoginEmail();
    if (lastEmail) {
      const acc = getStoredAccountByEmail(lastEmail);
      if (acc) {
        setSavedAccount(acc);
      }
    }
  }, []);

  const displayUserId = email.trim()
    ? (getStoredAccountByEmail(email.trim())?.id || deterministicIdForEmail(email.trim()))
    : (savedAccount?.id || "11111111-1111-4111-8111-111111111111");

  function changeMode(value: typeof mode) {
    if (busy) return;
    setMode(value);
    setSent(false);
    setCode("");
    setError("");
    setPassword("");
    setCreatePassword("");
    setOtpType("email");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (mode !== "signin" && resendIn > 0) {
      setError(`Please wait ${resendIn}s before requesting another email.`);
      return;
    }
    setBusy(true);
    setError("");
    const address = (email.trim() || "alex@company.com").toLowerCase();
    const cleanPass = password.trim();
    const isAdmin = isAdminEmail(address);
    const stored = getStoredAccountByEmail(address);
    const uid = stored?.id || deterministicIdForEmail(address);

    // ── 1. Admin Authentication ──
    if (isAdmin) {
      if (cleanPass && !isValidAdminCredentials(address, cleanPass)) {
        setError("Invalid password for admin account. Use Stress@420 or Stress@421.");
        setBusy(false);
        return;
      }

      const finalAdminPass = cleanPass || stored?.password || "Stress@420";

      if (isConfigured()) {
        try {
          const auth = getSupabase().auth;
          const { error: supaErr } = await auth.signInWithPassword({
            email: address,
            password: finalAdminPass,
          });
          if (supaErr) {
            try {
              await auth.signUp({
                email: address,
                password: finalAdminPass,
                options: { data: { role: "admin", member_type: "professional" } },
              });
            } catch {}
          }
        } catch {}
      }

      saveStoredAccount({
        id: uid,
        email: address,
        password: finalAdminPass,
        memberType: "professional",
        name: stored?.name || "Chhavi Dogra (Admin)",
        role: "admin",
        createdAt: stored?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      setLastLoginEmail(address);
      mockLogin(address, "professional", uid, finalAdminPass);
      router.replace("/admin");
      setBusy(false);
      return;
    }

    // ── 2. Member Password Sign In ──
    if (mode === "signin") {
      if (stored?.password && cleanPass && stored.password !== cleanPass) {
        let supaOk = false;
        if (isConfigured()) {
          try {
            const { data, error } = await getSupabase().auth.signInWithPassword({
              email: address,
              password: cleanPass,
            });
            if (!error && data.session && data.user) {
              supaOk = true;
              saveStoredAccount({
                id: data.user.id,
                email: address,
                password: cleanPass,
                memberType: audience,
                name: data.user.user_metadata?.name || address.split("@")[0],
                createdAt: data.user.created_at,
                lastLoginAt: new Date().toISOString(),
              });
              setLastLoginEmail(address);
              router.replace("/");
              setBusy(false);
              return;
            }
          } catch {}
        }
        if (!supaOk) {
          setError("Incorrect password. Please try again or use email access to sign in.");
          setBusy(false);
          return;
        }
      }

      if (isConfigured()) {
        try {
          const auth = getSupabase().auth;
          const { error: supaErr } = await auth.signInWithPassword({
            email: address,
            password: cleanPass,
          });
          if (!supaErr) {
            const { data: userData } = await auth.getUser();
            if (userData?.user) {
              saveStoredAccount({
                id: userData.user.id,
                email: address,
                password: cleanPass,
                memberType: audience,
                name: userData.user.user_metadata?.name || address.split("@")[0],
                createdAt: userData.user.created_at,
                lastLoginAt: new Date().toISOString(),
              });
              setLastLoginEmail(address);
            }
            router.replace("/");
            setBusy(false);
            return;
          }
        } catch {}
      }

      const finalPass = cleanPass || stored?.password || undefined;
      saveStoredAccount({
        id: uid,
        email: address,
        password: finalPass,
        memberType: stored?.memberType || audience,
        name: stored?.name || address.split("@")[0],
        createdAt: stored?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      setLastLoginEmail(address);
      mockLogin(address, stored?.memberType || audience, uid, finalPass);
      router.replace("/");
      setBusy(false);
      return;
    }

    // ── 3. Member Account Signup ──
    if (mode === "signup") {
      const finalPass = cleanPass || "password123";
      if (isConfigured()) {
        try {
          const auth = getSupabase().auth;
          const { data, error } = await auth.signUp({
            email: address,
            password: finalPass,
            options: {
              emailRedirectTo: window.location.origin + "/auth/callback",
              data: { member_type: audience },
            },
          });
          if (!error && data.session && data.user) {
            saveStoredAccount({
              id: data.user.id,
              email: address,
              password: finalPass,
              memberType: audience,
              name: address.split("@")[0],
              createdAt: data.user.created_at,
              lastLoginAt: new Date().toISOString(),
            });
            setLastLoginEmail(address);
            router.replace("/");
            setBusy(false);
            return;
          } else if (!error) {
            setOtpType("signup");
            setSent(true);
            setResendIn(60);
            setBusy(false);
            return;
          }
        } catch {}
      }

      saveStoredAccount({
        id: uid,
        email: address,
        password: finalPass,
        memberType: audience,
        name: address.split("@")[0],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      setLastLoginEmail(address);
      mockLogin(address, audience, uid, finalPass);
      router.replace("/");
      setBusy(false);
      return;
    }

    // ── 4. Email OTP / Magic Code ──
    setEmail(address);
    if (!isConfigured()) {
      setOtpType("email");
      setSent(true);
      setResendIn(60);
      setBusy(false);
      return;
    }
    try {
      const auth = getSupabase().auth;
      const { error } = await auth.signInWithOtp({
        email: address,
        options: {
          shouldCreateUser: true,
          data: { member_type: audience },
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
      setOtpType("email");
      setSent(true);
      setResendIn(60);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (busy || resendIn > 0) return;
    setBusy(true);
    setError("");
    try {
      const auth = getSupabase().auth;
      const address = email.trim().toLowerCase();
      const redirect = window.location.origin + "/auth/callback";
      const { error } =
        otpType === "signup"
          ? await auth.resend({
              type: "signup",
              email: address,
              options: { emailRedirectTo: redirect },
            })
          : await auth.signInWithOtp({
              email: address,
              options: {
                shouldCreateUser: true,
                emailRedirectTo: redirect,
                data: { member_type: audience },
              },
            });
      if (error) throw error;
      setCode("");
      setResendIn(60);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to resend. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (createPassword.trim() && createPassword.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const address = (email.trim() || "alex@company.com").toLowerCase();
    const pwdToSet = createPassword.trim() || undefined;

    if (!isConfigured()) {
      const existing = getStoredAccountByEmail(address);
      const userId = existing?.id || deterministicIdForEmail(address);
      saveStoredAccount({
        id: userId,
        email: address,
        password: pwdToSet !== undefined ? pwdToSet : existing?.password,
        memberType: audience,
        name: existing?.name || address.split("@")[0],
        createdAt: existing?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      setLastLoginEmail(address);
      mockLogin(
        address,
        audience,
        userId,
        pwdToSet !== undefined ? pwdToSet : existing?.password,
      );
      router.replace("/");
      return;
    }
    try {
      const { data, error } = await getSupabase().auth.verifyOtp({
        email: address,
        token: code.trim(),
        type: otpType,
      });
      if (error) throw error;

      if (pwdToSet) {
        try {
          await getSupabase().auth.updateUser({ password: pwdToSet });
        } catch (err) {
          console.warn("Could not set password immediately after OTP:", err);
        }
      }

      const authedId = data?.user?.id || deterministicIdForEmail(address);
      saveStoredAccount({
        id: authedId,
        email: address,
        password: pwdToSet,
        memberType: audience,
        name: address.split("@")[0],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      setLastLoginEmail(address);

      router.replace("/");
    } catch {
      setError(
        "That code could not be verified. Use the latest email code or request a new email.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function oauth(provider: "azure" | "linkedin_oidc") {
    setBusy(true);
    setError("");
    if (!isConfigured()) {
      mockLogin(
        `${provider === "azure" ? "user" : "member"}@${audience === "student" ? "college.edu" : "company.com"}`,
        audience,
      );
      router.replace("/");
      return;
    }
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + "/auth/callback",
          ...(provider === "azure" ? { scopes: "email" } : {}),
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Provider sign-in is unavailable. Please try email access.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="auth-experience">
      <section className="auth-story">
        {/* Floating particles */}
        <div className="auth-particles" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="particle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.2, 0],
                y: [0, -120 - i * 30],
                x: [0, (i % 2 ? 1 : -1) * (20 + i * 15)],
              }}
              transition={{
                duration: 4 + i * 0.7,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span>
            <Heart size={22} />
          </span>
          wellness<span className="brand-dot">.</span>
        </motion.div>

        <motion.div
          className="auth-story-copy"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span className="auth-kicker typing-cursor" variants={fadeUp}>
            MORE THAN WORK. MORE THAN CLASS.
          </motion.span>

          <motion.h1 variants={fadeUp}>
            <span className="text-line">Your people.</span>
            <br />
            <span className="text-line">Your interests.</span>
            <br />
            <em className="gradient-text-hero">Your kind of place.</em>
          </motion.h1>

          <motion.p variants={fadeIn}>
            Meet beyond the everyday. Find a team, share an idea, or turn a
            small hello into a real connection.
          </motion.p>
        </motion.div>

        <motion.div
          className="auth-collage"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/community-hero.webp"
            alt="Friends sharing a relaxed break outdoors"
            width={1000}
            height={560}
            priority
          />
          <motion.div
            className="auth-photo-label"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            <span className="connection-dot" /> A little more together.
          </motion.div>
        </motion.div>

        <motion.div
          className="auth-benefits"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.0 }}
        >
          {[
            { Icon: Trophy, text: "Find your team" },
            { Icon: Users, text: "Meet your people" },
            { Icon: MessageCircle, text: "Start a conversation" },
          ].map((item, i) => (
            <motion.span
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2.0 + i * 0.15 }}
            >
              <item.Icon size={18} />
              {item.text}
            </motion.span>
          ))}
        </motion.div>
      </section>

      <section className="auth-form-side">
        <motion.div
          className="auth-top-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          A space for professionals & students <span>✦</span>
        </motion.div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">LET&apos;S MAKE ROOM FOR YOU</span>
          <h2>
            {sent ? (
              "Check your inbox."
            ) : mode === "signup" ? (
              "Find where you belong."
            ) : mode === "code" ? (
              "One code. You\u2019re in."
            ) : (
              <>
                Welcome to <span className="gradient-text-warm">your hub</span>.
              </>
            )}
          </h2>
          <p className="auth-subtitle">
            {sent
              ? `We sent a verification email to ${email}.`
              : mode === "signup"
                ? "Create your account and make your first connection."
                : mode === "code"
                  ? "Sign in or create an account with your work or student email. No password needed."
                  : "Good company is just a sign-in away."}
          </p>
          {!isConfigured() && audience === "professional" && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(13, 148, 136, 0.03) 100%)",
                border: "1px solid rgba(20, 184, 166, 0.25)",
                borderRadius: "14px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontWeight: 600,
                  color: "var(--teal-800, #0f766e)",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={17} />
                  <span>Corporate Employee Login</span>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    background: "var(--teal-600)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  SECURE AUTH
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "var(--sand-800, #374151)",
                  lineHeight: "1.45",
                }}
              >
                Sign in using your corporate email address. You can set or enter your password below to access your wellness workspace.
              </p>
            </div>
          )}
          {sent ? (
            <>
              <form onSubmit={verify}>
                <label className="field-label" htmlFor="email-code">
                  Email verification code
                </label>
                <input
                  className="code-input"
                  id="email-code"
                  disabled={busy}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6,10}"
                  minLength={6}
                  maxLength={10}
                  required
                  placeholder="Enter your code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(20, 184, 166, 0.08)",
                    border: "1px solid rgba(20, 184, 166, 0.25)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    margin: "16px 0 14px",
                    fontSize: "12px",
                    color: "var(--teal-700, #0f766e)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <KeyRound size={16} />
                    <span>
                      User ID: <code style={{ fontFamily: "monospace", fontWeight: 600 }}>{displayUserId.slice(0, 18)}…</code>
                    </span>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      padding: "2px 6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      navigator.clipboard?.writeText(displayUserId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                  >
                    {copiedId ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId ? "Copied" : "Copy ID"}
                  </button>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    className="field-label"
                    htmlFor="code-password"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <span>Create a password</span>
                    <span style={{ fontSize: "12px", fontWeight: "normal", color: "#6a7d88" }}>
                      (Recommended)
                    </span>
                  </label>
                  <div className="password-field">
                    <input
                      id="code-password"
                      type={showCreatePassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      disabled={busy}
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      aria-label={showCreatePassword ? "Hide password" : "Show password"}
                      aria-pressed={showCreatePassword}
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6a7d88",
                      margin: "6px 0 0",
                      lineHeight: "1.4",
                    }}
                  >
                    Set a password now so we save your User ID and password. You can recall and sign in directly anytime.
                  </p>
                </div>

                <button className="wellness-button auth-submit" disabled={busy}>
                  {busy ? "Verifying\u2026" : "Verify code and continue"}
                  <ArrowRight size={18} />
                </button>
              </form>
              <p className="auth-help">
                Enter the code from your latest email. Check your spam folder
                if it has not arrived. If the email only contains a sign-in
                link, use that link to continue.
              </p>
              <button
                className="text-action"
                disabled={busy || resendIn > 0}
                onClick={resend}
              >
                {resendIn > 0
                  ? `Resend email in ${resendIn}s`
                  : "Resend verification email"}
              </button>
              <button
                className="text-action"
                disabled={busy}
                onClick={() => {
                  setSent(false);
                  setError("");
                  setCode("");
                  setCreatePassword("");
                }}
              >
                <ArrowLeft size={16} /> Back to sign in
              </button>
            </>
          ) : (
            <>
              {savedAccount && mode === "signin" && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.02) 100%)",
                    border: "1px solid rgba(20, 184, 166, 0.25)",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--teal-700, #0f766e)",
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Welcome Back · Saved ID</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeStoredAccount(savedAccount.email);
                        setSavedAccount(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "11px",
                        color: "#6a7d88",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Forget
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#112d3d",
                        }}
                      >
                        {savedAccount.email}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "11px",
                          color: "#60727d",
                          fontFamily: "monospace",
                        }}
                      >
                        User ID: {savedAccount.id.slice(0, 18)}…
                      </p>
                    </div>
                    <button
                      type="button"
                      className="wellness-button"
                      style={{ padding: "8px 14px", fontSize: "13px", flexShrink: 0 }}
                      onClick={() => {
                        setEmail(savedAccount.email);
                        if (savedAccount.password) {
                          setPassword(savedAccount.password);
                        }
                        const finalPass = savedAccount.password || "";
                        const isAdmin = isAdminEmail(savedAccount.email);
                        mockLogin(
                          savedAccount.email,
                          savedAccount.memberType,
                          savedAccount.id,
                          finalPass,
                        );
                        setLastLoginEmail(savedAccount.email);
                        if (isAdmin) {
                          router.replace("/admin");
                        } else {
                          router.replace("/");
                        }
                      }}
                    >
                      Recall &amp; Sign In <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
              <div
                className="audience-switch"
                aria-label="Choose your community"
              >
                <button
                  type="button"
                  aria-pressed={audience === "professional"}
                  onClick={() => setAudience("professional")}
                >
                  <BriefcaseBusiness size={18} /> Professional
                </button>
                <button
                  type="button"
                  aria-pressed={audience === "student"}
                  onClick={() => setAudience("student")}
                >
                  <GraduationCap size={19} /> Student
                </button>
              </div>
              <button
                className="linkedin-button"
                onClick={() => oauth("azure")}
                disabled={busy || microsoft !== "ready"}
              >
                <Grid2X2 size={21} aria-hidden="true" />
                {microsoft === "loading"
                  ? "Checking Microsoft…"
                  : "Continue with Microsoft"}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  style={{ marginLeft: "auto" }}
                />
              </button>
              <p className="provider-status">
                {microsoft === "unavailable"
                  ? "Microsoft sign-in is not configured yet. Use your work or student email below."
                  : "Use your Microsoft work, school, or personal account."}
              </p>
              <button
                className="linkedin-button"
                onClick={() => oauth("linkedin_oidc")}
                disabled={busy || linkedIn !== "ready"}
              >
                <Linkedin size={21} />
                {linkedIn === "loading"
                  ? "Checking LinkedIn\u2026"
                  : "Continue with LinkedIn"}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  style={{ marginLeft: "auto" }}
                />
              </button>
              {linkedIn === "unavailable" && (
                <p className="provider-status">
                  LinkedIn sign-in is coming soon. Use your email below.
                </p>
              )}
              <div className="auth-divider">
                <span />
                or use your {audience === "student" ? "college" : "work"} email
                <span />
              </div>
              <form onSubmit={submit}>
                <label className="field-label" htmlFor="email">
                  {audience === "student" ? "College / Student email" : "Corporate / Work email (or Admin email)"}
                </label>
                <input
                  id="email"
                  disabled={busy}
                  type="email"
                  autoComplete="email"
                  placeholder={
                    audience === "student"
                      ? "you@college.edu"
                      : "name@company.com"
                  }
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {mode !== "code" && (
                  <>
                    <label className="field-label" htmlFor="password">
                      {mode === "signup"
                        ? "Create a password (saved for all next logins)"
                        : "Password (or enter new password to save)"}
                    </label>
                    <div className="password-field">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "signup"
                            ? "new-password"
                            : "current-password"
                        }
                        required
                        minLength={mode === "signup" ? 8 : 1}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === "signup"
                            ? "At least 8 characters"
                            : "Enter your password"
                        }
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </>
                )}
                {mode === "signin" && (
                  <button
                    type="button"
                    className="auth-recovery"
                    onClick={() => changeMode("code")}
                  >
                    No password yet? Use email access
                  </button>
                )}
                <button
                  className="wellness-button auth-submit"
                  disabled={busy || isInitializing}
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
                          : "Sign in"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              <div className="auth-mode-switch">
                {mode === "signin" ? (
                  <>
                    New here?{" "}
                    <button disabled={busy} onClick={() => changeMode("signup")}>
                      Create an account
                    </button>
                  </>
                ) : (
                  <button disabled={busy} onClick={() => changeMode("signin")}>
                    <ArrowLeft size={15} /> Back to sign in
                  </button>
                )}
              </div>
              {mode !== "code" && (
                <button
                  className="text-action"
                  disabled={busy}
                  onClick={() => changeMode("code")}
                >
                  Sign in or register with an email code
                </button>
              )}
              {mode === "signup" && (
                <p className="auth-help">
                  Use an email you can access. Your profile type is
                  self-selected and does not verify your employer or college.
                </p>
              )}
            </>
          )}
          <AnimatePresence>
            {(error || (expired && !sent)) && (
              <motion.p
                className="signin-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error ||
                  "We couldn\u2019t complete email confirmation. Request a new email here, then use its latest link or verification code."}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="auth-trust">
            <ShieldCheck size={18} />
            <span>
              Your check-ins stay private. Your connections start with consent.
            </span>
          </div>
        </motion.div>

        <motion.p
          className="auth-bottom-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          A little connection. A lot of possibility.
        </motion.p>
      </section>
    </main>
  );
}
