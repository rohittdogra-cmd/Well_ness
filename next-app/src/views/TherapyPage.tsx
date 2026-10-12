"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/lib/animations";
import {
  Stethoscope,
  UserCircle2,
  MessageCircleHeart,
  Tag,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useLiveDoctors, useLiveOffers, type LiveDoctor } from "@/lib/liveDataManager";

export function TherapyPage() {
  const [activeChat, setActiveChat] = useState<LiveDoctor | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<LiveDoctor | null>(null);
  const [bookingTime, setBookingTime] = useState("Today, 5:00 PM");
  const [notes, setNotes] = useState("");

  const { activeDoctors } = useLiveDoctors();
  const { activeOffers } = useLiveOffers();

  const therapyOffers = activeOffers.filter(
    (o) => o.category === "Therapy" || o.category === "Corporate" || o.category === "All",
  );

  function copyPromo(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Promo code ${code} copied!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  function handleBook(doc: LiveDoctor) {
    setBookingDoctor(doc);
  }

  function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingDoctor) return;
    toast.success(
      `Appointment booked with ${bookingDoctor.name} for ${bookingTime}! Your session link is saved to your profile.`,
    );
    setBookingDoctor(null);
  }

  return (
    <div className="hub-page">
      <header className="page-heading">
        <span className="eyebrow">THERAPY &amp; SUPPORT</span>
        <h1>Anonymous Support, Anytime.</h1>
        <p>
          Connect with certified therapists and psychologists anonymously to talk through your stress, anxiety, or everyday struggles. Your identity remains 100% private.
        </p>
        <div className="page-links" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/apply-provider"
            className="wellness-button"
            style={{ background: "var(--teal-600)", color: "white" }}
          >
            Register as a Therapist
          </Link>
          <Link
            href="/book-activities"
            className="wellness-button"
            style={{ background: "white", color: "var(--teal-700)", border: "1px solid var(--teal-300)" }}
          >
            Explore Wellness Activities
          </Link>
        </div>
      </header>

      {/* Live Special Offers & Corporate Wellness Perks */}
      {therapyOffers.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            marginBottom: "32px",
            background: "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(13, 148, 136, 0.04) 100%)",
            border: "1px solid rgba(20, 184, 166, 0.25)",
            borderRadius: "16px",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Sparkles size={18} style={{ color: "var(--teal-600)" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#112d3d" }}>
              Active Perks &amp; Corporate Offers
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                background: "var(--teal-600)",
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px",
                marginLeft: "auto",
              }}
            >
              LIVE DEALS
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {therapyOffers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: "white",
                  border: "1px solid rgba(20, 184, 166, 0.2)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--teal-700)",
                        background: "rgba(20, 184, 166, 0.12)",
                        padding: "2px 6px",
                        borderRadius: "6px",
                      }}
                    >
                      {offer.discount}
                    </span>
                    <span style={{ fontSize: "10px", color: "#6a7d88", fontWeight: 500 }}>
                      {offer.badge}
                    </span>
                  </div>
                  <h4 style={{ margin: "8px 0 4px", fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
                    {offer.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#4b5563", lineHeight: 1.4 }}>
                    {offer.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "8px",
                    borderTop: "1px dashed #e5e7eb",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "var(--teal-800)",
                      fontSize: "12px",
                      background: "rgba(20, 184, 166, 0.08)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {offer.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyPromo(offer.code)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--teal-700)",
                    }}
                  >
                    {copiedCode === offer.code ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode === offer.code ? "Copied" : "Copy Code"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Chat Interface */}
      {activeChat ? (
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="chat-interface">
          <div
            className="chat-header"
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--sand-300)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "white",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src={activeChat.image}
                alt={activeChat.name}
                style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{activeChat.name}</h2>
                <span style={{ fontSize: "12px", color: "var(--sand-600)" }}>{activeChat.specialty}</span>
              </div>
            </div>
            <button className="text-action" onClick={() => setActiveChat(null)}>
              End Anonymous Chat
            </button>
          </div>
          <div
            className="chat-messages"
            style={{ height: "320px", padding: "20px", background: "var(--sand-50)", overflowY: "auto" }}
          >
            <div
              style={{
                textAlign: "center",
                color: "var(--sand-600)",
                fontSize: "13px",
                background: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                display: "inline-block",
                margin: "0 auto 16px",
                border: "1px solid var(--sand-300)",
              }}
            >
              🔒 End-to-end Anonymous. The therapist cannot see your corporate ID or identity.
            </div>
            <div
              style={{
                marginTop: "12px",
                background: "white",
                padding: "14px 18px",
                borderRadius: "12px",
                maxWidth: "80%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
              }}
            >
              <strong style={{ display: "block", marginBottom: "4px", color: "var(--teal-700)" }}>
                {activeChat.name}
              </strong>
              <p style={{ margin: 0, color: "#374151", fontSize: "14px", lineHeight: 1.5 }}>
                Hi there, welcome to our private room. I am here with zero judgment. Feel free to share what has been on your mind lately.
              </p>
            </div>
          </div>
          <div
            className="chat-input"
            style={{ padding: "16px", display: "flex", gap: "8px", background: "white", borderRadius: "0 0 12px 12px" }}
          >
            <input
              type="text"
              placeholder="Type your confidential thoughts..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--sand-300)" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  toast.success("Message sent securely!");
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <button
              className="wellness-button"
              onClick={() => toast.success("Message sent securely!")}
            >
              Send Securely
            </button>
          </div>
        </motion.div>
      ) : (
        /* Doctor / Psychologist Directory */
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
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--teal-500)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{doc.name}</h2>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: doc.availability === "Available Now" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: doc.availability === "Available Now" ? "#065f46" : "#92400e",
                        }}
                      >
                        {doc.availability}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", color: "var(--teal-700)", fontWeight: 600, fontSize: "0.88rem" }}>
                      {doc.title || doc.specialty}
                    </p>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "12px", color: "var(--sand-600)" }}>
                      <span>{doc.rating}</span>
                      <span>·</span>
                      <span>{doc.experience}</span>
                    </div>
                  </div>
                </div>

                <p style={{ marginBottom: "16px", color: "var(--sand-700)", fontSize: "13px", lineHeight: 1.5 }}>
                  {doc.bio || "Available for an anonymous and confidential session. Talk about burnout, anxiety, or everyday challenges."}
                </p>

                <div
                  style={{
                    background: "var(--sand-50)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                    fontSize: "12px",
                  }}
                >
                  <span style={{ color: "#4b5563" }}>Consultation Fee:</span>
                  <strong style={{ color: "var(--teal-800)" }}>{doc.fee}</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  className="wellness-button"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "10px",
                  }}
                  onClick={() => setActiveChat(doc)}
                >
                  <MessageCircleHeart size={16} />
                  Chat Now
                </button>
                <button
                  className="wellness-button"
                  style={{
                    background: "white",
                    color: "var(--teal-700)",
                    border: "1px solid var(--teal-300)",
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "10px",
                  }}
                  onClick={() => handleBook(doc)}
                >
                  <CalendarCheck size={16} />
                  Book Slot
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
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
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "#112d3d" }}>
              Schedule Session with {bookingDoctor.name}
            </h2>
            <p style={{ fontSize: "13px", color: "#6a7d88", marginBottom: "16px" }}>
              Choose your preferred consultation slot. Corporate wellness discount or promo codes apply automatically.
            </p>

            <form onSubmit={confirmBooking}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                  Select Date &amp; Time
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                  }}
                >
                  <option value="Today, 5:00 PM">Today at 5:00 PM</option>
                  <option value="Today, 7:00 PM">Today at 7:00 PM</option>
                  <option value="Tomorrow, 10:00 AM">Tomorrow at 10:00 AM</option>
                  <option value="Tomorrow, 2:30 PM">Tomorrow at 2:30 PM</option>
                  <option value="Tomorrow, 6:00 PM">Tomorrow at 6:00 PM</option>
                  <option value="Saturday, 11:00 AM">Saturday at 11:00 AM</option>
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                  Notes / Focus Area (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Workplace anxiety, sleep problems, relationship stress..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div
                style={{
                  background: "rgba(20, 184, 166, 0.08)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span>Estimated Fee:</span>
                <strong>{bookingDoctor.fee}</strong>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="wellness-button"
                  style={{ background: "#f3f4f6", color: "#374151" }}
                  onClick={() => setBookingDoctor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="wellness-button">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
