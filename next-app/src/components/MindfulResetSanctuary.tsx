"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CloudRain,
  Waves,
  Trees,
  Bell,
  Heart,
  CheckCircle2,
  Clock,
  Flame,
} from "lucide-react";
import { ambientAudio, type SoundscapeType } from "@/lib/ambientAudio";

type BreathTechnique = "box" | "relax" | "flow";

interface TechniqueConfig {
  name: string;
  tagline: string;
  phases: { name: "Inhale" | "Hold" | "Exhale" | "Rest"; duration: number }[];
  totalCycleSeconds: number;
}

const TECHNIQUES: Record<BreathTechnique, TechniqueConfig> = {
  box: {
    name: "Box Breathing",
    tagline: "4-4-4-4 Focus & Centering",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 4 },
      { name: "Hold", duration: 4 },
    ],
    totalCycleSeconds: 16,
  },
  relax: {
    name: "4-7-8 Relaxing Breath",
    tagline: "Deep Nervous System Reset",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 7 },
      { name: "Exhale", duration: 8 },
    ],
    totalCycleSeconds: 19,
  },
  flow: {
    name: "Calm Flow",
    tagline: "4-6 Gentle Pacing",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Exhale", duration: 6 },
    ],
    totalCycleSeconds: 10,
  },
};

const SOUNDSCAPES: {
  id: SoundscapeType;
  name: string;
  desc: string;
  icon: typeof CloudRain;
}[] = [
  { id: "rain", name: "Gentle Rain", desc: "Soothing rainfall", icon: CloudRain },
  { id: "ocean", name: "Ocean Waves", desc: "Rhythmic tide", icon: Waves },
  { id: "breeze", name: "Forest Breeze", desc: "Rustling leaves", icon: Trees },
  { id: "zen", name: "Zen Singing Bowl", desc: "Harmonic bells", icon: Bell },
];

