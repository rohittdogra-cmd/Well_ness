"use client";

import { useEffect, useState } from "react";
import { MOCK_GROUPS } from "./mockGroups";
import type { Group } from "@/hooks/useCommunity";

// ─── TYPES ────────────────────────────────────────────────────────

export interface LiveOffer {
  id: string;
  title: string;
  code: string;
  discount: string;
  description: string;
  category: "Therapy" | "Corporate" | "Activities" | "Student" | "All";
  badge: string;
  expiry: string;
  active: boolean;
  createdAt: string;
}

export interface LiveDoctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  fee: string;
  image: string;
  availability: "Available Now" | "Next slot 5:00 PM" | "Available Tomorrow" | "Off Duty";
  rating: string;
  active: boolean;
  bio: string;
  languages?: string;
  createdAt: string;
}

// ─── INITIAL SEEDED DATA ───────────────────────────────────────────

export const INITIAL_OFFERS: LiveOffer[] = [
  {
    id: "offer-1",
    title: "First Anonymous Therapy Session",
    code: "STRESSFREE50",
    discount: "50% OFF",
    description: "Get 50% discount on your first certified 1-on-1 counseling or therapy session.",
    category: "Therapy",
    badge: "MOST POPULAR",
    expiry: "Valid till Dec 31, 2026",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-2",
    title: "Corporate Wellbeing Allowance",
    code: "CORPWELLNESS",
    discount: "100% COVERED",
    description: "Employees with registered corporate email get zero co-pay mental health support.",
    category: "Corporate",
    badge: "CORPORATE EXCLUSIVE",
    expiry: "Annual Corporate Pass",
    active: true,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "offer-3",
    title: "Weekend Sports & Box Cricket Pass",
    code: "FITMIND20",
    discount: "₹500 OFF",
    description: "Group turf and badminton weekend activity booking discount for corporate teams.",
    category: "Activities",
    badge: "WEEKEND PERK",
    expiry: "Valid Saturdays & Sundays",
    active: true,
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "offer-4",
    title: "Student Exam Calm & Mindful Check-in",
    code: "STUDYCALM",
    discount: "FREE PASS",
    description: "Free 15-minute quick confidential de-stress consultation with campus ID.",
    category: "Student",
    badge: "STUDENT SPECIAL",
    expiry: "Valid during semester exams",
    active: true,
    createdAt: "2026-01-04T00:00:00.000Z",
  },
];

export const INITIAL_DOCTORS: LiveDoctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins, Ph.D.",
    title: "Senior Clinical Psychologist",
    specialty: "Anxiety & Stress Management",
    experience: "10+ years experience",
    fee: "₹1,200 / session",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    availability: "Available Now",
    rating: "4.9 ★ (180+ sessions)",
    active: true,
    bio: "Specializing in cognitive behavioral therapy, burnout alleviation, and confidential adult counseling.",
    languages: "English, Hindi",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "doc-2",
    name: "Dr. Amit Sharma, MD",
    title: "Consultant Psychiatrist & Behavioral Lead",
    specialty: "Workplace Burnout & Sleep Health",
    experience: "12+ years experience",
    fee: "₹1,500 / session",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    availability: "Next slot 5:00 PM",
    rating: "4.9 ★ (240+ sessions)",
    active: true,
    bio: "Helping corporate professionals manage high-stress deadlines, work-life balance, and chronic fatigue.",
    languages: "English, Hindi, Punjabi",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "doc-3",
    name: "Dr. Emily Chen, M.S.",
    title: "Licensed Relationship & Family Counselor",
    specialty: "Relationship Counseling & Boundaries",
    experience: "7+ years experience",
    fee: "₹1,100 / session",
    image: "https://images.unsplash.com/photo-1594824436951-7f12bc50616b?w=400&q=80",
    availability: "Available Now",
    rating: "4.8 ★ (140+ sessions)",
    active: true,
    bio: "Empathetic guidance for interpersonal conflict, emotional boundaries, and healthy communication.",
    languages: "English, Mandarin",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "doc-4",
    name: "Dr. Michael Ross, Psy.D.",
    title: "Neuropsychologist & Mindfulness Coach",
    specialty: "Depression, Grief & Trauma",
    experience: "14+ years experience",
    fee: "₹1,400 / session",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80",
    availability: "Available Tomorrow",
    rating: "5.0 ★ (95+ sessions)",
    active: true,
    bio: "Evidence-backed modalities for trauma processing, life transitions, and self-compassion.",
    languages: "English",
    createdAt: "2026-01-04T00:00:00.000Z",
  },
  {
    id: "doc-5",
    name: "Dr. Priya Desai, M.Phil.",
    title: "Corporate Wellness Psychologist",
    specialty: "Career Anxiety & Imposter Syndrome",
    experience: "6+ years experience",
    fee: "₹1,000 / session",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    availability: "Available Now",
    rating: "4.9 ★ (210+ sessions)",
    active: true,
    bio: "Dedicated to helping early and mid-career professionals overcome imposter syndrome and interview dread.",
    languages: "English, Hindi, Gujarati",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
];

// ─── STORAGE KEYS & DISPATCH ───────────────────────────────────────

const OFFERS_KEY = "wellness_live_offers";
const DOCTORS_KEY = "wellness_live_doctors";
const GROUPS_KEY = "wellness_live_groups";
const SYNC_EVENT = "wellness_live_data_sync";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

// ─── OFFERS FUNCTIONS ─────────────────────────────────────────────

export function getStoredOffers(): LiveOffer[] {
  if (typeof window === "undefined") return INITIAL_OFFERS;
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (!raw) {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(INITIAL_OFFERS));
      return INITIAL_OFFERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading offers", e);
    return INITIAL_OFFERS;
  }
}

