"use client";

import { useEffect, useState } from "react";
import { MOCK_GROUPS } from "./mockGroups";
import type { Group, Post, Reply } from "@/hooks/useCommunity";

// ─── TYPES ────────────────────────────────────────────────────────

export interface LiveNotification {
  id: number;
  message: string;
  href: string;
  read: boolean;
  created_at: string;
  type?: "group_join" | "session_join" | "post" | "system";
}

export interface LivePost {
  id: number;
  group_id?: number | null;
  body: string;
  created_at: string;
  alias: string;
  anonymous: boolean;
  likes: number;
  liked: boolean;
  mine: boolean;
  replies: Reply[];
}

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

export interface LiveAppointment {
  id: string;
  bookingRef: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorFee: string;
  doctorCabinLocation: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  slot: string;
  mode: "In-Clinic (Doctor's Cabin)" | "Confidential Online Video";
  notes?: string;
  paymentMethod: "Pay at Doctor's Cabin (Cash / UPI / Card on Arrival)";
  paymentStatus: "Pending (Pay at Cabin)" | "Paid at Cabin";
  status: "Pending Phone Verification" | "Verified & Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  verifiedBy?: string;
  verificationNotes?: string;
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
const NOTIFICATIONS_KEY = "wellness_live_notifications";
const POSTS_KEY = "wellness_live_posts";
const APPOINTMENTS_KEY = "wellness_live_appointments";
const SYNC_EVENT = "wellness_live_data_sync";

export const INITIAL_APPOINTMENTS: LiveAppointment[] = [
  {
    id: "apt-1",
    bookingRef: "APT-DLF-3912",
    doctorId: "doc-1",
    doctorName: "Dr. Alok Verma",
    doctorSpecialty: "Clinical Psychologist (Ph.D, NIMHANS)",
    doctorFee: "₹1,500 / session",
    doctorCabinLocation: "Cyber City Wellness Hub, Suite 402, DLF Phase 2, Gurgaon",
    patientName: "Vikram Malhotra",
    patientPhone: "+91 98112 34567",
    patientEmail: "vikram.m@google.com",
    slot: "Today at 5:00 PM",
    mode: "In-Clinic (Doctor's Cabin)",
    notes: "High anxiety before sprint delivery, chronic insomnia.",
    paymentMethod: "Pay at Doctor's Cabin (Cash / UPI / Card on Arrival)",
    paymentStatus: "Pending (Pay at Cabin)",
    status: "Verified & Confirmed",
    createdAt: "2026-10-13T09:15:00.000Z",
    verifiedBy: "Care Team (Pooja K.)",
    verificationNotes: "Called patient on phone, confirmed arrival by 4:45 PM at DLF Cabin.",
  },
  {
    id: "apt-2",
    bookingRef: "APT-GCR-7741",
    doctorId: "doc-2",
    doctorName: "Dr. Ananya Sen",
    doctorSpecialty: "Counseling Psychologist & Workplace Burnout Specialist",
    doctorFee: "₹1,800 / session",
    doctorCabinLocation: "One Horizon Center, 14th Floor Cabin, Golf Course Road, Gurgaon",
    patientName: "Kavita Rao",
    patientPhone: "+91 98765 43210",
    patientEmail: "kavita.r@startup.in",
    slot: "Tomorrow at 10:00 AM",
    mode: "In-Clinic (Doctor's Cabin)",
    notes: "Severe managerial burnout, imposter syndrome.",
    paymentMethod: "Pay at Doctor's Cabin (Cash / UPI / Card on Arrival)",
    paymentStatus: "Pending (Pay at Cabin)",
    status: "Pending Phone Verification",
    createdAt: "2026-10-13T12:30:00.000Z",
  },
];

export const INITIAL_NOTIFICATIONS: LiveNotification[] = [
  {
    id: 1,
    message: "👋 Welcome to stress-unwind! Explore circles, activities, and unwind together.",
    href: "/groups",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: "system",
  },
  {
    id: 2,
    message: "✨ Maya Sharma enrolled in Daily Mindfulness Circle · Join the conversation!",
    href: "/groups/daily-mindfulness-circle",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: "group_join",
  },
];

export const INITIAL_POSTS: LivePost[] = [
  {
    id: 1,
    group_id: null,
    body: "Welcome to stress-unwind! This is a judgment-free space to take a break from work stress, share honest thoughts, and connect.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    alias: "Community Guide",
    anonymous: false,
    likes: 4,
    liked: false,
    mine: false,
    replies: [
      {
        id: 101,
        body: "So happy to have this space during intense project sprints!",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        alias: "Samir Patel",
        mine: false,
      },
    ],
  },
];

export function getUserDisplayName(): string {
  if (typeof window === "undefined") return "Alex Member";
  try {
    const raw = localStorage.getItem("wellness_local_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name) return parsed.name;
    }
  } catch {}
  return "Alex Member";
}

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
    const mockMap = new Map(MOCK_GROUPS.map((g) => [g.slug, g]));
    const parsedSlugs = new Set<string>();

