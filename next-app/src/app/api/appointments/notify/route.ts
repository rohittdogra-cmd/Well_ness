import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/appointments/notify
 *
 * Receives newly-booked appointment data and dispatches
 * a notification email to the StressUnwind care coordination
 * desk so the team can call the patient to verify attendance.
 *
 * In production this would use a real SMTP relay (Resend, SendGrid, etc.).
 * For now we log the notification and return success so the frontend
 * flow works end-to-end.
 */

interface NotifyPayload {
  bookingRef: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorFee: string;
  doctorCabinLocation: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  slot: string;
  mode: string;
  notes?: string;
}

const TEAM_EMAIL = "connect.stressunwind@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body: NotifyPayload = await req.json();

    // ── Validate required fields ────────────────────────────────
    if (!body.bookingRef || !body.patientName || !body.patientPhone || !body.doctorName) {
      return NextResponse.json(
        { ok: false, error: "Missing required booking fields." },
        { status: 400 },
      );
    }

    // ── Build the notification email body ────────────────────────
    const emailSubject = `🔔 New Appointment Booking – ${body.bookingRef} | ${body.patientName}`;
    const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NEW APPOINTMENT BOOKING ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference : ${body.bookingRef}
Patient Name      : ${body.patientName}
Patient Phone     : ${body.patientPhone}
Patient Email     : ${body.patientEmail || "Not provided"}

Doctor            : ${body.doctorName}
Specialty         : ${body.doctorSpecialty || "General"}
Consultation Fee  : ${body.doctorFee}
Cabin / Location  : ${body.doctorCabinLocation}

Slot              : ${body.slot}
Mode              : ${body.mode}
Notes             : ${body.notes || "None"}

──────────────────────────────────
ACTION REQUIRED:
Call the patient at ${body.patientPhone} to verify attendance.
Ask: "Are you coming for the therapy session at ${body.slot}?"
Once verified, mark status as "Verified & Confirmed" in the admin dashboard.
──────────────────────────────────

Payment: ₹0 upfront. Patient pays ${body.doctorFee} at doctor's cabin
via Cash / UPI / Card on arrival.

— StressUnwind Care Coordination System
    `.trim();

    // ── Log notification (dev mode) ─────────────────────────────
    console.log("═══════════════════════════════════════════════════");
    console.log(`📧 NOTIFICATION → ${TEAM_EMAIL}`);
    console.log(`📋 SUBJECT: ${emailSubject}`);
    console.log(emailBody);
    console.log("═══════════════════════════════════════════════════");

    // ── Production: Replace with actual email dispatch ───────────
    // Example with Resend:
    // await resend.emails.send({
    //   from: "StressUnwind <noreply@stressunwind.com>",
    //   to: TEAM_EMAIL,
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    return NextResponse.json({
      ok: true,
      message: "Notification dispatched to care coordination team.",
      ref: body.bookingRef,
      dispatchedTo: TEAM_EMAIL,
    });
  } catch (err) {
    console.error("Appointment notification error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to dispatch notification." },
      { status: 500 },
    );
  }
}
