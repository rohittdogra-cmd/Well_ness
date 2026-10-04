"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Stethoscope, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProviderType } from "../backend.types";
import { useActor } from "../hooks/useActor";

const BENEFITS = [
  {
    icon: Zap,
    title: "Instant Visibility",
    description:
      "Get discovered by thousands of corporate employees actively seeking wellness support.",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: Trophy,
    title: "Verified Badge",
    description:
      "Our admin review ensures only credible providers are listed — boosting trust and bookings.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: CheckCircle2,
    title: "Seamless Booking",
    description:
      "Employees can book sessions directly through the platform — no scheduling back-and-forth.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
];

export function ApplyProviderPage() {
  const { actor } = useActor();
  const [providerType, setProviderType] = useState<ProviderType>(
    ProviderType.psychologist,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!actor) {
      toast.error("Unable to connect to the platform. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      await actor.submitProviderApplication(
        providerType,
        name.trim(),
        description.trim(),
      );
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-background pt-24 pb-16 px-4"
      data-ocid="apply_provider.page"
    >
      <div className="container max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            For Professionals & Organizations
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Join the Wellness Network
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you’re a licensed psychologist or a sports & fitness
            company, apply to partner with the Corporate Wellness Hub and reach
            employees who need your expertise.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${b.bg}`}
                  >
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {b.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Form or Success */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-xl mx-auto"
        >
          {submitted ? (
            <Card>
              <CardContent
                className="p-10 text-center"
                data-ocid="apply_provider.success_state"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                  Application Received!
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your application has been submitted and is under review. Our
                  team will get back to you within 2–3 business days once your
                  profile has been verified.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setDescription("");
                  }}
                  data-ocid="apply_provider.secondary_button"
                >
                  Submit Another Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-display font-bold text-foreground mb-6">
                  Provider Application
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Provider Type */}
                  <div className="space-y-3" data-ocid="apply_provider.panel">
                    <Label className="text-sm font-medium">I am a…</Label>
                    <RadioGroup
                      value={providerType}
                      onValueChange={(v) => setProviderType(v as ProviderType)}
                      className="grid grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="type-psychologist"
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          providerType === ProviderType.psychologist
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                        data-ocid="apply_provider.radio"
                      >
                        <RadioGroupItem
                          value={ProviderType.psychologist}
                          id="type-psychologist"
                          className="sr-only"
                        />
                        <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            Psychologist
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mental health professional
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="type-sports"
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          providerType === ProviderType.sportsCompany
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                        data-ocid="apply_provider.radio"
                      >
                        <RadioGroupItem
                          value={ProviderType.sportsCompany}
                          id="type-sports"
                          className="sr-only"
                        />
                        <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            Sports Company
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fitness & wellness org
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">
                      {providerType === ProviderType.psychologist
                        ? "Full Name"
                        : "Company Name"}
                    </Label>
                    <Input
                      id="provider-name"
                      placeholder={
                        providerType === ProviderType.psychologist
                          ? "Dr. Priya Sharma"
                          : "FitLife India Pvt. Ltd."
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                      required
                      data-ocid="apply_provider.input"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="provider-desc">
                      About{" "}
                      {providerType === ProviderType.psychologist
                        ? "Your Practice"
                        : "Your Company"}
                    </Label>
                    <Textarea
                      id="provider-desc"
                      placeholder={
                        providerType === ProviderType.psychologist
                          ? "Describe your qualifications, specialties (e.g. anxiety, burnout, CBT), years of experience, and how you support corporate employees…"
                          : "Describe your services, sports/fitness programs, certifications, and your approach to corporate wellness…"
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl min-h-[140px] resize-none"
                      required
                      data-ocid="apply_provider.textarea"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about credentials and experience — this helps
                      our admin team review faster.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={submitting || !name.trim() || !description.trim()}
                    data-ocid="apply_provider.submit_button"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    No login required. Applications are reviewed within 2–3
                    business days.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>
  );
}
