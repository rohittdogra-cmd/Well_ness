"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  CheckCircle2,
  Smile,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react";
import { ambientAudio } from "@/lib/ambientAudio";

interface StressBubble {
  id: string;
  label: string;
  category: "work" | "mental" | "physical" | "digital";
  emoji: string;
  gradientClass: string;
  borderClass: string;
  textClass: string;
  x: number; // percentage
  y: number; // percentage
  size: number; // px diameter
  driftSpeed: number;
  popped: boolean;
}

const DEFAULT_STRESSORS: Omit<StressBubble, "id" | "x" | "y" | "popped">[] = [
  {
    label: "5:30 PM Urgent Ping",
    category: "work",
    emoji: "🔥",
    gradientClass: "from-amber-50 to-orange-100",
    borderClass: "border-orange-300",
    textClass: "text-amber-950",
    size: 110,
    driftSpeed: 1.2,
  },
  {
    label: "142 Unread Emails",
    category: "digital",
    emoji: "📧",
    gradientClass: "from-sky-50 to-blue-100",
    borderClass: "border-sky-300",
    textClass: "text-sky-950",
    size: 105,
    driftSpeed: 0.9,
  },
  {
    label: "Back-to-Back Calls",
    category: "work",
    emoji: "📞",
    gradientClass: "from-rose-50 to-pink-100",
    borderClass: "border-rose-300",
    textClass: "text-rose-950",
    size: 115,
    driftSpeed: 1.1,
  },
  {
    label: "Imposter Syndrome",
    category: "mental",
    emoji: "🌀",
    gradientClass: "from-purple-50 to-indigo-100",
    borderClass: "border-purple-300",
    textClass: "text-purple-950",
    size: 118,
    driftSpeed: 0.8,
  },
  {
    label: "Tight Trapezius & Neck",
    category: "physical",
    emoji: "🪑",
    gradientClass: "from-emerald-50 to-teal-100",
    borderClass: "border-teal-300",
    textClass: "text-teal-950",
    size: 105,
    driftSpeed: 1.0,
  },
  {
    label: "Overthinking Messages",
    category: "mental",
    emoji: "💭",
    gradientClass: "from-violet-50 to-purple-100",
    borderClass: "border-violet-300",
    textClass: "text-violet-950",
    size: 110,
    driftSpeed: 0.7,
  },
  {
    label: "Shifted Q4 Deadlines",
    category: "work",
    emoji: "⏰",
    gradientClass: "from-amber-100 to-rose-100",
    borderClass: "border-amber-300",
    textClass: "text-stone-900",
    size: 120,
    driftSpeed: 1.3,
  },
  {
    label: "4th Coffee Jitters",
    category: "physical",
    emoji: "☕",
    gradientClass: "from-orange-50 to-amber-100",
    borderClass: "border-amber-300",
    textClass: "text-amber-950",
    size: 98,
    driftSpeed: 1.4,
  },
  {
    label: "Screen Glare & Fatigue",
    category: "physical",
    emoji: "💻",
    gradientClass: "from-teal-50 to-emerald-100",
    borderClass: "border-teal-300",
    textClass: "text-teal-950",
    size: 102,
    driftSpeed: 0.9,
  },
];

const CALMING_MANTRAS = [
  "Let it float away 🍃",
  "Take a slow breath 🌿",
  "Not an emergency 😌",
  "You are doing enough ✨",
  "Shoulders down, relax 🧘",
  "One thing at a time 🎯",
  "Protected personal boundary 🛡️",
  "Peace restored 🕊️",
];

