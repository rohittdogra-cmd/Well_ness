"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Crisis keyword detection for user-generated content.
 *
 * When a user types or posts content containing acute distress signals,
 * this component renders an unblockable emergency overlay with direct
 * helpline access. Required under Mental Healthcare Act 2017 and
 * Tele-MANAS guidelines for digital mental health services.
 */

const CRISIS_KEYWORDS = [
  "want to die",
  "kill myself",
  "end my life",
  "suicide",
  "suicidal",
  "self harm",
  "self-harm",
  "overdose",
  "no reason to live",
  "better off dead",
  "can't go on",
  "don't want to live",
  "ending it all",
  "hurting myself",
  "cutting myself",
];

/**
 * Checks text for crisis signals. Case-insensitive.
 */
export function detectCrisisSignals(text: string): boolean {
  if (!text || text.length < 4) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Hook that monitors text for crisis keywords and manages overlay state.
 */
export function useCrisisDetection() {
  const [showOverlay, setShowOverlay] = useState(false);

  const checkText = useCallback((text: string) => {
    if (detectCrisisSignals(text)) {
      setShowOverlay(true);
    }
  }, []);

  const dismissOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  return { showOverlay, checkText, dismissOverlay };
}

/**
 * Full-screen emergency overlay with helpline numbers.
 * Renders when crisis signals are detected in user input.
 */
export function CrisisOverlay({
  show,
  onDismiss,
}: {
  show: boolean;
  onDismiss: () => void;
}) {
  // Prevent scroll when overlay is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="You are not alone. Help is available."
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        padding: "20px",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "520px",
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 24px",
          }}
        >
          <span style={{ fontSize: "36px" }}>❤️</span>
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#1e293b",
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}
        >
          You are not alone.
        </h2>

        <p
          style={{
            fontSize: "15px",
            color: "#475569",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          It sounds like you may be going through something really tough right now.
          Please reach out to a trained crisis counsellor — they are available
          24/7, free of charge, and completely confidential.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <a
            href="tel:14416"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "18px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.35)",
            }}
          >
            📞 Tele-MANAS: 14416
          </a>

          <a
            href="tel:18005990019"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "18px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
            }}
          >
            📞 KIRAN: 1800-599-0019
          </a>

          <a
            href="tel:112"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px 24px",
              borderRadius: "14px",
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              border: "1.5px solid #fca5a5",
            }}
          >
            🚨 Emergency: 112
          </a>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            lineHeight: 1.5,
            margin: "0 0 20px",
          }}
        >
          Tele-MANAS and KIRAN are Government of India mental health helplines.
          They are free, confidential, and available 24 hours a day, 7 days a
          week. Your employer cannot see this.
        </p>

        <button
          onClick={onDismiss}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          I understand, close this
        </button>
      </div>
    </div>
  );
}
