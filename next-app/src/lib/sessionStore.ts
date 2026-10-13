"use client";

import { type Session, ProgramType } from "@/backend.types";
import { accountId } from "@/hooks/useInternetIdentity";

export interface StoredSessionRecord {
  id: string;
  title: string;
  description: string;
  creator: string;
  participants: string[];
  participantCount: number;
  createdAt: string;
  dateTime: string;
  maxParticipants: number;
  programType: ProgramType;
  spaceName?: string;
  location?: string;
}

const STORAGE_KEY = "wellness_live_sessions_v4";

const INITIAL_RECORDS: StoredSessionRecord[] = [
  {
    id: "1",
    title: "Lunchtime Walk & Reset",
    description: "Take a step back from screens. Fresh air, casual walk, and reset.",
    creator: "creator-admin",
    participants: ["22222222-2222-4222-8222-222222222222"],
    participantCount: 2,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    maxParticipants: 8,
    programType: ProgramType.meetup,
    spaceName: "Garden Courtyard",
    location: "Courtyard Gate 2",
  },
  {
    id: "2",
    title: "Evening Badminton Friendly",
    description: "Rackets, shuttles, and quick 15-minute sets for all skill levels.",
    creator: "33333333-3333-4333-8333-333333333333",
    participants: ["33333333-3333-4333-8333-333333333333"],
    participantCount: 1,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Date.now() + 172800000).toISOString(),
    maxParticipants: 6,
    programType: ProgramType.badminton,
    spaceName: "Indoor Sports Court",
    location: "Level 1 Sports Hub",
  },
  {
    id: "3",
    title: "Morning Vinyasa Yoga",
    description: "Guided 30-minute stretch to start the day balanced and clear-headed.",
    creator: "44444444-4444-4444-8444-444444444444",
    participants: ["44444444-4444-4444-8444-444444444444"],
    participantCount: 1,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Date.now() + 259200000).toISOString(),
    maxParticipants: 12,
    programType: ProgramType.exercise,
    spaceName: "Wellness Studio",
    location: "Block B, Room 302",
  },
  {
    id: "4",
    title: "Corporate Box Cricket League",
    description: "Fast-paced, high energy 6-a-side box cricket match under turf lights.",
    creator: "55555555-5555-4555-8555-555555555555",
    participants: ["55555555-5555-4555-8555-555555555555"],
    participantCount: 6,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Date.now() + 345600000).toISOString(),
    maxParticipants: 12,
    programType: ProgramType.boxCricket,
    spaceName: "Rooftop Sports Arena",
    location: "Cyber City Turf Area",
  },
  {
    id: "5",
    title: "Weekend Pickleball Rally",
    description: "Casual games and rally practice for doubles pairs. Paddles provided.",
    creator: "66666666-6666-4666-8666-666666666666",
    participants: ["66666666-6666-4666-8666-666666666666"],
    participantCount: 4,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Date.now() + 432000000).toISOString(),
    maxParticipants: 8,
    programType: ProgramType.pickleball,
    spaceName: "Outdoor Court 1",
    location: "Central Campus Sports Club",
  },
];

let inMemoryRecords: StoredSessionRecord[] | null = null;

function notifySessionUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("wellness_sessions_updated"));
  }
}

export function loadStoredSessionRecords(): StoredSessionRecord[] {
  if (typeof window === "undefined") {
    return inMemoryRecords ?? INITIAL_RECORDS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      inMemoryRecords = [...INITIAL_RECORDS];
      return inMemoryRecords;
    }
    const parsed: StoredSessionRecord[] = JSON.parse(raw);
    inMemoryRecords = parsed;
    return parsed;
  } catch (e) {
    console.error("Failed to read stored sessions:", e);
    return inMemoryRecords ?? INITIAL_RECORDS;
  }
}

export function saveStoredSessionRecords(records: StoredSessionRecord[]): void {
  inMemoryRecords = records;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      notifySessionUpdate();
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  }
}

export function recordToSession(rec: StoredSessionRecord, currentUserId?: string): Session {
  const isEnrolled = currentUserId
    ? rec.participants.some(
        (p) => p.toLowerCase() === currentUserId.toLowerCase(),
      )
    : false;

  const count = Math.max(rec.participants.length, rec.participantCount || 0);

  return {
    id: BigInt(rec.id),
    title: rec.title,
    description: rec.description,
    creator: accountId(rec.creator),
    participants: rec.participants.map((p) => accountId(p)),
    participantCount: BigInt(count),
    joined: isEnrolled,
    createdAt: BigInt(new Date(rec.createdAt).getTime()) * 1_000_000n,
    dateTime: BigInt(new Date(rec.dateTime).getTime()) * 1_000_000n,
    maxParticipants: BigInt(rec.maxParticipants),
    programType: rec.programType,
    spaceName: rec.spaceName,
    location: rec.location,
  };
}

