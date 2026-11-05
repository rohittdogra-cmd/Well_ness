"use client";

import { maskContent, maskOffensiveText } from "@/lib/moderation.mjs";
import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Sparkles, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { ProfileActivitySummary } from "../components/ProfileActivitySummary";
import { Mascot, mascotNames } from "../components/Mascot";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  saveLocalProfile,
  useProfileQuery,
  type LocalProfile,
} from "../hooks/useLocalProfile";

const personaPresets = [
  {
    name: "Smash Scorer",
    tagline: "Assigned Persona",
    bio: "Passionate about sports, badminton rallies, staying energized and keeping stress at zero.",
    interests: ["Sports", "Badminton", "Mindfulness"],
    goal: "Feel more balanced",
    avatar: 1, // Sprout
  },
  {
    name: "Mindful Mover",
    tagline: "Wellness Flow",
    bio: "Focused on daily movement, desk-stretches, and healthy workday habits.",
    interests: ["Yoga", "Mindfulness", "Coffee"],
    goal: "Build a good habit",
    avatar: 0, // Seedling
  },
  {
    name: "Zen Seeker",
    tagline: "Calm & Centered",
    bio: "Taking breathers during high-intensity projects to cultivate mental clarity and peace.",
    interests: ["Mindfulness", "Books", "Music"],
    goal: "Feel more balanced",
    avatar: 2, // Blossom
  },
  {
    name: "Courtside Champ",
    tagline: "Team Spirit",
    bio: "Loves friendly competitions, team sports, and keeping colleagues active.",
    interests: ["Sports", "Travel", "Food"],
    goal: "Meet my people",
    avatar: 3, // Leaf
  },
];

const allInterests = [
  "Sports",
  "Badminton",
  "Mindfulness",
  "Yoga",
  "Music",
  "Coffee",
  "Books",
  "Gaming",
  "Travel",
  "Food",
  "Photography",
  "Movies",
  "Learning",
];

const availabilityOptions = [
  "Early mornings",
  "Lunch breaks",
  "After work",
  "Weekends",
];

const goalOptions = [
  "Feel more balanced",
  "Meet my people",
  "Try something new",
  "Build a good habit",
];

