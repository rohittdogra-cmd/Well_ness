"use client";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Dice5,
  ShieldCheck,
  MapPin,
  Heart,
  User,
  Compass,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Mascot, mascotNames } from "../components/Mascot";
import {
  saveLocalProfile,
  useLocalProfile,
  type LocalProfile,
} from "../hooks/useLocalProfile";
import {
  generateCuteName,
  shuffleCuteName,
  type GenderType,
} from "../lib/anonymousNameGenerator";

const ALL_INTERESTS = [
  "Badminton",
  "Football",
  "Cricket",
  "Gym / Fitness",
  "Yoga",
  "Running",
  "Coffee",
  "Mindfulness",
  "Gaming",
  "Books",
  "Travel",
  "Food",
  "Music",
];

const POPULAR_LOCATIONS = [
  "Janakpuri, Delhi",
  "Dwarka, Delhi",
  "South Delhi",
  "Rohini, Delhi",
  "Connaught Place, Delhi",
  "Gurgaon, Haryana",
  "Sohna Road, Gurgaon",
  "Noida, Uttar Pradesh",
  "Greater Noida, Uttar Pradesh",
  "Faridabad, Haryana",
  "Ghaziabad, Uttar Pradesh",
  "Palwal, Haryana",
  "Indiranagar, Bangalore",
  "Auckland, New Zealand",
];

const AVAILABILITY = [
  "Early mornings",
  "Lunch breaks",
  "After work",
  "Weekends",
];

const GOALS = [
  "Play badminton & turf sports",
  "Meet like-minded peers",
  "Feel more balanced & de-stress",
  "Build a healthy fitness habit",
];

export function OnboardingPage() {
  const existing = useLocalProfile();
  const { identity } = useInternetIdentity();

  return (
    <ProfileBuilder
      key={identity?.getPrincipal().toText() || "profile-builder"}
      existing={existing}
    />
  );
}

