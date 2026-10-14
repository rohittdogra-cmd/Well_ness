"use client";

import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMyConnections, type Connection } from "@/hooks/useConnections";
import { Mascot } from "@/components/Mascot";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { BadmintonTurfBookingModal } from "@/components/BadmintonTurfBookingModal";
import { calculateProximity } from "@/lib/turfVenues";
import { MapPin } from "lucide-react";
import { useCrisisDetection, CrisisOverlay } from "@/components/CrisisOverlay";
import { generateCuteName } from "@/lib/anonymousNameGenerator";

type Member = {
  id: string;
  name: string;
  assignedCuteName?: string;
  avatar: number;
  bio: string;
  interests: string[];
  location?: string;
};
type Message = { id: number; sender: string; body: string; created_at: string };

function getMemberDisplayName(m: Member): string {
  if (m.assignedCuteName && m.assignedCuteName.trim()) {
    return m.assignedCuteName;
  }
  if (m.name && !m.name.includes("@") && !m.name.includes(".")) {
    return m.name;
  }
  return generateCuteName({ seed: m.id, interests: m.interests });
}

function getConnectionDisplayName(c: Connection): string {
  if (c.name && !c.name.includes("@") && !c.name.includes(".")) {
    return c.name;
  }
  return generateCuteName({ seed: c.member_id });
}

export function PeoplePage() {
  const { user } = useInternetIdentity();
  const localProfile = useLocalProfile();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [turfModalOpen, setTurfModalOpen] = useState(false);
  const [turfPartner, setTurfPartner] = useState<{ name: string; location: string }>({
    name: "Shuttle Queen",
    location: "Janakpuri, Delhi",
  });
  const qc = useQueryClient();
  const members = useInfiniteQuery({
    queryKey: ["members", user?.id, filter],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      (await rpc("find_members", {
        p_search: filter,
        p_offset: pageParam,
      })) as Member[],
    getNextPageParam: (last, pages) =>
      last.length === 30 ? pages.length * 30 : undefined,
  });
  // Same query key as `useMyConnections`, so this shares one cache entry
  // instead of running a second poll of the same RPC on a second timer.
  const connections = useMyConnections();
  const action = useMutation({
    mutationFn: ({
      name,
      args,
    }: {
      name: string;
      args: Record<string, unknown>;
    }) => rpc(name, args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
  const current = connections.data?.find(
    (c) => c.id === selected && c.status === "accepted",
  );
  return (
    <div className="people-page">
      <span className="eyebrow">YOUR COMMUNITY</span>
      <h1>Find your people.</h1>
      <p>
        Meet peers with auto-assigned cute handles, check distance proximity, and coordinate badminton turf matches.
      </p>
      {action.error && (
        <p role="alert" className="signin-error">
          {action.error.message}
        </p>
      )}
      <div className="people-grid">
        <section aria-label="Member directory" className="people-panel">
          <h2>Meet the community</h2>
          <form
            className="people-search"
            onSubmit={(e) => {
              e.preventDefault();
              setFilter(search.trim());
            }}
          >
            <label htmlFor="member-search" className="sr-only">
              Search members by name
            </label>
            <input
              id="member-search"
              type="search"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
            />
            <button className="wellness-button">Search</button>
          </form>
          {members.isPending && <p role="status">Loading members…</p>}
          {members.error && (
            <p role="alert">
              Couldn’t load members.{" "}
              <button onClick={() => members.refetch()}>Try again</button>
            </p>
          )}
          {members.data?.pages.flat().length === 0 && (
            <p>
              No members found. Invite a colleague to create a profile, or try
              another name.
            </p>
          )}
          {members.data?.pages.flat().map((m) => {
            const displayName = getMemberDisplayName(m);
            const c = connections.data?.find((c) => c.member_id === m.id);
            const mLoc = m.location || "Janakpuri, Delhi";
            const myLoc = localProfile?.location || "Janakpuri, Delhi";
            const prox = calculateProximity(myLoc, mLoc);
            return (
              <article className="member-card" key={m.id} style={{ alignItems: "flex-start", gap: "12px" }}>
                <Mascot variant={m.avatar} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0 }}>{displayName}</h3>
                    <span
                      style={{
                        fontSize: "11px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        color: "#0f766e",
                        background: "rgba(15, 118, 110, 0.08)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 650,
                      }}
                    >
                      <MapPin size={11} /> {mLoc}
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "9999px",
                        background: prox.isViableForMeetup ? "#dcfce7" : "#fce7f3",
                        color: prox.isViableForMeetup ? "#15803d" : "#be185d",
                      }}
                    >
                      {prox.label}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0" }}>{m.bio}</p>
                  <small>{m.interests.join(" · ")}</small>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  {c?.status === "accepted" ? (
                    <button
                      className="text-action"
                      onClick={() => setSelected(c.id)}
                    >
                      Chat
                    </button>
                  ) : c ? (
                    <span style={{ fontSize: "11.5px" }}>
                      {c.status === "declined"
                        ? "Not connected"
                        : c.recipient === user?.id
                          ? "Request received"
                          : "Request sent"}
                    </span>
                  ) : (
                    <button
                      className="text-action"
                      disabled={action.isPending || !connections.isSuccess}
                      onClick={() =>
                        action.mutate({
                          name: "request_connection",
                          args: { p_member: m.id },
                        })
                      }
                    >
                      Connect
                    </button>
                  )}

                  {/* Badminton Turf Booking CTA */}
                  <button
                    type="button"
                    className="text-action"
                    style={{
                      color: "#087f79",
                      fontWeight: 700,
                      fontSize: "11.5px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                    onClick={() => {
                      setTurfPartner({
                        name: displayName,
                        location: mLoc,
                      });
                      setTurfModalOpen(true);
                    }}
                  >
                    🏸 Book Turf
                  </button>
                </div>
              </article>
            );
          })}
          {members.hasNextPage && (
            <button
              className="text-action"
              disabled={members.isFetchingNextPage}
              onClick={() => members.fetchNextPage()}
            >
              Load more members
            </button>
          )}
        </section>
        <section className="people-panel" aria-label="Connections and messages">
          <h2>Your connections</h2>
          {connections.isPending && <p role="status">Loading connections…</p>}
          {connections.error && (
            <p role="alert">
              Couldn’t load connections.{" "}
              <button onClick={() => connections.refetch()}>Try again</button>
            </p>
          )}
          {connections.data?.length === 0 && (
            <p>
              Send a connection request to someone you’d like to meet. Chat
              opens once they accept.
            </p>
          )}
          {connections.data
            ?.filter((c) => c.status !== "declined")
            .map((c) => {
              const cName = getConnectionDisplayName(c);
              return (
                <article key={c.id} className="connection-card">
                  <strong>{cName}</strong>
                  {c.status === "accepted" ? (
                    <button
                      className="text-action"
                      aria-pressed={selected === c.id}
                      onClick={() => setSelected(c.id)}
                    >
                      Chat with {cName}
                    </button>
                  ) : c.recipient === user?.id ? (
                  <div>
                    <button
                      className="text-action"
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          name: "respond_connection",
                          args: { p_connection: c.id, p_accept: true },
                        })
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="text-action"
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          name: "respond_connection",
                          args: { p_connection: c.id, p_accept: false },
                        })
                      }
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span>Waiting for acceptance</span>
                )}
              </article>
            );
          })}
          {current && (
            <Chat key={current.id} connection={current} userId={user!.id} />
          )}
        </section>
      </div>

      <BadmintonTurfBookingModal
        isOpen={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        partnerCuteName={turfPartner.name}
        partnerLocation={turfPartner.location}
        userCuteName={localProfile?.name || "Smash Sensation"}
        userLocation={localProfile?.location || "Janakpuri, Delhi"}
      />
    </div>
  );
}