    const updated = parsed.map((g) => {
      parsedSlugs.add(g.slug);
      const mock = mockMap.get(g.slug);
      if (mock) {
        return {
          ...g,
          category: mock.category,
          image: g.image || mock.image,
          name: g.name || mock.name,
          description: g.description || mock.description,
        };
      }
      return g;
    });

    const missing = MOCK_GROUPS.filter((g) => !parsedSlugs.has(g.slug));
    const merged = [...updated, ...missing];
    localStorage.setItem(GROUPS_KEY, JSON.stringify(merged));
    return merged;
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

export function toggleStoredGroup(groupIdOrSlug: any, join: boolean, memberName?: string): void {
  const all = getStoredGroups();
  let affectedGroup: Group | null = null;
  const next = all.map((g) => {
    if (String(g.id) === String(groupIdOrSlug) || g.slug === String(groupIdOrSlug)) {
      affectedGroup = g;
      return {
        ...g,
        joined: join,
        member_count: Math.max(1, (g.member_count || 1) + (join ? 1 : -1)),
      };
    }
    return g;
  });
  saveGroups(next);

  if (join && affectedGroup) {
    const name = memberName || getUserDisplayName();
    const g = affectedGroup as Group;

    // 1. Notify other users
    addLiveNotification({
      message: `🎉 ${name} enrolled in ${g.name}! Say hi to your new circle member.`,
      href: `/groups/${g.slug}`,
      type: "group_join",
    });

    // 2. Add an automatic welcoming conversation post so conversation keeps going!
    addLivePost({
      groupId: g.id,
      body: `👋 ${name} just enrolled in ${g.name}! Welcome to the circle — let's connect, share small wins, and keep the conversation going!`,
      alias: "Circle Welcome",
      anonymous: false,
    });
  }
}

// ─── NOTIFICATIONS FUNCTIONS ──────────────────────────────────────

export function getStoredNotifications(): LiveNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading notifications", e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: LiveNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    notifyChange();
  } catch (e) {
    console.error("Error saving notifications", e);
  }
}

export function addLiveNotification(data: {
  message: string;
  href: string;
  type?: "group_join" | "session_join" | "post" | "system";
}): LiveNotification {
  const all = getStoredNotifications();
  const newNotif: LiveNotification = {
    id: Date.now(),
    message: data.message,
    href: data.href,
    read: false,
    created_at: new Date().toISOString(),
    type: data.type || "system",
  };
  saveNotifications([newNotif, ...all]);
  return newNotif;
}

export function markNotificationRead(id: number): void {
  const all = getStoredNotifications();
  const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(next);
}

export function markAllNotificationsRead(): void {
  const all = getStoredNotifications();
  const next = all.map((n) => ({ ...n, read: true }));
  saveNotifications(next);
}

// ─── POSTS FUNCTIONS ──────────────────────────────────────────────