function ProfileBuilder({ existing }: { existing: LocalProfile | null }) {
  const { identity } = useInternetIdentity();

  // Initialize profile with gender, location, and auto-assigned cute name
  const [gender, setGender] = useState<GenderType>(
    (existing?.gender as GenderType) || "male",
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    existing?.interests?.length
      ? existing.interests
      : ["Badminton", "Football"],
  );
  const [location, setLocation] = useState<string>(
    existing?.location || "Janakpuri, Delhi",
  );
  // Locations cannot be changed once set by the user
  const isLocationLocked = Boolean(existing?.location && existing.location.trim().length > 0);

  const [profile, setProfile] = useState<LocalProfile>(() => {
    if (existing && existing.name.trim()) {
      return existing;
    }
    const initName = generateCuteName({
      gender: "male",
      interests: ["Badminton", "Football"],
    });
    return {
      name: initName,
      assignedCuteName: initName,
      avatar: 1,
      bio: "Up for weekend badminton, sports turfs, and good conversations.",
      interests: ["Badminton", "Football"],
      availability: ["Weekends", "After work"],
      goal: "Play badminton & turf sports",
      gender: "male",
      location: "Janakpuri, Delhi",
    };
  });

  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [justShuffled, setJustShuffled] = useState(false);

  // Auto-generate name when gender or interests change if user hasn't explicitly chosen yet
  const handleGenderChange = (newGender: GenderType) => {
    setGender(newGender);
    const newName = generateCuteName({
      gender: newGender,
      interests: selectedInterests,
    });
    setProfile((p) => ({
      ...p,
      gender: newGender,
      name: newName,
      assignedCuteName: newName,
    }));
  };

  const toggleInterest = (val: string) => {
    const updated = selectedInterests.includes(val)
      ? selectedInterests.filter((x) => x !== val)
      : [...selectedInterests, val];
    setSelectedInterests(updated);

    // If current name doesn't match new interests, regenerate fresh cute name
    const freshName = generateCuteName({
      gender,
      interests: updated,
    });
    setProfile((p) => ({
      ...p,
      interests: updated,
      name: freshName,
      assignedCuteName: freshName,
    }));
  };

  const handleShuffleCuteName = () => {
    const nextName = shuffleCuteName({
      gender,
      interests: selectedInterests,
      currentName: profile.name,
    });
    setProfile((p) => ({
      ...p,
      name: nextName,
      assignedCuteName: nextName,
    }));
    setJustShuffled(true);
    setTimeout(() => setJustShuffled(false), 600);
  };

  function toggleAvailability(value: string) {
    setProfile((p) => ({
      ...p,
      availability: p.availability.includes(value)
        ? p.availability.filter((v) => v !== value)
        : [...p.availability, value],
    }));
  }

  async function next() {
    setError("");

    if (step === 0) {
      if (!profile.name || profile.name.trim().length < 2) {
        setError("Please roll an anonymous cute name to continue.");
        return;
      }
      if (selectedInterests.length === 0) {
        setError("Pick at least one sport or interest to personalize your profile.");
        return;
      }
    }

    if (step === 1) {
      if (!location.trim()) {
        setError("Please enter your city or area (e.g., 'Janakpuri, Delhi').");
        return;
      }
    }

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    try {
      const payload: LocalProfile = {
        ...profile,
        name: profile.name.trim(),
        assignedCuteName: profile.name.trim(),
        gender,
        location: isLocationLocked && existing?.location ? existing.location : location.trim(),
        interests: selectedInterests,
        bio: profile.bio.trim(),
      };
      await saveLocalProfile(
        payload,
        identity?.getPrincipal().toText() || "",
      );
      await qc.invalidateQueries({ queryKey: ["profile"] });
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-intro">
        <span className="eyebrow">SAFE · WHOLESOME · ANONYMOUS</span>
        <h1>{existing ? "Your Sports & Match Profile." : "Welcome to the Hub."}</h1>
        <p>
          We auto-assign cute, respectful handles so you can connect, match for badminton, and play safely without awkwardness.
        </p>
      </div>

      <div className="profile-grid">
        <section className="profile-form">
          <div className="step-track">
            {["Identity & Cute Name", "Your Location", "Rhythm & Goals"].map((label, i) => (
              <button
                type="button"
                key={label}
                disabled={i > step}
                onClick={() => {
                  setStep(i);
                  setError("");
                }}
                aria-current={step === i ? "step" : undefined}
              >
                <span>{i < step ? <Check size={14} /> : `0${i + 1}`}</span>
                {label}
              </button>
            ))}
          </div>

          {done ? (
            <div className="profile-success" role="status">
              <Sparkles size={36} />
              <h2>You’re all set to play and connect!</h2>
              <p>
                Your profile is saved with your cute anonymous handle <strong>{profile.name}</strong> from <strong>{location}</strong>.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
                <Link href="/programs/badminton" className="wellness-button" style={{ background: "#087f79" }}>
                  Explore Badminton &amp; Turfs <ArrowRight size={18} />
                </Link>
                <Link href="/" className="wellness-button" style={{ background: "#334155" }}>
                  Go to Hub Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── STEP 0: GENDER & AUTO-ASSIGNED CUTE NAME ── */}
                  {step === 0 && (
                    <>
                      <h2>Your Anonymous Cute Name</h2>
                      <p>
                        To ensure zero harassment and keep our sports circles welcoming, display names are auto-assigned based on your sports and gender.
                      </p>

                      {/* Gender selector */}
                      <label className="field-label" style={{ marginTop: "16px" }}>
                        Select your gender
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "8px",
                          marginBottom: "18px",
                        }}
                      >
                        {(
                          [
                            { id: "male", label: "Male" },
                            { id: "female", label: "Female" },
                            { id: "non-binary", label: "Non-binary / Neutral" },
                          ] as const
                        ).map((g) => (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => handleGenderChange(g.id)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: "12px",
                              border: gender === g.id ? "2px solid #087f79" : "1px solid #cbd5e1",
                              background: gender === g.id ? "rgba(8, 127, 121, 0.08)" : "#ffffff",
                              color: gender === g.id ? "#0f766e" : "#475569",
                              fontWeight: gender === g.id ? 700 : 500,
                              fontSize: "13px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {gender === g.id && <Check size={14} />}
                            {g.label}
                          </button>
                        ))}
                      </div>

                      {/* Sports & Interests selection */}
                      <label className="field-label">
                        Pick your sports &amp; passions <span>*</span>
                      </label>
                      <div className="interest-picker" style={{ marginBottom: "18px" }}>
                        {ALL_INTERESTS.map((item) => {
                          const isSel = selectedInterests.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              aria-pressed={isSel}
                              className={isSel ? "selected" : ""}
                              onClick={() => toggleInterest(item)}
                            >
                              {item === "Badminton" && "🏸 "}
                              {item === "Football" && "⚽ "}
                              {item === "Cricket" && "🏏 "}
                              {item === "Gym / Fitness" && "💪 "}
                              {item === "Yoga" && "🧘 "}
                              {item === "Coffee" && "☕ "}
                              {item === "Running" && "🏃 "}
                              {item}
                              {isSel && <Check size={14} />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display of Auto-Assigned Cute Handle (NO custom text edit) */}
                      <div
                        style={{
                          background: "linear-gradient(135deg, rgba(8, 127, 121, 0.08) 0%, rgba(20, 184, 166, 0.05) 100%)",
                          border: "1.5px solid rgba(8, 127, 121, 0.3)",
                          borderRadius: "16px",
                          padding: "18px 20px",
                          marginBottom: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <Sparkles size={16} color="#0f766e" />
                            <span style={{ fontSize: "11px", fontWeight: 750, color: "#0f766e", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                              Auto-Assigned Cute Handle
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "-0.02em",
                              transition: "transform 0.2s ease",
                              transform: justShuffled ? "scale(1.04)" : "scale(1)",
                            }}
                          >
                            {profile.name}
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Assigned from your {gender} {selectedInterests[0] || "Sports"} profile
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleShuffleCuteName}
                          style={{
                            background: "#087f79",
                            color: "white",
                            border: "none",
                            padding: "9px 16px",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            boxShadow: "0 2px 6px rgba(8, 127, 121, 0.25)",
                          }}
                        >
                          <Dice5 size={16} />
                          Roll another cute name
                        </button>
                      </div>

                      {/* Notice about custom text being disabled */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          color: "#475569",
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          marginBottom: "18px",
                        }}
                      >
                        <ShieldCheck size={16} color="#059669" />
                        <span>Manual name input is locked to protect everyone from offensive or troll usernames.</span>
                      </div>

                      {/* Avatar Picker */}
                      <fieldset>
                        <legend>Pick your avatar mascot</legend>
                        <div className="avatar-picker">
                          {mascotNames.map((name, i) => (
                            <button
                              type="button"
                              key={name}
                              aria-pressed={profile.avatar === i}
                              onClick={() => setProfile({ ...profile, avatar: i })}
                              className={profile.avatar === i ? "selected" : ""}
                            >
                              <Mascot variant={i} />
                              <span>{name}</span>
                              {profile.avatar === i && (
                                <Check className="avatar-check" size={16} />
                              )}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  )}

                  {/* ── STEP 1: YOUR LOCATION ── */}
                  {step === 1 && (
                    <>
                      <h2>Where are you based?</h2>
                      <p>
                        Your location is shared with prospective sports partners so you both know if an in-person match (like badminton in Janakpuri or Gurgaon) is practical, or if you are across different cities/countries.
                      </p>

                      {isLocationLocked ? (
                        <div
                          style={{
                            background: "#fffbeb",
                            border: "1.5px solid #fde68a",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            marginTop: "16px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            color: "#92400e",
                          }}
                        >
                          <Lock size={18} style={{ flexShrink: 0, marginTop: "2px", color: "#d97706" }} />
                          <div>
                            <strong style={{ fontSize: "13.5px", display: "block", marginBottom: "2px" }}>
                              Your Location is Permanently Locked
                            </strong>
                            <span style={{ fontSize: "12px", lineHeight: 1.5, display: "block" }}>
                              Your account location was verified as <strong>{existing?.location}</strong>. Once entered, locations cannot be changed to prevent distance manipulation and preserve matchmaking integrity.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "#f0fdfa",
                            border: "1px solid #99f6e4",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            marginTop: "14px",
                            marginBottom: "14px",
                            fontSize: "12px",
                            color: "#0f766e",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Lock size={15} style={{ flexShrink: 0 }} />
                          <span><strong>Notice:</strong> Once you enter and save this location, it is permanently locked to your account and cannot be modified later.</span>
                        </div>
                      )}

                      <label className="field-label" htmlFor="user-location" style={{ marginTop: "14px" }}>
                        City &amp; Area <span>*</span>
                        {isLocationLocked && (
                          <span style={{ marginLeft: "8px", fontSize: "11px", color: "#d97706", fontWeight: 700 }}>
                            🔒 (Locked)
                          </span>
                        )}
                      </label>
                      <div style={{ position: "relative", marginBottom: "12px" }}>
                        <MapPin
                          size={18}
                          color="#0f766e"
                          style={{ position: "absolute", left: "12px", top: "14px" }}
                        />
                        <input
                          id="user-location"
                          style={{
                            paddingLeft: "38px",
                            background: isLocationLocked ? "#f8fafc" : "#ffffff",
                            cursor: isLocationLocked ? "not-allowed" : "text",
                            color: isLocationLocked ? "#475569" : "#0f172a",
                          }}
                          placeholder="e.g. Janakpuri, Delhi or Gurgaon, Haryana"
                          value={location}
                          onChange={(e) => {
                            if (!isLocationLocked) {
                              setLocation(e.target.value);
                            }
                          }}
                          maxLength={60}
                          disabled={isLocationLocked}
                          readOnly={isLocationLocked}
                          required
                        />
                        {isLocationLocked && (
                          <Lock
                            size={16}
                            color="#94a3b8"
                            style={{ position: "absolute", right: "12px", top: "14px" }}
                          />
                        )}
                      </div>

                      {/* Quick click suggestions (only shown for first-time onboarding) */}
                      {!isLocationLocked && (
                        <div style={{ marginBottom: "20px" }}>
                          <span style={{ fontSize: "11.5px", fontWeight: 650, color: "#64748b", display: "block", marginBottom: "6px" }}>
                            Quick select popular hubs:
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {POPULAR_LOCATIONS.map((loc) => (
                              <button
                                type="button"
                                key={loc}
                                onClick={() => setLocation(loc)}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "8px",
                                  border: location === loc ? "1.5px solid #087f79" : "1px solid #cbd5e1",
                                  background: location === loc ? "rgba(8, 127, 121, 0.1)" : "#ffffff",
                                  color: location === loc ? "#0f766e" : "#475569",
                                  fontSize: "11.5px",
                                  fontWeight: location === loc ? 700 : 500,
                                  cursor: "pointer",
                                }}
                              >
                                📍 {loc}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proximity explainer */}
                      <div
                        style={{
                          background: "#f0fdfa",
                          border: "1px solid #99f6e4",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          fontSize: "12.5px",
                          color: "#115e59",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>How proximity matching works:</strong>
                        <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                          <li><strong>Nearby / Same City:</strong> Shows green badge &amp; enables direct badminton turf slot booking.</li>
                          <li><strong>Far Distance / International:</strong> Shows purple badge indicating remote chat only, preventing unrealistic meetup plans.</li>
                        </ul>
                      </div>
                    </>
                  )}

                  {/* ── STEP 2: RHYTHM & BIO ── */}
                  {step === 2 && (
                    <>
                      <h2>Your Rhythm &amp; Bio</h2>
                      <p>Tell prospective peers when you like to play and what you are looking for.</p>

                      <label className="field-label" htmlFor="profile-bio" style={{ marginTop: "12px" }}>
                        Short bio <small>optional</small>
                      </label>
                      <textarea
                        id="profile-bio"
                        maxLength={160}
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        placeholder="Interests, badminton level (Beginner/Intermediate), or preferred match hours."
                        rows={3}
                      />
                      <small className="character-count">
                        {profile.bio.length}/160
                      </small>

                      <fieldset style={{ marginTop: "16px" }}>
                        <legend>When are you usually free for sports / meetups?</legend>
                        <div className="interest-picker">
                          {AVAILABILITY.map((item) => (
                            <button
                              type="button"
                              key={item}
                              aria-pressed={profile.availability.includes(item)}
                              className={
                                profile.availability.includes(item)
                                  ? "selected"
                                  : ""
                              }
                              onClick={() => toggleAvailability(item)}
                            >
                              {item}
                              {profile.availability.includes(item) && (
                                <Check size={15} />
                              )}
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <fieldset style={{ marginTop: "16px" }}>
                        <legend>What brings you here?</legend>
                        <div className="goal-picker">
                          {GOALS.map((item) => (
                            <button
                              type="button"
                              key={item}
                              aria-pressed={profile.goal === item}
                              className={
                                profile.goal === item ? "selected" : ""
                              }
                              onClick={() =>
                                setProfile({
                                  ...profile,
                                  goal: profile.goal === item ? "" : item,
                                })
                              }
                            >
                              {item}
                              <span>
                                {profile.goal === item ? (
                                  <Check size={16} />
                                ) : (
                                  "+"
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && (
                <p className="form-error" id="profile-error" role="alert" style={{ marginTop: "12px" }}>
                  {error}
                </p>
              )}

              <div className="form-actions" style={{ marginTop: "24px" }}>
                {step > 0 ? (
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => {
                      setStep(step - 1);
                      setError("");
                    }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                ) : (
                  <Link href="/" className="text-action">
                    Back to the hub
                  </Link>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="wellness-button"
                >
                  {step === 2 ? "Save & Activate Profile" : "Continue"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ── RIGHT PREVIEW CARD ── */}
        <aside className="profile-preview">
          <span className="eyebrow">YOUR ANONYMOUS PROFILE</span>
          <div className="preview-mascot">
            <Mascot variant={profile.avatar} />
          </div>
          <h2>{profile.name}</h2>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(8, 127, 121, 0.1)",
              color: "#0f766e",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              margin: "6px 0 10px",
            }}
          >
            <MapPin size={12} />
            {location || "Location not set"}
          </div>

          <p>
            {profile.bio || "Up for weekend badminton, sports turfs, and good conversations."}
          </p>

          <div className="preview-interests">
            {selectedInterests.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="preview-bottom">
            <span className="status-dot" />
            {profile.goal || "Play badminton & turf sports"}
          </div>
          <small>100% Anonymous. Protected by Auto-Assigned Handles.</small>
        </aside>
      </div>
    </div>
  );
}