export function ZenBubblePopper() {
  const [bubbles, setBubbles] = useState<StressBubble[]>([]);
  const [stressLevel, setStressLevel] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeMantra, setActiveMantra] = useState<string | null>(null);
  const [floatParticles, setFloatParticles] = useState<
    { id: number; x: number; y: number; text: string }[]
  >([]);

  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    const initial = DEFAULT_STRESSORS.map((s, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const baseX = 12 + col * 28 + (Math.random() * 8 - 4);
      const baseY = 10 + row * 28 + (Math.random() * 8 - 4);
      return {
        ...s,
        id: `bubble-${Date.now()}-${index}`,
        x: Math.max(8, Math.min(84, baseX)),
        y: Math.max(8, Math.min(76, baseY)),
        popped: false,
      };
    });
    setBubbles(initial);
    setStressLevel(100);
    setCombo(0);
    setMaxCombo(0);
    setPoppedCount(0);
    setActiveMantra("Click or tap each stressor to pop it and deflate tension!");
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const popBubble = (id: string, e: React.MouseEvent) => {
    const bubble = bubbles.find((b) => b.id === id);
    if (!bubble || bubble.popped) return;

    if (soundEnabled) {
      const pitch = 1 + Math.min(combo * 0.08, 0.8);
      ambientAudio.playPopSound(pitch);
    }

    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b)),
    );

    const nextPopped = poppedCount + 1;
    setPoppedCount(nextPopped);

    const nextCombo = combo + 1;
    setCombo(nextCombo);
    if (nextCombo > maxCombo) setMaxCombo(nextCombo);

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2500);

    const remaining = bubbles.filter((b) => b.id !== id && !b.popped).length;
    const newStress = Math.round((remaining / bubbles.length) * 100);
    setStressLevel(newStress);

    const mantra =
      CALMING_MANTRAS[Math.floor(Math.random() * CALMING_MANTRAS.length)];
    setActiveMantra(mantra);

    const rect = e.currentTarget.getBoundingClientRect();
    const particleId = Date.now() + Math.random();
    setFloatParticles((prev) => [
      ...prev.slice(-6),
      {
        id: particleId,
        x: rect.left + rect.width / 2,
        y: rect.top,
        text: `-${Math.round(100 / bubbles.length)}% • ${mantra}`,
      },
    ]);

    setTimeout(() => {
      setFloatParticles((prev) => prev.filter((p) => p.id !== particleId));
    }, 1400);

    if (remaining === 0) {
      if (soundEnabled) {
        setTimeout(() => ambientAudio.playCelebrationChime(), 200);
      }
    }
  };

  const popAll = () => {
    if (soundEnabled) ambientAudio.playCelebrationChime();
    setBubbles((prev) => prev.map((b) => ({ ...b, popped: true })));
    setStressLevel(0);
    setPoppedCount(bubbles.length);
    setActiveMantra("All stressors cleared! You're back in control.");
  };

  const isCleared = stressLevel === 0;

  return (
    <div className="bubble-reset rounded-3xl border border-[#dfe8e8] bg-white p-6 md:p-8 text-[#172e3d] shadow-[0_4px_20px_rgba(23,46,61,0.06)] relative overflow-hidden">
      {/* Game Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#dfe8e8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-[#e3f3ef] text-[#087f79] border border-[#b8dcd3] inline-flex items-center gap-1.5">
              <Sparkles size={12} /> Interactive De-Stress Game
            </span>
            {combo > 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#fce9dc] text-[#a46b3a] border border-[#f5cbab] animate-pulse flex items-center gap-1">
                <Flame size={12} /> {combo}x Combo!
              </span>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172e3d]">
            Deflate Your Workday Stress 🫧
          </h3>
          <p className="text-[#617380] text-sm mt-1 max-w-xl">
            Tap a worry, watch it pop, and take a little pause.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-[#dfe8e8] bg-[#f8faf9] hover:bg-[#edf5f3] text-[#445d69] transition-colors"
            title={soundEnabled ? "Mute audio" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            onClick={initGame}
            className="px-3.5 py-2 rounded-xl border border-[#dfe8e8] bg-[#f8faf9] hover:bg-[#edf5f3] text-[#233d32] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> Respawn
          </button>
          {!isCleared && (
            <button
              type="button"
              onClick={popAll}
              className="px-3.5 py-2 rounded-xl bg-[#fcebd9] hover:bg-[#fbd9b8] text-[#a46b3a] font-bold text-xs border border-[#f7cdab] transition-all flex items-center gap-1"
            >
              <Zap size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Live Stress HUD Barometer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className="sm:col-span-2 p-4 rounded-2xl bg-[#f8faf9] border border-[#dfe8e8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#617380] flex items-center gap-1.5">
              <Activity size={14} className="text-[#087f79]" /> Worries remaining
            </span>
            <span
              className={`text-sm font-extrabold ${
                stressLevel === 0
                  ? "text-[#167967]"
                  : stressLevel > 50
                    ? "text-[#a15155]"
                    : "text-[#a46b3a]"
              }`}
            >
              {stressLevel}% {stressLevel === 0 ? "• DEFLATED 🎉" : "Load"}
            </span>
          </div>

          <div className="w-full h-3.5 bg-[#e8efef] rounded-full overflow-hidden p-0.5 border border-[#ccdada]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                stressLevel === 0
                  ? "bg-[#167967]"
                  : stressLevel > 50
                    ? "bg-gradient-to-r from-[#df9354] via-[#e2725b] to-[#c94b4b]"
                    : "bg-gradient-to-r from-[#087f79] to-[#167967]"
              }`}
              style={{ width: `${stressLevel}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-[11px] text-[#72828b]">
            <span>Clear</span>
            <span>Halfway</span>
            <span>Full board</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#f8faf9] border border-[#dfe8e8] flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-black text-[#087f79]">
              {poppedCount} / {bubbles.length}
            </div>
            <div className="text-[11px] text-[#617380] font-semibold">
              Popped
            </div>
          </div>
          <div className="w-px h-8 bg-[#dfe8e8]" />
          <div>
            <div className="text-2xl font-black text-[#a46b3a]">
              {maxCombo}x
            </div>
            <div className="text-[11px] text-[#617380] font-semibold">
              Max Streak
            </div>
          </div>
        </div>
      </div>

      {/* Active Mantra Banner */}
      {activeMantra && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#e3f3ef] border border-[#b8dcd3] text-[#126d66] text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Smile size={16} className="text-[#087f79]" />
            {activeMantra}
          </span>
          <span className="text-[11px] text-[#3d7971] hidden sm:inline">
            Worries cleared: {poppedCount}
          </span>
        </div>
      )}

      {/* Game Board Canvas */}
      <div className="bubble-board relative w-full min-h-[380px] sm:min-h-[420px] rounded-2xl bg-[#faf8f5] border border-[#e8e0cd] overflow-hidden select-none p-4 flex items-center justify-center">
        {/* Soft grid background */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#d6cfbe 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Cleared Success Card */}
        {isCleared ? (
          <div className="text-center p-8 max-w-md relative z-20">
            <div className="w-16 h-16 rounded-full bg-[#dff2e9] text-[#167967] border-2 border-[#167967]/30 flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#dff2e9] text-[#167967]">
              Board cleared
            </span>
            <h4 className="text-2xl font-bold text-[#172e3d] mt-2 mb-1.5">
              A little lighter. Nice work!
            </h4>
            <p className="text-[#617380] text-sm mb-5 leading-relaxed">
              You cleared all {bubbles.length} mental pressure triggers. Take a breath and notice how you feel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={initGame}
                className="wellness-button"
              >
                <RotateCcw size={16} /> Spawn Fresh Stressors
              </button>
            </div>
          </div>
        ) : (
          /* Active Bubbles Board */
          <div className="bubble-field relative w-full h-[360px] sm:h-[400px]">
            {bubbles.map((bubble, i) => {
              if (bubble.popped) return null;

              const animDuration = 4 + (i % 3);
              const delay = (i % 4) * 0.5;

              return (
                <button
                  key={bubble.id}
                  type="button"
                  onClick={(e) => popBubble(bubble.id, e)}
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    animationDuration: `${animDuration}s`,
                    animationDelay: `${delay}s`,
                  }}
                  className={`relative rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 animate-pulse-gentle shadow-[0_6px_18px_rgba(35,61,50,0.08)] border-2 ${bubble.borderClass} bg-gradient-to-br ${bubble.gradientClass} flex flex-col items-center justify-center p-2 text-center group backdrop-blur-sm`}
                >
                  {/* Glossy reflection bubble shine */}
                  <div className="absolute top-2 left-3 w-5 h-2.5 rounded-full bg-white/70 rotate-[-25deg] pointer-events-none" />

                  <span className="text-xl sm:text-2xl mb-0.5 filter drop-shadow-sm">
                    {bubble.emoji}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold leading-tight line-clamp-2 px-1 ${bubble.textClass}`}
                  >
                    {bubble.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#617380] opacity-0 group-hover:opacity-100 transition-opacity">
                    Pop to Clear
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating feedback particle */}
      {floatParticles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-full bg-[#172e3d] text-white text-xs font-bold shadow-xl animate-float-fade"
          style={{
            left: `${p.x}px`,
            top: `${p.y - 30}px`,
          }}
        >
          {p.text}
        </div>
      ))}

      {/* Footer Insight */}
      <div className="mt-4 pt-3 border-t border-[#dfe8e8] flex flex-wrap items-center justify-between text-xs text-[#617380] gap-2">
        <span className="flex items-center gap-1.5">
          <Shield size={14} className="text-[#087f79]" />
          A playful pause. One worry at a time.
        </span>
        <span>
          Daily Goal: <strong>3 Clears / Day</strong>
        </span>
      </div>
    </div>
  );
}