export function getStoredPosts(groupId?: number | null): Post[] {
  if (typeof window === "undefined") {
    return groupId
      ? INITIAL_POSTS.filter((p) => p.group_id === groupId || p.group_id === null)
      : INITIAL_POSTS;
  }
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return groupId
        ? INITIAL_POSTS.filter((p) => p.group_id === groupId || p.group_id === null)
        : INITIAL_POSTS;
    }
    const parsed: LivePost[] = JSON.parse(raw);
    const filtered = groupId !== undefined && groupId !== null
      ? parsed.filter((p) => p.group_id === groupId || p.group_id === null)
      : parsed;

    return filtered.map((p) => ({
      id: p.id,
      body: p.body,
      created_at: p.created_at,
      alias: p.alias,
      mine: p.mine ?? false,
      anonymous: p.anonymous ?? false,
      likes: p.likes ?? 0,
      liked: p.liked ?? false,
      replies: p.replies || [],
    }));
  } catch (e) {
    console.error("Error loading posts", e);
    return INITIAL_POSTS;
  }
}

export function savePosts(posts: LivePost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    notifyChange();
  } catch (e) {
    console.error("Error saving posts", e);
  }
}

export function addLivePost(data: {
  groupId?: number | null;
  body: string;
  anonymous?: boolean;
  alias?: string;
}): Post {
  const allRaw = typeof window !== "undefined" && localStorage.getItem(POSTS_KEY)
    ? JSON.parse(localStorage.getItem(POSTS_KEY) || "[]")
    : INITIAL_POSTS;

  const userAlias = data.alias || (data.anonymous ? "Anonymous Colleague" : getUserDisplayName());

  const newPost: LivePost = {
    id: Date.now(),
    group_id: data.groupId ?? null,
    body: data.body,
    created_at: new Date().toISOString(),
    alias: userAlias,
    anonymous: data.anonymous ?? false,
    likes: 0,
    liked: false,
    mine: true,
    replies: [],
  };

  savePosts([newPost, ...allRaw]);
  return newPost;
}

export function likeLivePost(postId: number): void {
  const allRaw: LivePost[] = typeof window !== "undefined" && localStorage.getItem(POSTS_KEY)
    ? JSON.parse(localStorage.getItem(POSTS_KEY) || "[]")
    : INITIAL_POSTS;

  const next = allRaw.map((p) => {
    if (p.id === postId) {
      const liked = !p.liked;
      return {
        ...p,
        liked,
        likes: Math.max(0, (p.likes || 0) + (liked ? 1 : -1)),
      };
    }
    return p;
  });
  savePosts(next);
}

export function replyLivePost(postId: number, body: string, alias?: string): void {
  const allRaw: LivePost[] = typeof window !== "undefined" && localStorage.getItem(POSTS_KEY)
    ? JSON.parse(localStorage.getItem(POSTS_KEY) || "[]")
    : INITIAL_POSTS;

  const userAlias = alias || getUserDisplayName();

  const next = allRaw.map((p) => {
    if (p.id === postId) {
      const replies = [
        ...(p.replies || []),
        {
          id: Date.now(),
          body,
          created_at: new Date().toISOString(),
          alias: userAlias,
          mine: true,
        },
      ];
      return { ...p, replies };
    }
    return p;
  });
  savePosts(next);
}

