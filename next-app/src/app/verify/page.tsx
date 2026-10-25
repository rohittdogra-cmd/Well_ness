"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  BadgeCheck,
  IdCard,
  Linkedin,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useVerification } from "@/hooks/useVerification";
import { useQueryClient } from "@tanstack/react-query";
import { localAccess } from "@/lib/localAccess";
export default function VerificationPage() {
  const status = useVerification();
  const qc = useQueryClient();
  const [alternate, setAlternate] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [method, setMethod] = useState("linkedin");
  const [evidence, setEvidence] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const db = getSupabase();
      if (alternate) {
        const { error } = await db.rpc("submit_verification", {
          p_method: method,
          p_evidence: evidence,
        });
        if (error) throw error;
        setNotice(
          "Submitted for review. You can keep browsing while we check your details.",
        );
      } else {
        const domain = email.trim().toLowerCase().split("@")[1];
        if (
          !domain ||
          /^(gmail|googlemail|yahoo|outlook|hotmail|live|icloud|aol|proton|protonmail|mail|yandex)\./.test(
            domain,
          )
        )
          throw new Error(
            "Use your organisation’s email, or choose another verification method.",
          );
        if (localAccess) {
          const { error } = await db.rpc(
            sent ? "verify_work_email" : "send_work_email",
            { p_email: email.trim(), p_code: code },
          );
          if (error) throw error;
        } else if (!sent) {
          const { error } = await db.auth.updateUser({ email: email.trim() });
          if (error) throw error;
        } else {
          const { error } = await db.auth.verifyOtp({
            email: email.trim(),
            token: code,
            type: "email_change",
          });
          if (error) throw error;
        }
        if (!sent) {
          setSent(true);
          setNotice(
            localAccess
              ? "Local preview: enter 123456. No email is sent."
              : "Check your work inbox for the code. You may also need to approve the change in your current inbox. This updates your sign-in email.",
          );
        } else
          setNotice(
            "Email confirmed. Your verification status is shown above.",
          );
      }
      await qc.invalidateQueries({ queryKey: ["verification"] });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : (e as { message?: string }).message ||
              "Could not submit. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="verify-page">
      <Link href="/" className="text-action">
        <ArrowLeft size={16} /> Back to exploring
      </Link>
      <header className="verify-heading">
        <span className="verify-icon">
          <ShieldCheck size={32} />
        </span>
        <span className="eyebrow">REAL PEOPLE. BETTER CONNECTIONS.</span>
        <h1>
          A little trust.
          <br />
          <em>A lot more belonging.</em>
        </h1>
        <p>
          Help us keep this community full of real people. Verify once to unlock
          conversations, messages and bookings.
        </p>
      </header>
      {status.isPending ? (
        <p role="status">Checking verification…</p>
      ) : status.error ? (
        <p role="alert">
          {status.error.message}{" "}
          <button onClick={() => status.refetch()}>Try again</button>
        </p>
      ) : status.data?.verified ? (
        <section className="verify-card verified-success">
          <BadgeCheck size={48} />
          <h2>You’re verified. You’re all set.</h2>
          <p>
            Start a conversation, message your connections or book your next
            good thing.
          </p>
          <Link href="/people" className="wellness-button">
            Meet your people <ArrowRight size={18} />
          </Link>
        </section>
      ) : (
        <section className="verify-card">
          {status.data?.status === "pending" ? (
            <div className="verification-pending" role="status">
              <ShieldCheck />
              <h2>Your details are in review.</h2>
              <p>
                We’ll update this page when a moderator has reviewed your
                submission. Chat and bookings unlock after approval.
              </p>
              <Link href="/groups" className="wellness-button">
                Keep exploring
              </Link>
            </div>
          ) : (
            <>
              {status.data?.status === "rejected" && (
                <p role="alert">
                  Your previous submission wasn’t approved. {status.data.reason}{" "}
                  Please submit updated details.
                </p>
              )}
              <div className="verify-tabs">
                <button
                  onClick={() => {
                    setAlternate(false);
                    setError("");
                    setNotice("");
                  }}
                  aria-pressed={!alternate}
                >
                  <Mail size={18} /> Work email <small>Fastest</small>
                </button>
                <button
                  onClick={() => {
                    setAlternate(true);
                    setError("");
                    setNotice("");
                  }}
                  aria-pressed={alternate}
                >
                  <IdCard size={18} /> Other ways
                </button>
              </div>
              <form onSubmit={submit}>
                <h2>
                  {alternate
                    ? "No work email? You’re welcome here."
                    : "Your work email is your way in."}
                </h2>
                <p>
                  {alternate
                    ? "Students, educators, healthcare and government professionals — choose what works for you. A moderator will review your proof."
                    : "Confirm access to your organisation’s inbox. Your email stays off your public profile."}
                </p>
                {alternate ? (
                  <>
                    <label className="field-label">
                      Verification method
                      <select
                        value={method}
                        onChange={(e) => {
                          setMethod(e.target.value);
                          setEvidence("");
                        }}
                      >
                        <option value="linkedin">LinkedIn profile</option>
                        <option value="employee_id">
                          Employee / government ID
                        </option>
                        <option value="student_id">
                          Student / educator ID
                        </option>
                        <option value="professional_id">
                          Professional registration ID
                        </option>
                      </select>
                    </label>
                    {method === "linkedin" ? (
                      <label className="field-label">
                        LinkedIn profile URL
                        <input
                          type="url"
                          placeholder="https://www.linkedin.com/in/your-name"
                          value={evidence}
                          onChange={(e) => setEvidence(e.target.value)}
                          required
                          pattern="https://(www\.)?linkedin\.com/in/.+"
                        />
                      </label>
                    ) : (
                      <label className="field-label">
                        Upload a clear photo of your ID
                        <input
                          key={method}
                          type="file"
                          accept="image/jpeg,image/png"
                          required
                          onChange={async (e) => {
                            setError("");
                            setEvidence("");
                            const f = e.target.files?.[0];
                            if (!f) return;
                            if (
                              f.size > 2 * 1024 * 1024 ||
                              !["image/jpeg", "image/png"].includes(f.type)
                            ) {
                              setError("Choose a JPG or PNG under 2 MB.");
                              e.target.value = "";
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () =>
                              setEvidence(String(reader.result));
                            reader.readAsDataURL(f);
                          }}
                        />
                        <small>
                          JPG or PNG, up to 2 MB. Show your name and
                          organisation. Cover unrelated numbers and personal
                          details.
                        </small>
                      </label>
                    )}
                    <p className="verify-private">
                      Only authorised reviewers can access your submission.
                      Submitting proof does not automatically verify your
                      profile.
                    </p>
                  </>
                ) : (
                  <>
                    <label className="field-label">
                      Work email
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setSent(false);
                          setCode("");
                        }}
                        required
                        autoComplete="email"
                      />
                    </label>
                    {sent && (
                      <label className="field-label">
                        Email verification code
                        <input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                          pattern="[0-9]{6,8}"
                          placeholder="Enter your code"
                        />
                      </label>
                    )}
                    {!localAccess && (
                      <small>
                        Verifying this address updates the email you use to sign
                        in.
                      </small>
                    )}
                  </>
                )}
                {error && (
                  <p role="alert" className="verify-error">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="verify-notice">
                    {notice}
                  </p>
                )}
                <button
                  className="wellness-button verify-submit"
                  disabled={busy || (alternate && !evidence)}
                >
                  {busy
                    ? "Please wait…"
                    : alternate
                      ? "Submit for review"
                      : sent
                        ? "Confirm work email"
                        : "Send verification code"}
                  <ArrowRight size={18} />
                </button>
              </form>
              <div className="verify-benefits">
                <span>
                  <CheckCircle2 size={16} /> Chat with your community
                </span>
                <span>
                  <CheckCircle2 size={16} /> Message your connections
                </span>
                <span>
                  <CheckCircle2 size={16} /> Book experiences
                </span>
              </div>
            </>
          )}
        </section>
      )}
      <Link className="verify-later" href="/groups">
        I’ll verify later — keep browsing <ArrowRight size={16} />
      </Link>
      <div className="verify-audience">
        <span>
          <GraduationCap /> Students & educators
        </span>
        <span>
          <IdCard /> Working professionals
        </span>
        <span>
          <Linkedin /> Independent professionals
        </span>
      </div>
    </div>
  );
}
