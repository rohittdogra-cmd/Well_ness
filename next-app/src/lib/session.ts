import type { Session } from "@/backend.types";

/**
 * List reads receive participant totals from the `session_summaries` view
 * rather than the full roster, so member ids stay on the server. These helpers
 * keep every view reading the same source regardless of which shape it has.
 */
export function participantCount(session: Session): number {
  if (session.participantCount !== undefined)
    return Number(session.participantCount);
  return session.participants.length;
}

export function isJoined(session: Session, principal: string | undefined) {
  if (!principal) return false;
  if (session.joined !== undefined) return session.joined;
  return session.participants.some((p) => p.toString() === principal);
}

export function isFull(session: Session) {
  return participantCount(session) >= Number(session.maxParticipants);
}