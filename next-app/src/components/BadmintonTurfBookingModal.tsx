"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Building2,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  TURF_VENUES,
  calculateProximity,
  saveTurfBooking,
  verifyTurfBooking,
  type TurfVenue,
  type TurfBookingRequest,
} from "@/lib/turfVenues";

interface BadmintonTurfBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCuteName?: string;
  partnerLocation?: string;
  userCuteName?: string;
  userLocation?: string;
  onBookingConfirmed?: (booking: TurfBookingRequest) => void;
}

export function BadmintonTurfBookingModal({
  isOpen,
  onClose,
  partnerCuteName = "Shuttle Queen",
  partnerLocation = "Gurgaon, Haryana",
  userCuteName = "Smash Sensation",
  userLocation = "Janakpuri, Delhi",
  onBookingConfirmed,
}: BadmintonTurfBookingModalProps) {
  // Wizard steps: 0 = Coordinates & Proximity, 1 = Choose Turf, 2 = Slot & Details, 3 = Team Verification Pass
  const [step, setStep] = useState<number>(0);

  // Proximity computation
  const proximity = useMemo(() => {
    return calculateProximity(userLocation, partnerLocation);
  }, [userLocation, partnerLocation]);

  // Selected meeting area
  const [selectedArea, setSelectedArea] = useState<string>(() => {
    if (userLocation.toLowerCase().includes("gurgaon") && partnerLocation.toLowerCase().includes("delhi")) {
      return "Central / Aerocity";
    }
    if (userLocation.toLowerCase().includes("delhi") && partnerLocation.toLowerCase().includes("gurgaon")) {
      return "Central / Aerocity";
    }
    return userLocation.split(",")[0] || "Janakpuri";
  });

  // Selected turf
  const [selectedTurf, setSelectedTurf] = useState<TurfVenue>(TURF_VENUES[0]);

  // Slot and player details
  const [matchDate, setMatchDate] = useState<string>("This Saturday");
  const [selectedSlot, setSelectedSlot] = useState<string>("07:00 AM – 08:00 AM");
  const [phoneNumber, setPhoneNumber] = useState<string>("+91 98112 34567");
  const [racketsNeeded, setRacketsNeeded] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");

  // Booking result & verification state
  const [currentBooking, setCurrentBooking] = useState<TurfBookingRequest | null>(null);
  const [verificationStage, setVerificationStage] = useState<"submitted" | "verifying" | "confirmed">("submitted");
  const [copiedPass, setCopiedPass] = useState(false);

  // Filter turfs based on selected meeting area
  const filteredTurfs = useMemo(() => {
    const term = selectedArea.toLowerCase();
    const matches = TURF_VENUES.filter(
      (v) =>
        v.area.toLowerCase().includes(term) ||
        v.cityState.toLowerCase().includes(term) ||
        v.name.toLowerCase().includes(term)
    );
    return matches.length > 0 ? matches : TURF_VENUES;
  }, [selectedArea]);

  if (!isOpen) return null;

  // Handle booking submission
  const handleSubmitBooking = () => {
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      toast.error("Please enter a valid phone number for team verification call.");
      return;
    }

    const bookingId = `TRF-BDM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: TurfBookingRequest = {
      bookingId,
      turfId: selectedTurf.id,
      turfName: selectedTurf.name,
      courtType: selectedTurf.courtType,
      area: selectedTurf.area,
      player1CuteName: userCuteName,
      player1Phone: phoneNumber.trim(),
      player2CuteName: partnerCuteName,
      date: matchDate,
      timeSlot: selectedSlot,
      racketsNeeded,
      status: "verifying",
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    saveTurfBooking(newBooking);
    setCurrentBooking(newBooking);
    setStep(3);
    setVerificationStage("verifying");

    // Realistic Team Verification simulation (verifying court availability with the manager)
    setTimeout(() => {
      const verified = verifyTurfBooking(bookingId, "Court 2 (Air Conditioned)");
      if (verified) {
        setCurrentBooking(verified);
        setVerificationStage("confirmed");
        toast.success(`Slot Verified! Court 2 reserved at ${selectedTurf.name}`);
        onBookingConfirmed?.(verified);
      }
    }, 2400);
  };

  const handleCopyPass = () => {
    if (!currentBooking) return;
    const text = `🏸 Badminton Match Confirmed!\nBooking: ${currentBooking.bookingId}\nTurf: ${currentBooking.turfName}\nDate: ${currentBooking.date} at ${currentBooking.timeSlot}\nPlayers: ${userCuteName} vs ${partnerCuteName}\nCourt: ${currentBooking.courtNumber || "Court 2"}\nPasscode: ${currentBooking.passcode || "PASS-4920"}`;
    navigator.clipboard?.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
    toast.success("Match pass details copied to clipboard!");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(8, 127, 121, 0.2)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "#087f79",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🏸
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                Badminton Matchmaking &amp; Turf Booking
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Coordinate location, find courts, and book verified slots together
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafafa",
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          {[
            "1. Locations & Midpoint",
            "2. Select Turf Court",
            "3. Time Slot & Phone",
            "4. Team Verification",
          ].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "10px 4px",
                borderBottom: step === i ? "2.5px solid #087f79" : "none",
                color: step === i ? "#087f79" : i < step ? "#059669" : "#94a3b8",
                background: step === i ? "#f0fdfa" : "transparent",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {/* ──────── STEP 0: LOCATIONS & MUTUAL MIDPOINT ──────── */}
          {step === 0 && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {/* Player 1 Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Player 1 (You)
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "2px 0" }}>
                    {userCuteName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0f766e", fontSize: "12px", fontWeight: 600 }}>
                    <MapPin size={13} /> {userLocation}
                  </div>
                </div>

                {/* Player 2 Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Player 2 (Match)
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "2px 0" }}>
                    {partnerCuteName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0f766e", fontSize: "12px", fontWeight: 600 }}>
                    <MapPin size={13} /> {partnerLocation}
                  </div>
                </div>
              </div>

              {/* Proximity / Distance Alert */}
              <div
                style={{
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  background: proximity.isViableForMeetup ? "#f0fdfa" : "#fdf2f8",
                  border: proximity.isViableForMeetup ? "1px solid #99f6e4" : "1px solid #fbcfe8",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: "20px" }}>
                  {proximity.isViableForMeetup ? "📍" : "✈️"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "13.5px", color: proximity.isViableForMeetup ? "#0f766e" : "#be185d" }}>
                      Distance Proximity: {proximity.label}
                    </strong>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        background: proximity.isViableForMeetup ? "rgba(13, 148, 136, 0.15)" : "rgba(219, 39, 119, 0.15)",
                        color: proximity.isViableForMeetup ? "#0f766e" : "#be185d",
                      }}
                    >
                      {proximity.approxDistance}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569", lineHeight: 1.45 }}>
                    {proximity.explanation}
                  </p>
                </div>
              </div>

              {/* Remote Warning if across countries */}
              {!proximity.isViableForMeetup && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "18px",
                    fontSize: "12px",
                    color: "#92400e",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={18} color="#d97706" />
                  <span>
                    Notice: One or both members are overseas (e.g. New Zealand vs Delhi). You can still preview and demo turf booking, but an in-person match is geographically impractical.
                  </span>
                </div>
              )}

              {/* Mutual Meeting Area Picker */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "8px" }}>
                  Decide where both of you want to play:
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    "Janakpuri",
                    "Gurgaon",
                    "Central / Aerocity",
                    "Noida",
                    "Palwal",
                  ].map((area) => (
                    <button
                      type="button"
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "10px",
                        border: selectedArea === area ? "2px solid #087f79" : "1px solid #cbd5e1",
                        background: selectedArea === area ? "rgba(8, 127, 121, 0.1)" : "#ffffff",
                        color: selectedArea === area ? "#0f766e" : "#475569",
                        fontWeight: selectedArea === area ? 750 : 500,
                        fontSize: "12.5px",
                        cursor: "pointer",
                      }}
                    >
                      🏟️ {area}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "#087f79",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  Browse Playable Turfs &amp; Courts <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 1: CHOOSE TURF COURT ──────── */}
          {step === 1 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                    Available Badminton Courts in {selectedArea}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Showing verified arenas with wooden / synthetic mats
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  style={{ background: "none", border: "none", color: "#087f79", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Change Area
                </button>
              </div>

              <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                {filteredTurfs.map((turf) => {
                  const isSelected = selectedTurf.id === turf.id;
                  return (
                    <div
                      key={turf.id}
                      onClick={() => setSelectedTurf(turf)}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        border: isSelected ? "2px solid #087f79" : "1px solid #e2e8f0",
                        background: isSelected ? "rgba(8, 127, 121, 0.04)" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div style={{ maxWidth: "460px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                            {turf.name}
                          </span>
                          <span
                            style={{
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "6px",
                            }}
                          >
                            ⭐ {turf.rating} ({turf.reviewsCount})
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                          📍 {turf.address}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          <span
                            style={{
                              background: "#e0f2fe",
                              color: "#0369a1",
                              fontSize: "11px",
                              fontWeight: 650,
                              padding: "2px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {turf.courtType} ({turf.courtsCount} courts)
                          </span>
                          {turf.amenities.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              style={{
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "6px",
                              }}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f766e" }}>
                          ₹{turf.pricePerHour} <span style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>/ hr</span>
                        </div>
                        <button
                          type="button"
                          style={{
                            marginTop: "6px",
                            background: isSelected ? "#087f79" : "#f1f5f9",
                            color: isSelected ? "white" : "#334155",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {isSelected ? "Selected ✓" : "Select Court"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    background: "#087f79",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  Proceed to Schedule Slot <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 2: TIME SLOT & VERIFICATION DETAILS ──────── */}
          {step === 2 && (
            <div>
              {/* Selected Turf Summary */}
              <div
                style={{
                  background: "#f0fdfa",
                  border: "1px solid #99f6e4",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  marginBottom: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "14px", color: "#0f766e" }}>{selectedTurf.name}</strong>
                  <div style={{ fontSize: "11.5px", color: "#475569" }}>
                    {selectedTurf.courtType} · ₹{selectedTurf.pricePerHour}/hr
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "#087f79", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  Change
                </button>
              </div>

              {/* Date selection */}
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                Select Match Date:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {["Today", "Tomorrow", "This Saturday", "This Sunday"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setMatchDate(d)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: matchDate === d ? "2px solid #087f79" : "1px solid #cbd5e1",
                      background: matchDate === d ? "rgba(8, 127, 121, 0.1)" : "#ffffff",
                      color: matchDate === d ? "#0f766e" : "#475569",
                      fontWeight: matchDate === d ? 750 : 500,
                      fontSize: "12.5px",
                      cursor: "pointer",
                    }}
                  >
                    📅 {d}
                  </button>
                ))}
              </div>

              {/* Time slot selection */}
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                Select 1-Hour Court Slot:
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "8px",
                  marginBottom: "18px",
                }}
              >
                {selectedTurf.slots.map((slot) => {
                  const isSel = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: isSel ? "2px solid #087f79" : "1px solid #cbd5e1",
                        background: isSel ? "rgba(8, 127, 121, 0.1)" : "#ffffff",
                        color: isSel ? "#0f766e" : "#334155",
                        fontWeight: isSel ? 750 : 500,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={13} color={isSel ? "#087f79" : "#64748b"} />
                        {slot}
                      </span>
                      {isSel && <Check size={14} color="#087f79" />}
                    </button>
                  );
                })}
              </div>

              {/* Phone number for Team Verification call */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                  Your Phone / WhatsApp Number <span>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="#087f79" style={{ position: "absolute", left: "12px", top: "13px" }} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98112 34567"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                    }}
                    required
                  />
                </div>
                <small style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Our team calls or messages to verify slot availability with the turf operator and confirms your reservation.
                </small>
              </div>

              {/* Equipment Rental Options */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "13px", color: "#1e293b" }}>Racket &amp; Feather Shuttle Rentals</strong>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Yonex Astrox / Nanoflare rackets ready at court counter (₹50 / racket)
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {[0, 1, 2].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setRacketsNeeded(count)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        border: racketsNeeded === count ? "2px solid #087f79" : "1px solid #cbd5e1",
                        background: racketsNeeded === count ? "#087f79" : "#ffffff",
                        color: racketsNeeded === count ? "white" : "#475569",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {count === 0 ? "None (Have Own)" : `${count} Rackets`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  style={{
                    background: "#087f79",
                    color: "white",
                    border: "none",
                    padding: "11px 24px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(8, 127, 121, 0.25)",
                  }}
                >
                  Submit &amp; Send to Verification Desk <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 3: TEAM VERIFICATION DESK & PASS ──────── */}
          {step === 3 && currentBooking && (
            <div>
              {/* Verification Progress Bar */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 750, color: "#0f766e", textTransform: "uppercase" }}>
                    Live Verification Status
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: verificationStage === "confirmed" ? "#dcfce7" : "#fef3c7",
                      color: verificationStage === "confirmed" ? "#15803d" : "#b45309",
                    }}
                  >
                    {verificationStage === "confirmed"
                      ? "✓ Verified & Court Reserved"
                      : "⏳ Verifying with Turf Team..."}
                  </span>
                </div>

                {/* 3 Step Indicator */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", fontSize: "11px" }}>
                  <div style={{ color: "#16a34a", fontWeight: 700 }}>
                    ✓ 1. Request Received
                  </div>
                  <div style={{ color: verificationStage === "confirmed" ? "#16a34a" : "#d97706", fontWeight: 700 }}>
                    {verificationStage === "confirmed" ? "✓" : "⏳"} 2. Team Operator Verification
                  </div>
                  <div style={{ color: verificationStage === "confirmed" ? "#16a34a" : "#94a3b8", fontWeight: 700 }}>
                    {verificationStage === "confirmed" ? "✓" : "○"} 3. Court Pass Generated
                  </div>
                </div>
              </div>

              {/* Authentic Badminton Match Pass Card */}
              <div
                style={{
                  background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                  color: "white",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 15px 30px rgba(15, 23, 42, 0.25)",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: "1px dashed rgba(255, 255, 255, 0.2)",
                    paddingBottom: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#2dd4bf", fontWeight: 750, textTransform: "uppercase" }}>
                      Badminton Official Match Pass
                    </span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800 }}>
                      {currentBooking.turfName}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      📍 {currentBooking.area} · {currentBooking.courtType}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>Ref ID</span>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#2dd4bf", fontFamily: "monospace" }}>
                      {currentBooking.bookingId}
                    </div>
                  </div>
                </div>

                {/* Match Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Players</span>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>
                      {userCuteName} vs {partnerCuteName}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Schedule</span>
                    <strong style={{ fontSize: "14px", color: "#ffffff" }}>
                      {currentBooking.date} · {currentBooking.timeSlot}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Assigned Court</span>
                    <strong style={{ fontSize: "14px", color: "#34d399" }}>
                      {currentBooking.courtNumber || "Court 2 (Air Conditioned)"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Entry Passcode</span>
                    <strong style={{ fontSize: "14px", color: "#facc15", fontFamily: "monospace" }}>
                      {currentBooking.passcode || "PASS-4921"}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "11.5px",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Show this digital pass at the counter upon arrival. Rackets will be ready.</span>
                  <button
                    type="button"
                    onClick={handleCopyPass}
                    style={{
                      background: "#087f79",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copiedPass ? <Check size={12} /> : <Copy size={12} />}
                    {copiedPass ? "Copied" : "Copy Pass"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "#087f79",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  Done &amp; Back to Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
