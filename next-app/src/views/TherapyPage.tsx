"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, stagger } from "@/lib/animations";
import { Stethoscope, UserCircle2, MessageCircleHeart } from "lucide-react";
import { toast } from "sonner";

export function TherapyPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const mockTherapists = [
    { id: "t1", name: "Dr. Sarah Jenkins", specialty: "Anxiety & Stress", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
    { id: "t2", name: "Dr. Amit Sharma", specialty: "Workplace Burnout", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
    { id: "t3", name: "Dr. Emily Chen", specialty: "Relationship Counseling", image: "https://images.unsplash.com/photo-1594824436951-7f12bc50616b?w=400&q=80" },
    { id: "t4", name: "Dr. Michael Ross", specialty: "Depression & Grief", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80" },
    { id: "t5", name: "Dr. Priya Desai", specialty: "Career Anxiety", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" },
  ];

  return (
    <div className="hub-page">
      <header className="page-heading">
        <span className="eyebrow">THERAPY & SUPPORT</span>
        <h1>Anonymous Support, Anytime.</h1>
        <p>
          Connect with certified therapists anonymously to talk through your stress, anxiety, or everyday struggles. Your identity remains completely private.
        </p>
        <div className="page-links">
          <Link href="/apply-provider" className="wellness-button" style={{ background: "var(--teal-600)", color: "white" }}>
            Register as a Therapist
          </Link>
        </div>
      </header>

      {activeChat ? (
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="chat-interface">
          <div className="chat-header" style={{ padding: "16px", borderBottom: "1px solid var(--sand-300)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Chatting with {activeChat}</h2>
            <button className="text-action" onClick={() => setActiveChat(null)}>End Chat</button>
          </div>
          <div className="chat-messages" style={{ height: "300px", padding: "16px", background: "var(--sand-50)", overflowY: "auto" }}>
            <p style={{ textAlign: "center", color: "var(--sand-600)", fontSize: "14px" }}>
              🔒 You are now connected anonymously. The therapist cannot see your name or profile.
            </p>
            <div style={{ marginTop: "16px", background: "white", padding: "12px", borderRadius: "8px", maxWidth: "80%" }}>
              <strong>{activeChat}</strong>
              <p>Hi there, I'm here to listen. What's on your mind today?</p>
            </div>
          </div>
          <div className="chat-input" style={{ padding: "16px", display: "flex", gap: "8px" }}>
            <input type="text" placeholder="Type a message..." style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--sand-300)" }} />
            <button className="wellness-button" onClick={() => toast.success("Message sent!")}>Send</button>
          </div>
        </motion.div>
      ) : (
        <motion.div className="booking-list" variants={stagger} initial="hidden" animate="show">
          {mockTherapists.map((t) => (
            <motion.div key={t.id} variants={fadeUp} className="provider-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid var(--sand-300)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <img src={t.image} alt={t.name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{t.name}</h2>
                  <span style={{ color: "var(--sand-600)", fontSize: "0.9rem" }}>{t.specialty}</span>
                </div>
              </div>
              <p style={{ marginBottom: "20px", color: "var(--sand-700)" }}>
                Available now for an anonymous chat. Talk about whatever is stressing you out.
              </p>
              <button 
                className="wellness-button" 
                style={{ width: "100%", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}
                onClick={() => setActiveChat(t.name)}
              >
                <MessageCircleHeart size={18} />
                Chat Anonymously
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