export function deleteLivePost(postId: number): void {
  const allRaw: LivePost[] = typeof window !== "undefined" && localStorage.getItem(POSTS_KEY)
    ? JSON.parse(localStorage.getItem(POSTS_KEY) || "[]")
    : INITIAL_POSTS;

  const next = allRaw
    .filter((p) => p.id !== postId)
    .map((p) => ({
      ...p,
      replies: (p.replies || []).filter((r) => r.id !== postId),
    }));
  savePosts(next);
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

// ─── APPOINTMENT FUNCTIONS & HOOK ─────────────────────────────────

export function getStoredAppointments(): LiveAppointment[] {
  if (typeof window === "undefined") return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading appointments", e);
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointments(appointments: LiveAppointment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    notifyChange();
  } catch (e) {
    console.error("Error saving appointments", e);
  }
}

export function bookLiveAppointment(data: {
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorFee: string;
  doctorCabinLocation?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  slot: string;
  mode?: "In-Clinic (Doctor's Cabin)" | "Confidential Online Video";
  notes?: string;
}): LiveAppointment {
  const all = getStoredAppointments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingRef = `APT-GUR-${randomSuffix}`;
  const newApt: LiveAppointment = {
    id: `apt-${Date.now()}`,
    bookingRef,
    doctorId: data.doctorId,
    doctorName: data.doctorName,
    doctorSpecialty: data.doctorSpecialty,
    doctorFee: data.doctorFee,
    doctorCabinLocation: data.doctorCabinLocation || "DLF Cyber City Wellness Cabin, Phase 2, Gurgaon",
    patientName: data.patientName,
    patientPhone: data.patientPhone,
    patientEmail: data.patientEmail,
    slot: data.slot,
    mode: data.mode || "In-Clinic (Doctor's Cabin)",
    notes: data.notes || "",
    paymentMethod: "Pay at Doctor's Cabin (Cash / UPI / Card on Arrival)",
    paymentStatus: "Pending (Pay at Cabin)",
    status: "Pending Phone Verification",
    createdAt: new Date().toISOString(),
  };

  saveAppointments([newApt, ...all]);

  // Fire-and-forget: notify backend care coordination team via API
  if (typeof window !== "undefined") {
    fetch("/api/appointments/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingRef: newApt.bookingRef,
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        doctorFee: data.doctorFee,
        doctorCabinLocation: newApt.doctorCabinLocation,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
        slot: data.slot,
        mode: newApt.mode,
        notes: data.notes,
      }),
    }).catch((err) => console.warn("Notification dispatch failed (non-blocking):", err));
  }

  // Dispatch live notification to backend team & doctor
  addLiveNotification({
    message: `🔔 New Appointment Booked: ${data.patientName} for Dr. ${data.doctorName} (${data.slot}). Call ${data.patientPhone} to verify attendance. Payment: At Doctor's Cabin.`,
    href: "/admin?tab=bookings",
    type: "system",
  });

  return newApt;
}

export function verifyLiveAppointment(
  id: string,
  verifiedBy: string = "Care Coordinator",
  verificationNotes?: string,
): void {
  const all = getStoredAppointments();
  const target = all.find((a) => a.id === id);
  const next = all.map((a) =>
    a.id === id
      ? {
          ...a,
          status: "Verified & Confirmed" as const,
          verifiedBy,
          verificationNotes:
            verificationNotes ||
            `Called ${a.patientPhone} - Verified attendance for ${a.slot} at ${a.doctorCabinLocation}.`,
        }
      : a,
  );
  saveAppointments(next);

  if (target) {
    addLiveNotification({
      message: `✅ Appointment Verified: ${target.patientName} confirmed for Dr. ${target.doctorName} (${target.slot}). Doctor cabin prepared.`,
      href: "/admin?tab=bookings",
      type: "system",
    });
  }
}

export function markAppointmentPaidAtCabin(id: string): void {
  const all = getStoredAppointments();
  const next = all.map((a) =>
    a.id === id
      ? {
          ...a,
          paymentStatus: "Paid at Cabin" as const,
          status: "Completed" as const,
        }
      : a,
  );
  saveAppointments(next);
}

export function cancelLiveAppointment(id: string, reason?: string): void {
  const all = getStoredAppointments();
  const next = all.map((a) =>
    a.id === id
      ? {
          ...a,
          status: "Cancelled" as const,
          verificationNotes: reason ? `Cancelled: ${reason}` : "Cancelled by patient/clinic.",
        }
      : a,
  );
  saveAppointments(next);
}

export function useLiveAppointments() {
  const [appointments, setAppointments] = useState<LiveAppointment[]>([]);

  useEffect(() => {
    setAppointments(getStoredAppointments());
    const handler = () => setAppointments(getStoredAppointments());
    window.addEventListener(SYNC_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SYNC_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const pendingVerificationAppointments = appointments.filter(
    (a) => a.status === "Pending Phone Verification",
  );
  const confirmedAppointments = appointments.filter(
    (a) => a.status === "Verified & Confirmed",
  );

  return {
    appointments,
    pendingVerificationAppointments,
    confirmedAppointments,
    pendingCount: pendingVerificationAppointments.length,
    bookAppointment: bookLiveAppointment,
    verifyAppointment: verifyLiveAppointment,
    markPaidAtCabin: markAppointmentPaidAtCabin,
    cancelAppointment: cancelLiveAppointment,
  };
}
