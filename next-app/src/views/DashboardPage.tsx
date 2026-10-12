"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Stethoscope,
  Tag,
  KeyRound,
  CalendarCheck,
  Clock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  LogIn,
  Loader2,
  Lock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useLiveOffers, type LiveOffer } from "@/lib/liveDataManager";
import { getStoredAppointments, type BookedAppointment } from "./HomePage";
import {
  getStoredAccountByEmail,
  saveStoredAccount,
  deterministicIdForEmail,
  isAdminEmail,
} from "@/lib/authAccounts";
import { isConfigured, getSupabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardPage() {
  const { identity, login, isLoggingIn, user } = useInternetIdentity();
  const profile = useLocalProfile();
  const { activeOffers } = useLiveOffers();

  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Password update state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setAppointments(getStoredAppointments());
    const handler = () => setAppointments(getStoredAppointments());
    window.addEventListener("wellness_appointments_sync", handler);
    return () => window.removeEventListener("wellness_appointments_sync", handler);
  }, []);

  function copyPromo(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Promo code "${code}" copied!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const normEmail = (user?.email || "alex@company.com").toLowerCase();
      const existing = getStoredAccountByEmail(normEmail);
      const uid = user?.id || existing?.id || deterministicIdForEmail(normEmail);

      saveStoredAccount({
        id: uid,
        email: normEmail,
        password: password.trim(),
        memberType: existing?.memberType || "professional",
        name: user?.user_metadata?.name || existing?.name || normEmail.split("@")[0],
        createdAt: user?.created_at || existing?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      if (isConfigured()) {
        const { error } = await getSupabase().auth.updateUser({ password: password.trim() });
        if (error) throw error;
      }

      toast.success("Password updated and saved successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user && !identity) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-card border border-border p-8 rounded-3xl shadow-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">
            Employee Wellness Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Please sign in with your corporate email address to view your booked doctor appointments, health allowances, and account details.
          </p>
          <Button
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
            asChild
          >
            <Link href="/signin">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Your Workspace
            </Link>
          </Button>
        </motion.div>
      </main>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Employee Member";
  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="container max-w-5xl mx-auto space-y-8">
        {/* ─── Profile & Account Header ─── */}
        <section className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent rounded-3xl p-6 sm:p-8 border border-emerald-500/25 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold text-xl shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    {displayName}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs font-semibold"
                  >
                    {isAdmin ? "Platform Administrator" : "Corporate Member"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
              >
                <Link href="/#doctors-section">
                  <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                  Book Doctor Consultation
                </Link>
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  asChild
                  className="rounded-xl border-emerald-500/40 text-emerald-800 hover:bg-emerald-500/10 text-xs font-semibold h-9"
                >
                  <Link href="/admin">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Admin Portal
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 pt-5 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-background/80 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground">My Consultations</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {appointments.length} Scheduled
              </p>
            </div>
            <div className="bg-background/80 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground">Available Corporate Perks</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">
                {activeOffers.length} Live Offers
              </p>
            </div>
            <div className="bg-background/80 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground">Authentication Status</p>
              <p className="text-lg font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Verified
              </p>
            </div>
          </div>
        </section>

        {/* ─── Dashboard Tabs Navigation ─── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="rounded-2xl bg-muted/60 p-1.5 flex gap-1 w-full max-w-md">
            <TabsTrigger
              value="appointments"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              My Appointments ({appointments.length})
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Perks &amp; Offers
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Security &amp; Password
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: APPOINTMENTS & CONSULTATIONS ─── */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Your Doctor Appointments
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upcoming and confirmed 1-on-1 confidential consultations
                </p>
              </div>
              <Button
                size="sm"
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
              >
                <Link href="/#doctors-section">
                  <Stethoscope className="w-3.5 h-3.5 mr-1" /> Book New Session
                </Link>
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card className="border-dashed border-2 border-border p-8 text-center rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  No appointments scheduled yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Browse our licensed therapists and psychologists to book your first confidential session covered under your company perks.
                </p>
                <Button
                  size="sm"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                >
                  <Link href="/#doctors-section">Explore Available Doctors</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => (
                  <Card key={appt.id} className="border-border shadow-xs hover:border-emerald-500/30 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
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
                            <p className="text-xs text-emerald-700 font-medium">{appt.doctorSpecialty}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          {appt.status}
                        </Badge>
                      </div>

                      <div className="p-2.5 bg-muted/40 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{appt.dateTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/50">
                          <span>Standard Fee: {appt.fee}</span>
                          {appt.offerCode && (
                            <span className="font-mono text-emerald-700 font-bold">
                              Code: {appt.offerCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-[11px] text-muted-foreground italic bg-background p-2 rounded-lg border border-border">
                          “{appt.notes}”
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── TAB 2: OFFERS & CORPORATE PERKS ─── */}
          <TabsContent value="offers" className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Corporate Wellbeing Perks &amp; Discounts
              </h3>
              <p className="text-xs text-muted-foreground">
                Exclusive wellness promo codes and subsidized session allowances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className="border-emerald-500/25 bg-gradient-to-br from-card to-emerald-500/5 shadow-xs"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-700 bg-emerald-500/10">
                        {offer.badge}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                        {offer.discount}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground">{offer.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg">
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
                        asChild
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8"
                      >
                        <Link href="/#doctors-section">
                          Use Code <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── TAB 3: ACCOUNT & PASSWORD SECURITY ─── */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Details Card */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Corporate Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Registered Corporate Email
                    </label>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Account Role
                    </label>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {isAdmin ? "Administrator" : "Employee Professional"}
                    </p>
                  </div>

                  {user?.id && (
                    <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                      <span className="truncate text-muted-foreground">
                        ID: {user.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(user.id);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold ml-2 flex-shrink-0"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Your session and stored credentials are kept securely in private storage.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Password Management Card */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    Update Account Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        New Password (min 8 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-input bg-background"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        {passwordError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold mt-1"
                    >
                      {savingPassword ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Save &amp; Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
