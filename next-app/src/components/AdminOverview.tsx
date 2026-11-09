"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  UserPlus,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { loadAdminMembers, loadAdminMetrics } from "@/lib/adminMetrics";

export function AdminOverview({
  onTab,
  onMember,
}: {
  onTab: (tab: string) => void;
  onMember: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const metrics = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => loadAdminMetrics(getSupabase()),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
  const members = useQuery({
    queryKey: ["admin-members", page, search],
    queryFn: () => loadAdminMembers(getSupabase(), page, search),
  });
  const data = metrics.data;
  const refresh = () => {
    void metrics.refetch();
    void members.refetch();
  };
  return (
    <section className="admin-overview" aria-label="Platform overview">
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">YOUR COMMUNITY, AT A GLANCE</p>
          <h2>Platform overview</h2>
          <p>
            Registration, participation and the things that need your attention.
          </p>
        </div>
        <button
          className="admin-refresh"
          onClick={refresh}
          disabled={metrics.isFetching || members.isFetching}
        >
          <RefreshCw
            size={16}
            className={metrics.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>
      <p className="admin-updated" role="status">
        {metrics.isPending
          ? "Loading platform counts…"
          : data
            ? `Updated ${new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Refreshes every minute`
            : "Counts unavailable"}
      </p>
      {metrics.error ? (
        <div className="admin-error" role="alert">
          <strong>Couldn’t refresh platform counts.</strong>
          <p>{metrics.error.message}</p>
          {data && <p>The previous counts below may be out of date.</p>}
          <button onClick={refresh}>Try again</button>
        </div>
      ) : null}
      <div className="admin-metric-grid">
        {[
          {
            label: "Registered accounts",
            value: data?.registered,
            detail:
              "All accounts created, including those awaiting email confirmation",
            icon: Users,
            tone: "sage",
          },
          {
            label: "New registrations · 7 days",
            value: data?.recent,
            detail: "Accounts created in the last seven days",
            icon: UserPlus,
            tone: "peach",
          },
          {
            label: "Active participants · 7 days",
            value: data?.active,
            detail:
              "Unique members with a recorded activity, task or care-booking action",
            icon: Activity,
            tone: "lavender",
          },
          {
            label: "Scheduled activities",
            value: data?.activities,
            detail: "Activities with a start time now or in the future",
            icon: CalendarDays,
            tone: "blue",
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className={`admin-metric admin-metric-${metric.tone}`}
          >
            <div>
              <span>{metric.label}</span>
              <metric.icon size={22} />
            </div>
            <strong>
              {metric.value === undefined ? "—" : metric.value.toLocaleString()}
            </strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>
      <p className="admin-definition">
        Active participants measures recorded participation, not people online.
        Chat, group browsing and sign-ins are not included. Activity end times
        are not recorded, so currently running activities cannot be counted
        reliably.
      </p>
      <div className="admin-summary-grid">
        <article className="admin-summary-card">
          <p className="admin-eyebrow">COMMUNITY</p>
          <h3>Room to connect</h3>
          <dl>
            <div>
              <dt>Groups available</dt>
              <dd>{data?.groups ?? "—"}</dd>
            </div>
            <div>
              <dt>Activities created · all time</dt>
              <dd>{data?.allActivities ?? "—"}</dd>
            </div>
            <div>
              <dt>Approved care & sports providers</dt>
              <dd>{data?.approvedProviders ?? "—"}</dd>
            </div>
          </dl>
          <Link href="/book-activities">
            Browse activities <ArrowUpRight size={16} />
          </Link>
        </article>
        <article className="admin-summary-card">
          <p className="admin-eyebrow">NEEDS YOUR ATTENTION</p>
          <h3>Review queue</h3>
          <div className="admin-queue">
            <button onClick={() => onTab("operations")}>
              Member verification <strong>{data?.pendingMembers ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </button>
            <button onClick={() => onTab("providers")}>
              Provider applications{" "}
              <strong>{data?.pendingProviders ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </button>
            <Link href="/provider">
              Future member care requests · pending{" "}
              <strong>{data?.pendingBookings ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </Link>
            <button onClick={() => onTab("operations")}>
              Unresolved reports <strong>{data?.reports ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </button>
            <button onClick={() => onTab("operations")}>
              Contact inbox · all messages{" "}
              <strong>{data?.contacts ?? "—"}</strong>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </article>
      </div>
      <article className="admin-members-card">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">THE PEOPLE BEHIND THE NUMBERS</p>
            <h3>Registered members</h3>
            <p>
              Newest accounts first. An account can exist before its profile is
              completed.
            </p>
          </div>
          <ShieldCheck size={22} aria-label="Administrator only" />
        </div>
        <form
          className="admin-member-search"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(0);
            setSearch(searchInput);
          }}
        >
          <label htmlFor="admin-member-search">
            <Search size={17} />
            <span className="sr-only">Search members by display name</span>
          </label>
          <input
            id="admin-member-search"
            placeholder="Search by display name"
            value={searchInput}
            maxLength={50}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit">Search</button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(0);
              }}
            >
              Clear
            </button>
          )}
        </form>
        {members.error ? (
          <p role="alert">Couldn’t load members: {members.error.message}</p>
        ) : members.isPending ? (
          <p role="status">Loading members…</p>
        ) : (
          <>
            <p className="admin-member-total">
              {members.data.total.toLocaleString()}{" "}
              {search ? "matching accounts" : "registered accounts"}
            </p>
            <div className="admin-member-table-wrap">
              <table className="admin-member-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Account reference</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {members.data.rows.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <button
                          className="admin-member-link"
                          onClick={() => onMember(member.id)}
                        >
                          {member.name || "Profile not completed"}
                        </button>
                      </td>
                      <td>
                        <code title={member.id}>{member.id.slice(0, 8)}…</code>
                      </td>
                      <td>
                        {new Date(member.created_at).toLocaleDateString([], {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!members.data.rows.length && (
              <p className="admin-empty">
                {search
                  ? "No members match this name."
                  : "No registered accounts yet."}
              </p>
            )}
            <div className="admin-pagination">
              <span>
                Page {page + 1} of{" "}
                {Math.max(1, Math.ceil(members.data.total / 20))}
              </span>
              <div>
                <button
                  disabled={page === 0 || members.isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  disabled={
                    (page + 1) * 20 >= members.data.total || members.isFetching
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