export function saveOffers(offers: LiveOffer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    notifyChange();
  } catch (e) {
    console.error("Error saving offers", e);
  }
}

export function addLiveOffer(offer: Omit<LiveOffer, "id" | "createdAt">): LiveOffer {
  const all = getStoredOffers();
  const newOffer: LiveOffer = {
    ...offer,
    id: `offer-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveOffers([newOffer, ...all]);
  return newOffer;
}

export function updateLiveOffer(id: string, updates: Partial<LiveOffer>): void {
  const all = getStoredOffers();
  const next = all.map((o) => (o.id === id ? { ...o, ...updates } : o));
  saveOffers(next);
}

export function toggleOfferStatus(id: string): void {
  const all = getStoredOffers();
  const next = all.map((o) => (o.id === id ? { ...o, active: !o.active } : o));
  saveOffers(next);
}

export function deleteLiveOffer(id: string): void {
  const all = getStoredOffers();
  saveOffers(all.filter((o) => o.id !== id));
}

// ─── DOCTORS FUNCTIONS ────────────────────────────────────────────

export function getStoredDoctors(): LiveDoctor[] {
  if (typeof window === "undefined") return INITIAL_DOCTORS;
  try {
    const raw = localStorage.getItem(DOCTORS_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(INITIAL_DOCTORS));
      return INITIAL_DOCTORS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading doctors", e);
    return INITIAL_DOCTORS;
  }
}

export function saveDoctors(doctors: LiveDoctor[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    notifyChange();
  } catch (e) {
    console.error("Error saving doctors", e);
  }
}

export function addLiveDoctor(doctor: Omit<LiveDoctor, "id" | "createdAt">): LiveDoctor {
  const all = getStoredDoctors();
  const newDoc: LiveDoctor = {
    ...doctor,
    id: `doc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveDoctors([newDoc, ...all]);
  return newDoc;
}

export function updateLiveDoctor(id: string, updates: Partial<LiveDoctor>): void {
  const all = getStoredDoctors();
  const next = all.map((d) => (d.id === id ? { ...d, ...updates } : d));
  saveDoctors(next);
}

export function toggleDoctorStatus(id: string): void {
  const all = getStoredDoctors();
  const next = all.map((d) => (d.id === id ? { ...d, active: !d.active } : d));
  saveDoctors(next);
}

export function deleteLiveDoctor(id: string): void {
  const all = getStoredDoctors();
  saveDoctors(all.filter((d) => d.id !== id));
}

// ─── GROUPS FUNCTIONS ─────────────────────────────────────────────

export function getStoredGroups(): Group[] {
  if (typeof window === "undefined") return MOCK_GROUPS;
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(MOCK_GROUPS));
      return MOCK_GROUPS;
    }
    const parsed: Group[] = JSON.parse(raw);
    // Ensure all mock groups exist if the list is smaller
    if (parsed.length < MOCK_GROUPS.length) {
      const existingIds = new Set(parsed.map((g) => g.id));
      const missing = MOCK_GROUPS.filter((g) => !existingIds.has(g.id));
      const merged = [...parsed, ...missing];
      localStorage.setItem(GROUPS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error("Error loading groups", e);
    return MOCK_GROUPS;
  }
}

export function saveGroups(groups: Group[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    notifyChange();
  } catch (e) {
    console.error("Error saving groups", e);
  }
}

export function addLiveGroup(groupData: {
  name: string;
  description: string;
  category: string;
  image?: string;
  member_count?: number;
}): Group {
  const all = getStoredGroups();
  const slug = groupData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  const newGroup: Group = {
    id: Date.now(),
    slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
    name: groupData.name,
    description: groupData.description,
    category: groupData.category,
    member_count: groupData.member_count ?? 1,
    joined: true,
    image: groupData.image,
  };
  saveGroups([newGroup, ...all]);
  return newGroup;
}

export function updateLiveGroup(id: number | string, updates: Partial<Group>): void {
  const all = getStoredGroups();
  const next = all.map((g) => (String(g.id) === String(id) ? { ...g, ...updates } : g));
  saveGroups(next);
}

export function deleteLiveGroup(id: number | string): void {
  const all = getStoredGroups();
  saveGroups(all.filter((g) => String(g.id) !== String(id)));
}

// ─── REACT HOOKS ──────────────────────────────────────────────────

export function useLiveOffers() {
  const [offers, setOffers] = useState<LiveOffer[]>([]);

  useEffect(() => {
    setOffers(getStoredOffers());
    const handler = () => setOffers(getStoredOffers());
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    offers,
    activeOffers: offers.filter((o) => o.active),
    addOffer: addLiveOffer,
    updateOffer: updateLiveOffer,
    toggleOffer: toggleOfferStatus,
    deleteOffer: deleteLiveOffer,
  };
}

export function useLiveDoctors() {
  const [doctors, setDoctors] = useState<LiveDoctor[]>([]);

  useEffect(() => {
    setDoctors(getStoredDoctors());
    const handler = () => setDoctors(getStoredDoctors());
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    doctors,
    activeDoctors: doctors.filter((d) => d.active),
    addDoctor: addLiveDoctor,
    updateDoctor: updateLiveDoctor,
    toggleDoctor: toggleDoctorStatus,
    deleteDoctor: deleteLiveDoctor,
  };
}

export function useLiveGroups() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    setGroups(getStoredGroups());
    const handler = () => setGroups(getStoredGroups());
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    groups,
    addGroup: addLiveGroup,
    updateGroup: updateLiveGroup,
    deleteGroup: deleteLiveGroup,
  };
}
