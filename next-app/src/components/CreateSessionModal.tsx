"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ProgramType, useCreateSession } from "../hooks/useQueries";
import { PROGRAM_CONFIGS, PROGRAM_ORDER } from "../lib/programConfig";

interface CreateSessionModalProps {
  defaultType?: ProgramType;
  defaultTitle?: string;
  trigger?: ReactNode;
  onCreated?: (id: bigint) => void;
}

export function CreateSessionModal({
  defaultType,
  defaultTitle,
  trigger,
  onCreated,
}: CreateSessionModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form State
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [programType, setProgramType] = useState<ProgramType | null>(defaultType ?? null);
  const [whenPreset, setWhenPreset] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [wherePreset, setWherePreset] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("20");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [skillLevel, setSkillLevel] = useState("");

  const createMutation = useCreateSession();

  const resetForm = () => {
    setStep(1);
    setTitle(defaultTitle ?? "");
    setProgramType(defaultType ?? null);
    setWhenPreset("");
    setDateTime("");
    setWherePreset("");
    setLocation("");
    setMaxParticipants("20");
    setDescription("");
    setCost("");
    setSkillLevel("");
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime || !programType) {
      toast.error("Please fill in required fields");
      return;
    }

    const dateMs = new Date(dateTime).getTime();
    if (Number.isNaN(dateMs) || dateMs <= Date.now()) {
      toast.error("Choose a future date and time.");
      return;
    }

    try {
      const sessionId = await createMutation.mutateAsync({
        title: title.trim(),
        description: [description.trim(), cost ? `Cost: ${cost}` : "", skillLevel ? `Skill level: ${skillLevel}` : ""].filter(Boolean).join("\n") || "No details provided.",
        programType: programType as ProgramType,
        dateTime: BigInt(dateMs) * 1_000_000n,
        maxParticipants: BigInt(Number.parseInt(maxParticipants) || 20),
        spaceName: wherePreset,
        location: location.trim() || undefined,
      });
      toast.success("Activity created!");
      setOpen(false);
      resetForm();
      onCreated?.(sessionId);
    } catch {
      toast.error("Failed to create activity.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button data-ocid="session.create_button" className="rounded-full shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md h-[550px] flex flex-col p-0 overflow-hidden" data-ocid="create_session.dialog">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="font-display text-xl text-foreground">
              Create Activity
            </DialogTitle>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              Step {step} of 5
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-6">
            
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">What do you want to do?</h3>
                <div className="space-y-2">
                  <Label>Activity Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Evening Badminton" autoFocus required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROGRAM_ORDER.map((type) => {
                      const cfg = PROGRAM_CONFIGS[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setProgramType(type)}
                          className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${programType === type ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 bg-card'}`}
                        >
                          <span className="text-xl">{cfg.emoji}</span>
                          <span className="font-medium text-sm text-foreground">{cfg.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">When?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Today", "Tomorrow", "This Weekend", "Custom"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setWhenPreset(t); if(t !== "Custom") { const d = new Date(); d.setMinutes(0,0,0); if(t === "Today") d.setHours(d.getHours()+2); if(t === "Tomorrow") {d.setDate(d.getDate()+1);d.setHours(17);} if(t === "This Weekend") {d.setDate(d.getDate()+((6-d.getDay()+7)%7 || 7));d.setHours(10);} const local = new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);setDateTime(local);} }}
                      className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${whenPreset === t ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/40 bg-card text-foreground'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Exact Date & Time</Label>
                  <Input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Where?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Office", "Campus", "External Venue", "Online"].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setWherePreset(l)}
                      className={`p-3 rounded-xl border text-center font-medium text-sm transition-all ${wherePreset === l ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/40 bg-card text-foreground'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Specific Location / Link</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Court 2, Main Campus" />
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">How many people?</h3>
                <div className="space-y-4">
                  <Label>Maximum capacity</Label>
                  <Input type="number" min="2" max="200" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} className="text-lg h-12" />
                  <p className="text-xs text-muted-foreground">Set a limit for this session, including the organizer.</p>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-foreground">Additional details</h3>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What should people know before joining?" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Input value={skillLevel} onChange={e => setSkillLevel(e.target.value)} placeholder="e.g. Beginner friendly" />
                  </div>
                  <div className="space-y-2">
                    <Label>Approximate Cost</Label>
                    <Input value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. Free, ₹300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-card flex justify-between gap-2 mt-auto">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            )}
            
            {step < 5 ? (
              <Button type="button" onClick={handleNext} disabled={step === 1 && !title}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Publish Activity"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


