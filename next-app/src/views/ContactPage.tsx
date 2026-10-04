"use client";
import { useState } from "react";
import Link from "next/link";
import { rpc } from "@/lib/backend";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
export function ContactPage() {
  const { user } = useInternetIdentity();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="hub-page">
      <header className="page-heading">
        <span className="eyebrow">WE’RE LISTENING</span>
        <h1>Let’s make this better.</h1>
        <p>
          Have a question, an idea, or something that needs fixing? Leave a
          message for the hub team.
        </p>
      </header>
      {!user ? (
        <div className="empty-state">
          <h2>Sign in to send us a message.</h2>
          <p>
            Messages are tied to your account so the team can follow up. Reading
            this page does not need an account.
          </p>
          <Link className="wellness-button" href="/signin">
            Sign in
          </Link>
        </div>
      ) : (
      <form
        className="composer"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            // The insert privilege was revoked in the database; this function
            // validates the input and enforces a per-day send limit.
            await rpc("submit_contact_request", {
              p_subject: subject.trim(),
              p_message: message.trim(),
            });
            setSent(true);
            setSubject("");
            setMessage("");
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Could not save your message. Try again.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {sent && (
          <p role="status">
            Your message is saved in the team’s inbox. Thank you.
          </p>
        )}
        <label className="field-label" htmlFor="contact-subject">
          Subject
        </label>
        <input
          id="contact-subject"
          required
          minLength={2}
          maxLength={150}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <label className="field-label" htmlFor="contact-message">
          Your message
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="privacy-note">
          Sent from {user?.email}. Please avoid including sensitive health
          information.
        </p>
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        <div className="composer-actions">
          <button className="wellness-button" disabled={busy}>
            {busy ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
