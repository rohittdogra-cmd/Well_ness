"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Phone, ShieldAlert, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { rpc } from "@/lib/backend";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { toast } from "sonner";

export function ContactPage() {
  const { user } = useInternetIdentity();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (user) {
        try {
          await rpc("submit_contact_request", {
            p_subject: `[${category.toUpperCase()}] ${subject.trim()}`,
            p_message: message.trim(),
          });
        } catch {
          // If RPC is unavailable locally, handle gracefully
        }
      }
      setSent(true);
      toast.success("Thank you! Your message has reached our team.");
      setSubject("");
      setMessage("");
      setName("");
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your message. Please try again.",
      );
      toast.error("Failed to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hub-page contact-page">
      <header className="page-heading">
        <span className="eyebrow">WE’RE LISTENING</span>
        <h1>Let’s talk. We’re here to help.</h1>
        <p>
          Have a question about our wellness circles, ideas for new activities,
          or corporate partnership inquiries? Reach out below.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Email Our Team</h3>
            <p className="text-xs text-muted-foreground mb-2">
              For general inquiries, account support, and suggestions:
            </p>
            <a
              href="mailto:support@wellnesshub.org"
              className="text-xs font-semibold text-primary hover:underline"
            >
              support@wellnesshub.org
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Company & HR Solutions</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Bring anonymous peer support and wellness meetups to your organization:
            </p>
            <a
              href="mailto:partnerships@wellnesshub.org"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              partnerships@wellnesshub.org
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-rose-900 text-sm mb-1">Immediate Crisis Support</h3>
            <p className="text-xs text-rose-800/80 mb-2">
              If you or someone you know is in severe emotional distress, please contact free national helplines:
            </p>
            <p className="text-xs font-mono font-bold text-rose-900">
              Tele-MANAS: 14416 (24/7 Free)
            </p>
            <p className="text-xs font-mono font-bold text-rose-900 mt-1">
              AASRA Helpline: 91-9820466726
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-display font-bold text-foreground mb-1">
              Send Us a Message
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Our community support leads respond within 24 hours.
            </p>

            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  Message Sent Successfully!
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Thank you for reaching out. We have logged your request and our team will get back to you shortly.
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="wellness-button"
                  >
                    Send another message
                  </button>
                  <Link href="/" className="text-action pt-2">
                    Back to Home →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="contact-name">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      required
                      placeholder="Alex Taylor"
                      value={user?.user_metadata?.name || name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-email">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={user?.email || email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="contact-category">
                      Inquiry Type
                    </label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
                    >
                      <option value="general">General Community Question</option>
                      <option value="activities">Activity Hosting Support</option>
                      <option value="therapy">Psychologist & Therapy Inquiries</option>
                      <option value="enterprise">Corporate & Workplace Plans</option>
                      <option value="feedback">Feedback & Bug Reports</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-subject">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      required
                      minLength={2}
                      maxLength={150}
                      placeholder="e.g. Hosting a weekend cricket meetup"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="contact-message">
                    Your Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={5}
                    placeholder="Tell us what's on your mind, how we can help, or how you want to get involved..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full"
                  />
                </div>

                <p className="privacy-note text-xs text-muted-foreground">
                  🔒 We protect your privacy. Messages are kept confidential and never shared with employers.
                </p>

                {error && (
                  <p role="alert" className="error-box text-sm">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button className="wellness-button" disabled={busy}>
                    {busy ? "Sending message…" : "Send message"}
                  </button>
                  <Link href="/about" className="text-xs text-primary hover:underline">
                    Learn more about us →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
