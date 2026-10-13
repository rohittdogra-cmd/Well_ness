"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/lib/animations";
import {
  UserCircle2,
  Clock,
  Star,
  Phone,
  CreditCard,
  CheckCircle2,
  X,
  Building2,
  ShieldCheck,
  CalendarCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLiveDoctors,
  useLiveAppointments,
  type LiveDoctor,
  type LiveAppointment,
} from "@/lib/liveDataManager";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLocalProfile } from "@/hooks/useLocalProfile";

export function PsychologistsPage() {
  const { user } = useInternetIdentity();
  const localProfile = useLocalProfile();
  const { appointments, bookAppointment, cancelAppointment } = useLiveAppointments();
  const { activeDoctors } = useLiveDoctors();

  const [bookingDoctor, setBookingDoctor] = useState<LiveDoctor | null>(null);
  const [bookingTime, setBookingTime] = useState("Today, 5:00 PM");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [consultationMode, setConsultationMode] = useState<
    "In-Clinic (Doctor's Cabin)" | "Confidential Online Video"
  >("In-Clinic (Doctor's Cabin)");
  const [notes, setNotes] = useState("");
  const [confirmedPass, setConfirmedPass] = useState<LiveAppointment | null>(null);

  function handleBook(doc: LiveDoctor) {
    setBookingDoctor(doc);
    if (!patientName) {
      setPatientName(localProfile?.name || user?.user_metadata?.name || "");
    }
    if (!patientEmail) {
      setPatientEmail(user?.email || "");
    }
  }

  function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingDoctor) return;

    if (!patientName.trim()) {
      toast.error("Please enter your name for the appointment.");
      return;
    }

    const cleanPhone = patientPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number so our team can call to verify.");
      return;
    }

    const newApt = bookAppointment({
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      doctorSpecialty: bookingDoctor.specialty,
      doctorFee: bookingDoctor.fee,
      doctorCabinLocation: "Cyber City Wellness Hub, Suite 402, DLF Phase 2, Gurgaon",
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || undefined,
      slot: bookingTime,
      mode: consultationMode,
      notes: notes.trim(),
    });

    setConfirmedPass(newApt);
    setBookingDoctor(null);
    toast.success(
      `Appointment requested! Our care coordinator will call ${patientPhone} to verify your session.`,
    );
  }

  return (
    <div className="hub-page">
      <header className="page-heading">
        <span className="eyebrow">MAKE SPACE TO TALK</span>
        <h1>Support, on your terms.</h1>
        <p>
          Browse our certified psychologists and book a confidential 1-on-1 session.
          Your identity stays 100% private — no advance payment required.
        </p>
        <div className="page-links" style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap", marginTop: "24px" }}>
          <Link
            href="/therapy"
            className="wellness-button"
            style={{
              background: "var(--teal-600, #0d9488)",
              color: "#ffffff",
              border: "1px solid var(--teal-600, #0d9488)",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 24px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.25)",
              textDecoration: "none",
            }}
          >
            Therapy & Chat Sessions
          </Link>
          <Link
            href="/apply-provider"
            className="wellness-button"
            style={{
              background: "#ffffff",
              color: "var(--teal-700, #0f766e)",
              border: "1.5px solid var(--teal-600, #0d9488)",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 24px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              textDecoration: "none",
            }}
          >
            Apply as a Provider
          </Link>
        </div>
      </header>

      {/* Your Booked Appointments & Verification Status */}
      {appointments.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            marginBottom: "32px",
            background: "#ffffff",
            border: "1.5px solid #0d9488",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(13, 148, 136, 0.12)",
                  color: "#0d9488",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarCheck size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#132e2b" }}>
                  Your Booked Appointments &amp; Status
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Live verification tracking · Payment at Doctor&apos;s Cabin upon arrival
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 650,
                color: "#0d9488",
                background: "rgba(13, 148, 136, 0.1)",
                padding: "4px 10px",
                borderRadius: "20px",
              }}
            >
              {appointments.length} Active {appointments.length === 1 ? "Booking" : "Bookings"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
            {appointments.map((apt) => {
              const isPending = apt.status === "Pending Phone Verification";
              const isConfirmed = apt.status === "Verified & Confirmed";
              return (
                <div
                  key={apt.id}
                  style={{
                    background: isPending ? "linear-gradient(145deg, #fffbeb 0%, #ffffff 100%)" : "linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)",
                    border: isPending ? "1.5px solid #fde68a" : "1.5px solid #bbf7d0",
                    borderRadius: "14px",
                    padding: "16px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#64748b",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {apt.bookingRef}
                      </span>
                      <strong style={{ fontSize: "15px", color: "#0f172a" }}>{apt.doctorName}</strong>
                      <div style={{ fontSize: "12px", color: "#0d9488", fontWeight: 600 }}>{apt.doctorSpecialty}</div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: isPending ? "#fef3c7" : isConfirmed ? "#dcfce7" : "#f1f5f9",
                        color: isPending ? "#b45309" : isConfirmed ? "#15803d" : "#475569",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {isPending ? <Phone size={12} /> : <CheckCircle2 size={12} />}
                      {apt.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: "#475569", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} color="#0d9488" />
                      <span><strong>Slot:</strong> {apt.slot} ({apt.mode})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Building2 size={13} color="#0d9488" />
                      <span><strong>Cabin:</strong> {apt.doctorCabinLocation}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CreditCard size={13} color="#0d9488" />
                      <span><strong>Payment:</strong> Pay {apt.doctorFee} at Doctor&apos;s Cabin</span>
                    </div>
                  </div>

                  {isPending && (
                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.12)",
                        border: "1px dashed rgba(245, 158, 11, 0.4)",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "12px",
                        color: "#92400e",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      <Phone size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span>
                        Our backend coordinator will call <strong>{apt.patientPhone}</strong> shortly to verify: <em>&quot;Are you coming for the therapy?&quot;</em>
                      </span>
                    </div>
                  )}

                  {isConfirmed && (
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "12px",
                        color: "#065f46",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      <CheckCircle2 size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span>
                        Confirmed! Verified by {apt.verifiedBy || "Care Coordinator"}. Please show reference <strong>{apt.bookingRef}</strong> at the clinic desk.
                      </span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => {
                        cancelAppointment(apt.id, "Cancelled by user");
                        toast.info("Appointment cancelled.");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        fontSize: "11px",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Cancel booking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Psychologist / Provider Directory */}
      <motion.div className="booking-list" variants={stagger} initial="hidden" animate="show">
        {activeDoctors.map((doc) => (
          <motion.div
            key={doc.id}
            variants={fadeUp}
            className="provider-card"
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid var(--sand-300)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                <img
                  src={doc.image}
                  alt={doc.name}
                  style={{ width: "64px", height: "64px", borderRadius: "16px", objectFit: "cover", border: "2px solid var(--teal-600)" }}
                />
                <div>
                  <span className="eyebrow" style={{ fontSize: "11px", color: "var(--teal-700)", fontWeight: 700, letterSpacing: "0.5px" }}>
                    VERIFIED PSYCHOLOGIST
                  </span>
                  <h2 style={{ fontSize: "1.15rem", margin: "4px 0 2px", fontWeight: 700, color: "#112d3d" }}>
                    {doc.name}
                  </h2>
                  <div style={{ fontSize: "12.5px", color: "var(--teal-700)", fontWeight: 600 }}>
                    {doc.title}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "13.5px", lineHeight: "1.55", color: "#475569", margin: "0 0 14px" }}>
                {doc.bio}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "12.5px",
                  color: "#475569",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Star size={14} color="#f59e0b" />
                  <span>{doc.rating}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} color="var(--teal-600)" />
                  <span>{doc.experience}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={14} color="var(--teal-600)" />
                  <span>{doc.specialty}</span>
                </div>
                {doc.languages && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={14} color="#6b7280" />
                    <span>{doc.languages}</span>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "14px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{doc.fee}</div>
                <div
                  style={{
                    fontSize: "11px",
                    color: doc.availability === "Available Now" ? "#059669" : "#b45309",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: doc.availability === "Available Now" ? "#10b981" : "#f59e0b",
                      display: "inline-block",
                    }}
                  />
                  {doc.availability}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleBook(doc)}
                className="wellness-button"
                style={{
                  background: "var(--teal-600, #0d9488)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontWeight: 650,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(13, 148, 136, 0.2)",
                }}
              >
                Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Unified Booking Modal ──────────────────────────────── */}
      {bookingDoctor && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setBookingDoctor(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              maxWidth: "520px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <img
                  src={bookingDoctor.image}
                  alt={bookingDoctor.name}
                  style={{ width: "52px", height: "52px", borderRadius: "14px", objectFit: "cover", border: "2px solid #0d9488" }}
                />
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 2px", color: "#112d3d" }}>
                    Book Appointment: {bookingDoctor.name}
                  </h2>
                  <div style={{ fontSize: "12px", color: "#0d9488", fontWeight: 600 }}>
                    {bookingDoctor.title || bookingDoctor.specialty}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingDoctor(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Payment & Verification Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(13, 148, 136, 0.09) 0%, rgba(16, 185, 129, 0.06) 100%)",
                border: "1px solid rgba(13, 148, 136, 0.25)",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f766e", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CreditCard size={15} /> Payment Mode: Pay at Doctor&apos;s Cabin
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "12px" }}>
                  ₹0 UPFRONT ONLINE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.45 }}>
                No advance card payment required online. You pay directly at the doctor&apos;s reception/cabin via Cash, UPI, or Card upon your arrival.
              </p>
            </div>

            <form onSubmit={confirmBooking}>
              {/* Patient Name */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}>
                  Full Name <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Patient Phone Number (Mandatory for Verification) */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 650, color: "#334155" }}>
                    Mobile Number (For Verification Call) <span style={{ color: "#e11d48" }}>*</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: 600 }}>We will call this number</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 650,
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="98112 34567 (10 digits)"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Our care coordinator will call to confirm: <em>&quot;Are you coming for the therapy session?&quot;</em>
                </span>
              </div>

              {/* Consultation Mode */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "6px" }}>
                  Consultation Mode
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setConsultationMode("In-Clinic (Doctor's Cabin)")}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid",
                      borderColor: consultationMode === "In-Clinic (Doctor's Cabin)" ? "#0d9488" : "#e2e8f0",
                      background: consultationMode === "In-Clinic (Doctor's Cabin)" ? "rgba(13, 148, 136, 0.08)" : "#fff",
                      color: consultationMode === "In-Clinic (Doctor's Cabin)" ? "#0f766e" : "#475569",
                      fontSize: "12.5px",
                      fontWeight: 650,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Building2 size={15} /> In-Clinic Cabin Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationMode("Confidential Online Video")}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid",
                      borderColor: consultationMode === "Confidential Online Video" ? "#0d9488" : "#e2e8f0",
                      background: consultationMode === "Confidential Online Video" ? "rgba(13, 148, 136, 0.08)" : "#fff",
                      color: consultationMode === "Confidential Online Video" ? "#0f766e" : "#475569",
                      fontSize: "12.5px",
                      fontWeight: 650,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ShieldCheck size={15} /> Confidential Video
                  </button>
                </div>
              </div>

              {/* Slot Option */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "5px" }}>
                  Select Slot Option
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    background: "#fff",
                  }}
                >
                  <option value="Today, 5:00 PM">Today at 5:00 PM (Evening)</option>
                  <option value="Today, 7:00 PM">Today at 7:00 PM (After Work)</option>
                  <option value="Tomorrow, 10:00 AM">Tomorrow at 10:00 AM (Morning)</option>
                  <option value="Tomorrow, 2:30 PM">Tomorrow at 2:30 PM (Afternoon)</option>
                  <option value="Tomorrow, 6:00 PM">Tomorrow at 6:00 PM (Evening)</option>
                  <option value="Saturday, 11:00 AM">Saturday at 11:00 AM (Weekend)</option>
                </select>
              </div>

              {/* Notes / Concerns */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 650, color: "#334155", marginBottom: "4px" }}>
                  Primary Concern / Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Workplace burnout, anxiety before appraisal, relationship stress..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Fee Summary */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Consultation Fee
                  </div>
                  <div style={{ fontSize: "12px", color: "#0f766e", fontWeight: 600 }}>
                    Pay at Doctor&apos;s Cabin upon arrival
                  </div>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  {bookingDoctor.fee}
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => setBookingDoctor(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#0d9488",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 22px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                  }}
                >
                  Request Verification &amp; Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Confirmation & Verification Pass Modal ──────────────── */}
      {confirmedPass && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmedPass(null);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              maxWidth: "500px",
              width: "100%",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <span
              style={{
                fontSize: "11.5px",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#0d9488",
                background: "rgba(13, 148, 136, 0.1)",
                padding: "3px 10px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "8px",
              }}
            >
              REF #{confirmedPass.bookingRef}
            </span>

            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
              Appointment Booked!
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px" }}>
              Our care coordinator is processing your session with Dr. {confirmedPass.doctorName}.
            </p>

            {/* Phone Verification Notice */}
            <div
              style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: "14px",
                padding: "14px 16px",
                textAlign: "left",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b45309", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                <Phone size={15} /> Step 1: Verification Call Queued
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#78350f", lineHeight: 1.5 }}>
                Our team will call you on <strong>{confirmedPass.patientPhone}</strong> within 15–30 minutes to verify your availability: <em>&quot;Are you coming for the therapy session?&quot;</em> Once verified, your slot is locked in.
              </p>
            </div>

            {/* Cabin & Payment Details */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "14px 16px",
                textAlign: "left",
                marginBottom: "22px",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Doctor:</span>
                <strong>Dr. {confirmedPass.doctorName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Slot &amp; Mode:</span>
                <strong>{confirmedPass.slot} ({confirmedPass.mode})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Cabin Address:</span>
                <span style={{ fontWeight: 600, color: "#334155", textAlign: "right" }}>{confirmedPass.doctorCabinLocation}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px dashed #cbd5e1" }}>
                <span style={{ color: "#0f766e", fontWeight: 650 }}>Payment Mode:</span>
                <strong style={{ color: "#0f766e" }}>Pay {confirmedPass.doctorFee} at Cabin</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConfirmedPass(null)}
              style={{
                width: "100%",
                background: "#0d9488",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(13, 148, 136, 0.3)",
              }}
            >
              Understood, I&apos;ll Expect the Verification Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