export function getStoredSessions(currentUserId?: string): Session[] {
  const records = loadStoredSessionRecords();
  return records.map((rec) => recordToSession(rec, currentUserId));
}

export function getStoredSession(id: bigint, currentUserId?: string): Session | undefined {
  const records = loadStoredSessionRecords();
  const idStr = id.toString();
  const found = records.find((r) => r.id === idStr);
  if (!found) return undefined;
  return recordToSession(found, currentUserId);
}

export function joinStoredSession(id: bigint, currentUserId: string): Session {
  const records = loadStoredSessionRecords();
  const idStr = id.toString();
  const index = records.findIndex((r) => r.id === idStr);

  if (index === -1) {
    throw new Error(`Session ${idStr} not found`);
  }

  const existing = records[index];
  const participants = [...existing.participants];
  if (!participants.some((p) => p.toLowerCase() === currentUserId.toLowerCase())) {
    participants.push(currentUserId);
  }

  const updatedRec: StoredSessionRecord = {
    ...existing,
    participants,
    participantCount: Math.max(participants.length, existing.participantCount + 1),
  };

  records[index] = updatedRec;
  saveStoredSessionRecords(records);

  try {
    const { addLiveNotification, getUserDisplayName } = require("./liveDataManager");
    const name = getUserDisplayName();
    addLiveNotification({
      message: `🏃 ${name} enrolled in ${updatedRec.title}! Check out who is attending.`,
      href: `/sessions/${updatedRec.id}`,
      type: "session_join",
    });
  } catch (e) {
    // ignore
  }

  return recordToSession(updatedRec, currentUserId);
}

export function leaveStoredSession(id: bigint, currentUserId: string): Session {
  const records = loadStoredSessionRecords();
  const idStr = id.toString();
  const index = records.findIndex((r) => r.id === idStr);

  if (index === -1) {
    throw new Error(`Session ${idStr} not found`);
  }

  const existing = records[index];
  const participants = existing.participants.filter(
    (p) => p.toLowerCase() !== currentUserId.toLowerCase(),
  );

  const updatedRec: StoredSessionRecord = {
    ...existing,
    participants,
    participantCount: Math.max(0, participants.length),
  };

  records[index] = updatedRec;
  saveStoredSessionRecords(records);
  return recordToSession(updatedRec, currentUserId);
}

export function createStoredSession(
  args: {
    title: string;
    description: string;
    programType: ProgramType;
    dateTime: bigint;
    maxParticipants: bigint;
    spaceName?: string;
    location?: string;
  },
  currentUserId: string,
): bigint {
  const records = loadStoredSessionRecords();
  const newId = (records.length ? Math.max(...records.map((r) => Number(r.id))) + 1 : 1).toString();

  const newRec: StoredSessionRecord = {
    id: newId,
    title: args.title,
    description: args.description,
    creator: currentUserId,
    participants: [currentUserId],
    participantCount: 1,
    createdAt: new Date().toISOString(),
    dateTime: new Date(Number(args.dateTime / 1_000_000n)).toISOString(),
    maxParticipants: Number(args.maxParticipants),
    programType: args.programType,
    spaceName: args.spaceName,
    location: args.location,
  };

  records.unshift(newRec);
  saveStoredSessionRecords(records);
  return BigInt(newId);
}

export function updateStoredSession(
  id: bigint,
  updates: Partial<StoredSessionRecord>,
): void {
  const records = loadStoredSessionRecords();
  const idStr = id.toString();
  const index = records.findIndex((r) => r.id === idStr);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveStoredSessionRecords(records);
  }
}

export function deleteStoredSession(id: bigint): void {
  const records = loadStoredSessionRecords();
  const idStr = id.toString();
  const filtered = records.filter((r) => r.id !== idStr);
  saveStoredSessionRecords(filtered);
}

export function getMyStoredSessions(currentUserId: string): [Session[], Session[]] {
  const all = getStoredSessions(currentUserId);
  const created = all.filter(
    (s) => s.creator.toString().toLowerCase() === currentUserId.toLowerCase(),
  );
  const joined = all.filter((s) => s.joined === true);
  return [created, joined];
}