export function MindfulResetSanctuary() {
  const [activeTab, setActiveTab] = useState<"breathe" | "soundscape">("breathe");

  // Breathing state
  const [technique, setTechnique] = useState<BreathTechnique>("box");
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Soundscape state
  const [playingSound, setPlayingSound] = useState<SoundscapeType | null>(null);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [soundTimerMinutes, setSoundTimerMinutes] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved session count from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wellness_mindful_resets");
      if (saved) setCompletedSessions(parseInt(saved, 10) || 0);
    } catch {
      // ignore
    }
  }, []);

  const currentConfig = TECHNIQUES[technique];
  const currentPhase = currentConfig.phases[phaseIndex];

  // Stop breathing loop
  const stopBreathing = useCallback(() => {
    setIsBreathing(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhaseIndex(0);
    setPhaseSecondsLeft(currentConfig.phases[0].duration);
    setTotalSecondsLeft(60);
  }, [currentConfig]);

  // Handle phase transitions
  const triggerPhaseChime = useCallback(() => {
    if (chimeEnabled) {
      ambientAudio.playChime(false);
    }
  }, [chimeEnabled]);

  // Breathing timer tick
  useEffect(() => {
    if (!isBreathing) return;

    timerRef.current = setInterval(() => {
      setTotalSecondsLeft((prevTotal) => {
        if (prevTotal <= 1) {
          // Finished 60s session!
          setIsBreathing(false);
          setJustCompleted(true);
          ambientAudio.playChime(true);
          setCompletedSessions((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem("wellness_mindful_resets", next.toString());
            } catch {
              // ignore
            }
            return next;
          });
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prevTotal - 1;
      });

      setPhaseSecondsLeft((prevPhaseSec) => {
        if (prevPhaseSec <= 1) {
          // Move to next phase
          setPhaseIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % currentConfig.phases.length;
            triggerPhaseChime();
            setPhaseSecondsLeft(currentConfig.phases[nextIndex].duration);
            return nextIndex;
          });
          return 0;
        }
        return prevPhaseSec - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBreathing, currentConfig, triggerPhaseChime]);

  const startBreathing = () => {
    setJustCompleted(false);
    setPhaseIndex(0);
    setPhaseSecondsLeft(currentConfig.phases[0].duration);
    setTotalSecondsLeft(60);
    setIsBreathing(true);
    triggerPhaseChime();
  };

  const handleTechniqueChange = (t: BreathTechnique) => {
    stopBreathing();
    setTechnique(t);
    setPhaseIndex(0);
    setPhaseSecondsLeft(TECHNIQUES[t].phases[0].duration);
    setJustCompleted(false);
  };

  // Soundscape handlers
  const toggleSound = (soundId: SoundscapeType) => {
    if (playingSound === soundId) {
      ambientAudio.stopSound();
      setPlayingSound(null);
      if (soundStopTimeoutRef.current) clearTimeout(soundStopTimeoutRef.current);
    } else {
      ambientAudio.playSound(soundId);
      ambientAudio.setVolume(isMuted ? 0 : volume);
      setPlayingSound(soundId);

      if (soundTimerMinutes) {
        if (soundStopTimeoutRef.current) clearTimeout(soundStopTimeoutRef.current);
        soundStopTimeoutRef.current = setTimeout(() => {
          ambientAudio.stopSound();
          setPlayingSound(null);
        }, soundTimerMinutes * 60 * 1000);
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    ambientAudio.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      ambientAudio.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      ambientAudio.setVolume(0);
    }
  };

  // Determine breathing animation scale
  let circleScale = 1;
  let circleColor = "from-teal-500/20 to-emerald-500/30";
  if (isBreathing) {
    if (currentPhase.name === "Inhale") {
      circleScale = 1.35;
      circleColor = "from-emerald-400/30 to-teal-400/40";
    } else if (currentPhase.name === "Hold") {
      circleScale = 1.35;
      circleColor = "from-cyan-400/35 to-teal-500/45";
    } else if (currentPhase.name === "Exhale") {
      circleScale = 0.85;
      circleColor = "from-teal-600/30 to-emerald-700/30";
    } else {
      circleScale = 1;
      circleColor = "from-emerald-500/20 to-teal-500/25";
    }
  }

  return (
    <section className="sanctuary-container my-8 rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-[#f8fcfa] via-[#f1f9f6] to-[#ebf6f2] p-6 shadow-sm sm:p-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-950/10 pb-5">
        <div>
          <span className="eyebrow flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#126d66]">
            <Sparkles size={14} /> INSTANT WELLNESS RESET
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#123c43] sm:text-3xl">
            Your 60-second reset
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
            Follow the circle, or choose a sound to settle into.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/80 p-1.5 shadow-sm border border-emerald-100">
          <button
            type="button"
            onClick={() => setActiveTab("breathe")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "breathe"
                ? "bg-[#126d66] text-white shadow-sm"
                : "text-slate-600 hover:text-[#123c43] hover:bg-slate-50"
            }`}
          >
            <Wind size={15} />
            <span>Guided Breathing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("soundscape")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "soundscape"
                ? "bg-[#126d66] text-white shadow-sm"
                : "text-slate-600 hover:text-[#123c43] hover:bg-slate-50"
            }`}
          >
            <Volume2 size={15} />
            <span>Ambient Sounds</span>
            {playingSound && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "breathe" ? (
        <div className="breathing-layout mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Technique selector & statistics */}
          <div className="breathing-options lg:col-span-5 flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose Technique
              </span>
              <div className="mt-2.5 flex flex-col gap-2">
                {(Object.keys(TECHNIQUES) as BreathTechnique[]).map((key) => {
                  const item = TECHNIQUES[key];
                  const isSelected = technique === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTechniqueChange(key)}
                      className={`flex items-start justify-between rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-[#126d66] bg-white shadow-sm ring-2 ring-[#126d66]/15"
                          : "border-slate-200/70 bg-white/60 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm text-[#123c43]">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.tagline}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="rounded-full bg-[#e2f4ed] p-1 text-[#126d66]">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick stats and sound toggle */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-3.5 border border-emerald-100/60">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Flame size={16} className="text-amber-500" />
                <span>
                  Resets completed: <strong>{completedSessions}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setChimeEnabled(!chimeEnabled)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  chimeEnabled
                    ? "bg-emerald-100/80 text-[#126d66]"
                    : "bg-slate-100 text-slate-500"
                }`}
                title="Toggle Tibetan singing bowl chime on phase transitions"
              >
                <Bell size={13} />
                <span>Chime {chimeEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </div>

          {/* Right: Guided Breathing Circle */}
          <div className="breathing-stage lg:col-span-7 flex flex-col items-center justify-center py-4">
            {justCompleted ? (
              <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-emerald-100 p-4 text-[#126d66]">
                  <Sparkles size={40} />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-[#123c43]">
                  Reset Complete!
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                  You took 60 seconds to calm your mind and regulate your nervous
                  system. Notice how your body feels right now.
                </p>
                <button
                  type="button"
                  onClick={startBreathing}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-[#126d66] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f5953] transition-all"
                >
                  <RotateCcw size={16} /> Another 60 Seconds
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                {/* Visual Breathing Ring */}
                <div className="breathing-orb relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
                  {/* Outer aura glow */}
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-tr ${circleColor} blur-2xl transition-all duration-1000 ease-in-out`}
                    style={{
                      transform: `scale(${circleScale * 1.05})`,
                      opacity: isBreathing ? 0.9 : 0.35,
                    }}
                  />

                  {/* Expanding / contracting orb */}
                  <div
                    className={`absolute inset-4 rounded-full border-2 border-emerald-400/40 bg-gradient-to-br from-white/90 via-emerald-50/70 to-teal-50/90 backdrop-blur-md shadow-xl transition-all duration-1000 ease-in-out flex flex-col items-center justify-center p-6 text-center`}
                    style={{
                      transform: `scale(${circleScale})`,
                    }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-[#126d66]/80">
                      {isBreathing ? currentPhase.name : "Ready to Reset"}
                    </span>

                    <span className="my-1 font-mono text-5xl font-black text-[#123c43]">
                      {isBreathing ? phaseSecondsLeft : "60"}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      {isBreathing
                        ? `${totalSecondsLeft}s left`
                        : "Click Start Below"}
                    </span>
                  </div>
                </div>

                {/* Progress bar and control buttons */}
                <div className="mt-6 flex w-full max-w-xs flex-col items-center gap-3">
                  {isBreathing && (
                    <div className="w-full">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Session Progress</span>
                        <span>{60 - totalSecondsLeft}/60s</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-[#126d66] transition-all duration-1000"
                          style={{
                            width: `${((60 - totalSecondsLeft) / 60) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1">
                    {!isBreathing ? (
                      <button
                        type="button"
                        onClick={startBreathing}
                        className="flex items-center gap-2 rounded-2xl bg-[#126d66] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#0f5953] transition-all"
                      >
                        <Play size={18} /> Begin 60s Breathwork
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={stopBreathing}
                          className="flex items-center gap-2 rounded-xl bg-slate-200/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
                        >
                          <Pause size={14} /> Pause & Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ambient Soundscape Tab */
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOUNDSCAPES.map((sound) => {
              const Icon = sound.icon;
              const isPlaying = playingSound === sound.id;
              return (
                <div
                  key={sound.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                    isPlaying
                      ? "border-[#126d66] bg-white shadow-md ring-2 ring-[#126d66]/15"
                      : "border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-xl p-2.5 ${
                        isPlaying
                          ? "bg-[#126d66] text-white"
                          : "bg-emerald-50 text-[#126d66]"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    {isPlaying && (
                      <div className="flex items-end gap-1 h-5 pt-1">
                        <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-3" />
                        <span
                          className="w-1 bg-emerald-500 rounded-full animate-bounce h-5"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1 bg-emerald-500 rounded-full animate-bounce h-4"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-bold text-base text-[#123c43]">
                      {sound.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{sound.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSound(sound.id)}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                      isPlaying
                        ? "bg-[#126d66] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={14} /> Stop
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Play Sound
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Master Volume and Timer controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
            {/* Volume control */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-1.5 w-28 sm:w-36 accent-[#126d66] cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-500 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Timer preset */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Clock size={15} className="text-slate-400" />
              <span>Auto-off:</span>
              <div className="flex items-center gap-1">
                {[null, 5, 15, 30].map((mins) => (
                  <button
                    key={mins === null ? "off" : mins}
                    type="button"
                    onClick={() => setSoundTimerMinutes(mins)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      soundTimerMinutes === mins
                        ? "bg-[#126d66] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {mins === null ? "Off" : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
