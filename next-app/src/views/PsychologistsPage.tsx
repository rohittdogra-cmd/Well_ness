"use client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  ArrowUpRight,
  HeartHandshake,
  Clock3,
  CalendarDays,
  Check,
  X,
  Stethoscope,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
type Provider = { id: number; name: string; description: string };
export function PsychologistsPage() {
  const qc = useQueryClient();
  const { user, login, isInitializing } = useInternetIdentity();
  const profile = useLocalProfile();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["provider-directory"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("providers")
        .select("id,name,description")
        .eq("status", "approved")
        .eq("provider_type", "psychologist")
        .order("name");
      if (error) throw new Error(error.message);
      return data as Provider[];
    },
  });
  const providers =
    query.data?.filter((p) =>
      `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  function begin(id: number) {
    if (!user) {
      login();
      return;
    }
    setSelected(id);
    setError("");
    setRequested(null);
  }
  return (
    <div className="hub-page care-page">
      <header className="care-hero">
        <div>
          <span className="eyebrow">CARE THAT STARTS WITH YOU</span>
          <h1>
            A little support.
            <br />
            <em>A little more space.</em>
          </h1>
          <p>
            Find someone to talk to, at your pace. Explore our approved care
            professionals and request a time that works for you.
          </p>
          <a className="wellness-button" href="#care-directory">
            Find your support <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="care-hero-art">
          <HeartHandshake size={54} strokeWidth={1.2} />
          <span>A space to be heard.</span>
          <p>One conversation can be a good place to start.</p>
          <div>
            <ShieldCheck size={16} /> Your appointment details stay private
          </div>
        </div>
      </header>
      <div className="care-steps" aria-label="How care works">
        <span>
          <b>01</b> Explore professionals
        </span>
        <span>
          <b>02</b> Sign in & request a time
        </span>
        <span>
          <b>03</b> Get provider confirmation
        </span>
      </div>
      {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1") && (
        <p className="care-demo-note">
          Local preview · Sample professionals for reviewing the layout. These
          are not real bookable doctors.
        </p>
      )}
      <section id="care-directory" className="care-directory">
        <div className="care-directory-heading">
          <div>
            <span className="eyebrow">FIND YOUR SUPPORT</span>
            <h2>Someone in your corner.</h2>
            <p>
              Read their introduction and find a comfortable starting point.
            </p>
          </div>
          <div className="care-directory-links">
            {user && (
              <Link href="/profile?view=bookings">
                Your appointments <ArrowUpRight size={15} />
              </Link>
            )}
            <Link href="/apply-provider">
              Join as a professional <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <label className="search-field care-search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Search care professionals"
            placeholder="Search by name or introduction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {!user && (
          <div className="care-access-note">
            <ShieldCheck size={22} />
            <div>
              <strong>Explore freely. Sign in when you’re ready.</strong>
              <p>
                You don’t need corporate or student approval for care. Create an
                account, confirm your email, and share a name and preferred time
                to request an appointment.
              </p>
            </div>
          </div>
        )}
        {query.isPending ? (
          <p role="status">Loading care professionals…</p>
        ) : query.error ? (
          <div className="error-box" role="alert">
            <p>We couldn’t load the directory.</p>
            <button onClick={() => query.refetch()}>Try again</button>
          </div>
        ) : !providers.length ? (
          <div className="care-empty">
            <Stethoscope size={32} />
            <h3>
              {query.data?.length
                ? "No matches just yet."
                : "Our care community is growing."}
            </h3>
            <p>
              {query.data?.length
                ? "Try another name or clear your search."
                : "Professionals appear here after administrator approval. Check back soon, or apply to join our care network."}
            </p>
            {query.data?.length ? (
              <button className="text-action" onClick={() => setSearch("")}>
                Clear search
              </button>
            ) : (
              <Link className="wellness-button light" href="/apply-provider">
                Apply as a professional <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="care-provider-grid">
            {providers.map((p, i) => (
              <article className="care-provider-card" key={p.id}>
                <div className="care-card-top">
                  <div
                    className={`care-monogram tone-${i % 3}`}
                    aria-hidden="true"
                  >
                    {p.name
                      .replace(/^Dr\.?\s+/i, "")
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span>
                    <ShieldCheck size={14} />{" "}
                    {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1")
                      ? "Sample profile"
                      : "Approved provider"}
                  </span>
                </div>
                <span className="eyebrow">PSYCHOLOGIST</span>
                <h3>{p.name}</h3>
                <p className="care-introduction">{p.description}</p>
                <div className="care-card-meta">
                  <span>
                    <Clock3 size={15} /> One-hour appointment
                  </span>
                  <span>
                    <CalendarDays size={15} /> Request your preferred time
                  </span>
                </div>
                {requested === p.id ? (
                  <div className="care-success" role="status">
                    <Check size={20} />
                    <div>
                      <strong>Request sent.</strong>
                      <p>Awaiting provider confirmation.</p>
                      <Link href="/profile?view=bookings">
                        Track your appointment ↗
                      </Link>
                    </div>
                  </div>
                ) : selected === p.id && user ? (
                  <form
                    className="care-booking-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user) {
                        login();
                        return;
                      }
                      const form = new FormData(e.currentTarget);
                      setBusy(true);
                      setError("");
                      try {
                        await rpc("book_care", {
                          p_provider: p.id,
                          p_time: new Date(
                            String(form.get("date")),
                          ).toISOString(),
                          p_name: String(form.get("name")),
                        });
                        await qc.invalidateQueries({ queryKey: ["bookings"] });
                        setRequested(p.id);
                        setSelected(null);
                        toast.success(
                          "Appointment requested. Track confirmation in your calendar.",
                        );
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Could not request appointment",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <div className="care-form-heading">
                      <strong>Your appointment request</strong>
                      <button
                        type="button"
                        aria-label="Close booking form"
                        onClick={() => setSelected(null)}
                      >
                        <X size={17} />
                      </button>
                    </div>
                    <label className="field-label">
                      Your name
                      <input
                        name="name"
                        autoComplete="name"
                        defaultValue={profile?.name ?? ""}
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </label>
                    <label className="field-label">
                      Contact email
                      <input
                        type="email"
                        value={user.email ?? ""}
                        readOnly
                        autoComplete="email"
                      />
                    </label>
                    <label className="field-label">
                      Preferred date and time
                      <input
                        type="datetime-local"
                        name="date"
                        required
                        min={new Date(
                          Date.now() - new Date().getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16)}
                        max={new Date(
                          Date.now() +
                            180 * 86400000 -
                            new Date().getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16)}
                      />
                    </label>
                    <label className="guest-consent">
                      <input type="checkbox" required /> Share my name and
                      account email with this provider and authorised
                      administrators for this appointment.
                    </label>
                    {error && (
                      <p className="error-box" role="alert">
                        {error}
                      </p>
                    )}
                    <button className="wellness-button" disabled={busy}>
                      {busy ? "Requesting…" : "Request appointment"}
                    </button>
                    <small>
                      Times use your device’s timezone. Your appointment is
                      confirmed only when the provider accepts.
                    </small>
                  </form>
                ) : (
                  <button
                    className="wellness-button light care-book-button"
                    disabled={isInitializing}
                    onClick={() => begin(p.id)}
                  >
                    Request a time <ArrowUpRight size={17} />
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <aside className="care-footer-note">
        <HeartHandshake size={24} />
        <div>
          <strong>A thoughtful first step.</strong>
          <p>
            Requests depend on the professional’s availability. Follow your
            status in Your appointments; booking emails and video consultations
            are not available here.
          </p>
        </div>
      </aside>
    </div>
  );
}