export function ProfilePage() {
  const { user, identity } = useInternetIdentity();
  const { data: remoteProfile, isLoading } = useProfileQuery();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<LocalProfile | null>(null);
  const profile = draft ??
    remoteProfile ?? {
      name: "",
      avatar: 0,
      bio: "",
      interests: [],
      availability: [],
      goal: "",
    };
  function setProfile(
    value: LocalProfile | ((previous: LocalProfile) => LocalProfile),
  ) {
    setDraft((previous) =>
      typeof value === "function" ? value(previous ?? profile) : value,
    );
  }
  const publicProfile = maskContent(profile) as LocalProfile;
  const [section, setSection] = useState<"activity" | "edit">("activity");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleAvailability = (item: string) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.includes(item)
        ? prev.availability.filter((a) => a !== item)
        : [...prev.availability, item],
    }));
  };

  const applyPreset = (preset: (typeof personaPresets)[number]) => {
    setProfile((prev) => ({
      ...prev,
      name: preset.name,
      bio: preset.bio,
      avatar: preset.avatar,
      interests: Array.from(new Set([...prev.interests, ...preset.interests])),
      goal: preset.goal,
    }));
    toast.info(`Applied persona: ${preset.name}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (profile.name.trim().length < 2) {
      setError("Please choose a display name with at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      const userId = user?.id || identity?.getPrincipal().toText() || "";
      await saveLocalProfile(
        {
          ...profile,
          name: profile.name.trim(),
          bio: profile.bio.trim(),
        },
        userId,
      );

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["profile"] }),
        qc.invalidateQueries({ queryKey: ["user-profile"] }),
      ]);

      toast.success(
        `Profile saved successfully! Welcome, ${maskOffensiveText(profile.name.trim())}.`,
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not save your profile. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Link
        href="/"
        className="text-action mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft size={16} /> Back to Hub
      </Link>

      <header className="member-profile-header">
        <div className="member-avatar">
          <Mascot variant={profile.avatar} />
        </div>
        <div>
          <span className="eyebrow">YOUR SPACE</span>
          <h1>Welcome, {publicProfile.name || "friend"}.</h1>
          <p>{publicProfile.bio || "Make a little room for what you enjoy."}</p>
        </div>
      </header>
      <nav className="profile-tabs" aria-label="Profile sections">
        <button
          type="button"
          aria-pressed={section === "activity"}
          onClick={() => setSection("activity")}
        >
          My activity
        </button>
        <button
          type="button"
          aria-pressed={section === "edit"}
          onClick={() => setSection("edit")}
        >
          Edit profile & interests
        </button>
        <Link href="/account">Account</Link>
      </nav>
      {section === "activity" ? (
        <>
          <div className="profile-preference-summary">
            <span>
              <strong>Interests</strong>{" "}
              {publicProfile.interests.join(" · ") || "Choose your interests"}
            </span>
            <span>
              <strong>Usually free</strong>{" "}
              {profile.availability.join(" · ") || "Choose later"}
            </span>
            <span>
              <strong>Here to</strong> {publicProfile.goal || "Explore"}
            </span>
            <button
              type="button"
              className="text-action"
              onClick={() => setSection("edit")}
            >
              Update preferences →
            </button>
          </div>
          <ProfileActivitySummary />
        </>
      ) : (
        <div className="profile-grid profile-edit-grid">
          <section className="profile-form">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="profile-edit-intro">
                <h2>Your kind of connection</h2>
                <p>
                  Choose now or come back later. These preferences help you find
                  your people.
                </p>
              </div>
              {/* Interests */}
              <div>
                <label className="field-label block text-sm font-medium mb-2">
                  Your Interests & Activities
                </label>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map((interest) => {
                    const isChecked = profile.interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        aria-pressed={isChecked}
                        onClick={() => toggleInterest(interest)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                          isChecked
                            ? "bg-emerald-700 text-white font-medium shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {interest}
                        {isChecked && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="field-label block text-sm font-medium mb-2">
                  When are you usually free?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availabilityOptions.map((timeSlot) => {
                    const isChecked = profile.availability.includes(timeSlot);
                    return (
                      <button
                        type="button"
                        key={timeSlot}
                        aria-pressed={isChecked}
                        onClick={() => toggleAvailability(timeSlot)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          isChecked
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {timeSlot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="field-label block text-sm font-medium mb-2">
                  What brings you to the Hub?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((goal) => {
                    const isChecked = profile.goal === goal;
                    return (
                      <button
                        type="button"
                        key={goal}
                        aria-pressed={isChecked}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            goal: isChecked ? "" : goal,
                          })
                        }
                        className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                          isChecked
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-medium"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label
                  className="field-label block text-sm font-medium mb-1.5"
                  htmlFor="profile-name"
                >
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  maxLength={35}
                  required
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="e.g. Smash Scorer"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This name is displayed across the Hub, topbar greetings, and
                  community leaderboards.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label
                  className="field-label block text-sm font-medium mb-1.5"
                  htmlFor="profile-bio"
                >
                  Bio / About You
                </label>
                <textarea
                  id="profile-bio"
                  rows={2}
                  maxLength={200}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Share a short note about what you enjoy or what keeps you grounded."
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <span className="block text-right text-xs text-gray-400">
                  {profile.bio.length}/200
                </span>
              </div>

              <details className="profile-persona-options">
                <summary>Avatar & persona options</summary>{" "}
                {/* Avatar Picker */}
                <div>
                  <label className="field-label block text-sm font-medium mb-2">
                    Choose your Avatar Mascot
                  </label>
                  <div className="avatar-picker grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                    {mascotNames.map((name, i) => {
                      const isChosen = profile.avatar === i;
                      return (
                        <button
                          type="button"
                          key={name}
                          aria-pressed={isChosen}
                          onClick={() => setProfile({ ...profile, avatar: i })}
                          className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                            isChosen
                              ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 font-medium ring-2 ring-emerald-600/20"
                              : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="w-10 h-10 mb-1 flex items-center justify-center">
                            <Mascot variant={i} />
                          </div>
                          <span className="text-[11px] leading-tight">
                            {name}
                          </span>
                          {isChosen && (
                            <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                              <Check size={10} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Quick Persona Selector */}
                <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Sparkles size={14} /> Quick Persona Presets
                    </span>
                    {profile.name === "Smash Scorer" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-medium text-white">
                        <Check size={12} /> Assigned Persona
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-900/80 mb-3">
                    Switch or re-apply your assigned persona with one click:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personaPresets.map((preset) => {
                      const isSelected = profile.name === preset.name;
                      return (
                        <button
                          type="button"
                          key={preset.name}
                          onClick={() => applyPreset(preset)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/20"
                              : "bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100/60"
                          }`}
                        >
                          <span>{preset.name}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </details>
              {/* Account & OTP Security Card */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-gray-700">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Sign-In Security & Account
                </div>
                <p className="text-xs text-gray-600">
                  Connected Email:{" "}
                  <strong>{user?.email || "Member account"}</strong>
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
                  <Check size={12} /> Signed in to your account
                </div>
              </div>

              {error && (
                <p
                  className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || isLoading}
                  className="wellness-button inline-flex items-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Saving changes…" : "Save profile"}
                </button>
                <Link href="/" className="text-action text-sm">
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          {/* Live Profile Preview Aside */}
          <aside className="profile-preview sticky top-6">
            <span className="eyebrow">YOUR PUBLIC PREVIEW</span>
            <div className="preview-mascot">
              <Mascot variant={profile.avatar} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {publicProfile.name || "Smash Scorer"}
            </h2>
            <div className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              {profile.name === "Smash Scorer"
                ? "🏸 Assigned Persona"
                : "🌱 Wellness Member"}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              {publicProfile.bio ||
                "Active member aiming to de-stress and stay healthy."}
            </p>
            <div className="preview-interests mt-3">
              {publicProfile.interests.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="preview-bottom mt-4">
              <span className="status-dot" />
              {publicProfile.goal || "Feel more balanced"}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              Visible on the Home Page, Topbar greetings, and Member Directory.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