function Chat({
  connection,
  userId,
}: {
  connection: Connection;
  userId: string;
}) {
  const [body, setBody] = useState("");
  const qc = useQueryClient();
  const { showOverlay, checkText, dismissOverlay } = useCrisisDetection();
  const key = ["direct-messages", userId, connection.id];
  const messages = useInfiniteQuery({
    queryKey: key,
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }) => {
      let query = getSupabase()
        .from("direct_messages")
        .select("id,sender,body,created_at")
        .eq("connection_id", connection.id)
        .order("id", { ascending: false })
        .limit(50);
      if (pageParam !== null) query = query.lt("id", pageParam);
      const { data, error } = await query;
      if (error) throw error;
      return data as Message[];
    },
    getNextPageParam: (last) =>
      last.length === 50 ? last[last.length - 1].id : undefined,
    // 30s: reduce polling load. This refetches every loaded page of the thread
    // on each tick, so the cost grows with how far back the conversation has
    // been read. It still only runs while the tab is focused.
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
  const send = useMutation({
    mutationFn: (text: string) =>
      rpc("send_direct_message", { p_connection: connection.id, p_body: text }),
    onSuccess: async () => {
      setBody("");
      await qc.invalidateQueries({ queryKey: key });
    },
  });
  const rows = [...(messages.data?.pages.flat() || [])].reverse();
  const partnerName = getConnectionDisplayName(connection);
  return (
    <section
      className="private-chat"
      aria-label={`Conversation with ${partnerName}`}
    >
      <CrisisOverlay show={showOverlay} onDismiss={dismissOverlay} />
      <h3>Chat with {partnerName}</h3>
      <small>
        Private to the two of you. Updates every 30 seconds while this page is
        active.
      </small>
      {messages.error && (
        <p role="alert">
          Messages could not load.{" "}
          <button onClick={() => messages.refetch()}>Try again</button>
        </p>
      )}
      {messages.isPending && <p role="status">Loading messages…</p>}
      {messages.hasNextPage && (
        <button
          disabled={messages.isFetchingNextPage}
          onClick={() => messages.fetchNextPage()}
          className="text-action"
        >
          Load older messages
        </button>
      )}
      <div
        className="chat-messages"
        role="log"
        aria-label="Messages"
        aria-live="polite"
      >
        {!messages.isPending && !messages.error && !rows.length && (
          <p>Say hello to {connection.name}.</p>
        )}
        {rows.map((m) => (
          <article
            key={m.id}
            className={m.sender === userId ? "chat-bubble mine" : "chat-bubble"}
          >
            <strong>{m.sender === userId ? "You" : connection.name}</strong>
            <p>{m.body}</p>
            <time dateTime={m.created_at}>
              {new Date(m.created_at).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim() && !send.isPending) send.mutate(body.trim());
        }}
      >
        <label className="field-label" htmlFor="direct-message">
          Message
        </label>
        <textarea
          id="direct-message"
          maxLength={3000}
          rows={3}
          required
          value={body}
          disabled={send.isPending}
          onChange={(e) => { setBody(e.target.value); checkText(e.target.value); }}
        />
        <button
          className="wellness-button"
          disabled={!body.trim() || send.isPending}
        >
          {send.isPending ? "Sending…" : "Send message"}
        </button>
        {send.error && (
          <p role="alert" className="signin-error">
            Your message wasn’t sent. {send.error.message}
          </p>
        )}
      </form>
    </section>
  );
}
