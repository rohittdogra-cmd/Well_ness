export interface BookedAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  dateTime: string;
  fee: string;
  offerCode?: string;
  status: "Confirmed" | "Completed";
  notes?: string;
  createdAt: string;
}

const APPOINTMENTS_KEY = "wellness_user_appointments";

export function getStoredAppointments(): BookedAppointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAppointment(appt: BookedAppointment): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredAppointments();
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([appt, ...existing]));
    window.dispatchEvent(new Event("wellness_appointments_sync"));
  } catch (e) {
    console.error(e);
  }
}
