"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { useUpcomingSessions, ProgramType } from "@/hooks/useQueries";
import { CreateSessionModal } from "@/components/CreateSessionModal";
import { SessionCard } from "@/components/SessionCard";
import { PROGRAM_CONFIGS, PROGRAM_ORDER } from "@/lib/programConfig";
import { isFull } from "@/lib/session";
export function BookActivitiesPage() {
  // The date and program-type filters are applied by Postgres; only the
  // free-text and "has space" refinements happen here, on one bounded page.
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [available, setAvailable] = useState(false);
  const sessions = useUpcomingSessions({
    type: type === "all" ? null : (type as ProgramType),
  });
  const needle = search.trim().toLowerCase();
  const upcoming =
    sessions.data
      ?.filter(
        (s) =>
          (!available || !isFull(s)) &&
          (!needle ||
            `${s.title} ${s.description} ${s.location ?? ""}`
              .toLowerCase()
              .includes(needle)),
      ) ?? [];
  return (
    <div className="hub-page">
      <header className="activity-hero">
        <div>
          <span className="eyebrow">STEP OUT OF WORK MODE</span>
          <h1>
            Make time for
            <br />
            <em>something good.</em>
          </h1>
          <p>A walk, a game, a conversation. Find a little joy in your week.</p>
          <CreateSessionModal />
        </div>
        <img
          src="/images/walk-together.webp"
          width="700"
          height="440"
          alt="Friends walking along a sunny park path"
        />
      </header>
      <div className="group-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            aria-label="Search activities"
            placeholder="Search activities or locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="activity-filter"
          aria-label="Activity type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All activities</option>
          {PROGRAM_ORDER.map((t) => (
            <option key={t} value={t}>
              {PROGRAM_CONFIGS[t].label}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Spaces available
        </label>
      </div>
      {sessions.isPending ? (
        <div className="empty-state" role="status">
          Loading activities…
        </div>
      ) : sessions.error ? (
        <div className="error-box" role="alert">
          <p>{sessions.error.message}</p>
          <button onClick={() => sessions.refetch()}>Retry</button>
        </div>
      ) : !upcoming.length ? (
        <div className="empty-state">
          <h2>Make the first move.</h2>
          <p>
            No upcoming activities match yet. Start something you’d love to
            join.
          </p>
          <div className="mt-5">
            <CreateSessionModal defaultType={ProgramType.meetup} />
          </div>
        </div>
      ) : (
        <section aria-labelledby="upcoming-activities">
          {/* The list is a section under the page h1; without this the heading
              order jumps straight from h1 to each card's h3. */}
          <h2 id="upcoming-activities" className="sr-only">
            Upcoming activities
          </h2>
          <div className="live-groups-grid">
            {upcoming.map((s, i) => (
              <SessionCard key={s.id.toString()} session={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
