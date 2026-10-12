"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Stethoscope,
  Tag,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Star,
  ArrowRight,
  Search,
  Calendar,
  X,
  User,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useLiveOffers,
  useLiveDoctors,
  type LiveDoctor,
  type LiveOffer,
} from "@/lib/liveDataManager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isAdminEmail } from "@/lib/authAccounts";

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

export function HomePage() {
  const profile = useLocalProfile();
  const { user } = useInternetIdentity();
  const { activeOffers } = useLiveOffers();
  const { activeDoctors } = useLiveDoctors();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedOfferCategory, setSelectedOfferCategory] = useState<string>("All");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState<LiveDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("Today, 5:00 PM");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [consultNotes, setConsultNotes] = useState("");
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);

  useEffect(() => {
    setAppointments(getStoredAppointments());
    const handler = () => setAppointments(getStoredAppointments());
    window.addEventListener("wellness_appointments_sync", handler);
    return () => window.removeEventListener("wellness_appointments_sync", handler);
  }, []);

  const filteredOffers = activeOffers.filter((o) => {
    if (selectedOfferCategory === "All") return true;
    return o.category === selectedOfferCategory || o.category === "All";
  });

  const filteredDoctors = activeDoctors.filter((d) => {
    if (!doctorSearch.trim()) return true;
    const q = doctorSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.bio.toLowerCase().includes(q)
    );
  });

  function copyPromo(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Promo code "${code}" copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  function handleStartBooking(doc: LiveDoctor, defaultCode?: string) {
    setBookingDoctor(doc);
    if (defaultCode) {
      setAppliedPromo(defaultCode);
    } else if (activeOffers.length > 0) {
      setAppliedPromo(activeOffers[0].code);
    }
  }

  function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingDoctor) return;

    const newAppt: BookedAppointment = {
      id: `appt-${Date.now()}`,
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      doctorSpecialty: bookingDoctor.specialty,
      doctorImage: bookingDoctor.image,
      dateTime: selectedDate,
      fee: bookingDoctor.fee,
      offerCode: appliedPromo || undefined,
      notes: consultNotes.trim() || undefined,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };

    saveAppointment(newAppt);
    toast.success(`Consultation booked with ${bookingDoctor.name} for ${selectedDate}!`);
    setBookingDoctor(null);
    setConsultNotes("");
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Team Member";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* ─── 1. Welcome & Status Banner ─── */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/25 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Corporate Wellness Portal
              </Badge>
              {user && isAdminEmail(user.email) && (
                <Link href="/admin">
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer">
                    <Shield className="w-3 h-3 mr-1" /> Admin Dashboard
                  </Badge>
                </Link>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Confidential mental health consultations, verified therapists, and active corporate wellbeing perks—all covered under your workplace plan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-2"
            >
              <a href="#doctors-section">
                <Stethoscope className="w-4 h-4" />
                Consult a Doctor
              </a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-xl border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <a href="#offers-section">
                <Tag className="w-4 h-4 mr-1.5 text-emerald-600" />
                View Active Offers ({activeOffers.length})
              </a>
            </Button>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="mt-6 pt-5 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="bg-background/80 rounded-xl p-3 border border-border shadow-2xs">
            <p className="text-xs text-muted-foreground">Certified Doctors</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{activeDoctors.length} Available</p>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border shadow-2xs">
            <p className="text-xs text-muted-foreground">Active Perks &amp; Offers</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{activeOffers.length} Live Perks</p>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border shadow-2xs">
            <p className="text-xs text-muted-foreground">Privacy Rating</p>
            <p className="text-lg font-bold text-foreground mt-0.5">100% Confidential</p>
          </div>
          <div className="bg-background/80 rounded-xl p-3 border border-border shadow-2xs">
            <p className="text-xs text-muted-foreground">My Appointments</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{appointments.length} Scheduled</p>
          </div>
        </div>
      </section>

      {/* ─── 2. My Booked Appointments (if any) ─── */}
      {appointments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                My Scheduled Consultations
              </h2>
              <p className="text-xs text-muted-foreground">
                Your upcoming confidential therapy &amp; medical check-ins
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-500/5">
              {appointments.length} Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <Card key={appt.id} className="border-border shadow-xs hover:border-emerald-500/40 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <Image
                        src={appt.doctorImage}
                        alt={appt.doctorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{appt.doctorName}</h4>
                      <p className="text-xs text-muted-foreground">{appt.doctorSpecialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-emerald-700 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.dateTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className="bg-emerald-600 text-white text-[11px]">
                      Confirmed
                    </Badge>
                    {appt.offerCode && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Code: {appt.offerCode}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── 3. Active Offers & Promotional Perks ─── */}
      <section id="offers-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Corporate Offers &amp; Discounts
            </h2>
            <p className="text-xs text-muted-foreground">
              Promotional codes and subsidized health allowances managed directly for your organization
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["All", "Therapy", "Corporate", "Activities", "Student"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedOfferCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  selectedOfferCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredOffers.map((offer) => (
            <Card
              key={offer.id}
              className="border-emerald-500/25 bg-gradient-to-b from-card to-emerald-500/5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-700 bg-emerald-500/10">
                    {offer.badge}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {offer.discount}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{offer.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded-lg">
                    <code className="text-xs font-mono font-bold text-emerald-800">
                      {offer.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyPromo(offer.code)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Copy code"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (activeDoctors.length > 0) {
                        handleStartBooking(activeDoctors[0], offer.code);
                      } else {
                        copyPromo(offer.code);
                      }
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/10 h-8 px-2 font-bold"
                  >
                    Redeem <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 4. Certified Doctors & Therapists Directory ─── */}
      <section id="doctors-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              Certified Doctors &amp; Psychologists
            </h2>
            <p className="text-xs text-muted-foreground">
              Book confidential 1-on-1 counseling with licensed medical professionals
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, specialty, bio…"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-background shadow-2xs focus:outline-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <Card
              key={doc.id}
              className="border-border hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border shadow-xs">
                    <Image
                      src={doc.image}
                      alt={doc.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-foreground truncate">{doc.name}</h3>
                    </div>
                    <p className="text-xs font-medium text-emerald-700 mt-0.5">{doc.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{doc.experience}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-muted/40 p-3 rounded-xl border border-border/60">
                  <p className="text-xs font-semibold text-foreground">
                    Specialty: <span className="text-emerald-700">{doc.specialty}</span>
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Consultation Fee
                    </span>
                    <span className="text-xs font-bold text-foreground">{doc.fee}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        doc.availability === "Available Now"
                          ? "border-emerald-500/40 text-emerald-700 bg-emerald-500/10"
                          : "border-amber-500/40 text-amber-700 bg-amber-500/10"
                      }`}
                    >
                      {doc.availability}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleStartBooking(doc)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium h-8 px-3 shadow-xs"
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 5. Fast Doctor Booking Modal ─── */}
      <AnimatePresence>
        {bookingDoctor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setBookingDoctor(null)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-border">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                  <Image
                    src={bookingDoctor.image}
                    alt={bookingDoctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{bookingDoctor.name}</h3>
                  <p className="text-xs text-emerald-700 font-medium">{bookingDoctor.specialty}</p>
                  <p className="text-xs text-muted-foreground">Standard Fee: {bookingDoctor.fee}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Select Consultation Slot
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background"
                  >
                    <option value="Today, 5:00 PM">Today, 5:00 PM (Instant Slot)</option>
                    <option value="Today, 7:00 PM">Today, 7:00 PM</option>
                    <option value="Tomorrow, 10:00 AM">Tomorrow, 10:00 AM</option>
                    <option value="Tomorrow, 4:00 PM">Tomorrow, 4:00 PM</option>
                    <option value="This Weekend, 11:00 AM">This Weekend, 11:00 AM</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Apply Corporate Perk / Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. STRESSFREE50"
                      value={appliedPromo}
                      onChange={(e) => setAppliedPromo(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-input bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (appliedPromo) {
                          toast.success(`Promo code ${appliedPromo} applied to this booking!`);
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/20"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Confidential Notes / Concern (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you'd like to discuss (stress, burnout, anxiety, etc.)"
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background resize-none"
                  />
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-700" />
                  <span>100% confidential. No medical records are shared with your employer.</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setBookingDoctor(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4"
                  >
                    Confirm &amp; Book Appointment
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
