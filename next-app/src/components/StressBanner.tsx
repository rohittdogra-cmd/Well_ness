"use client";

import {
  Activity,
  AlertOctagon,
  ArrowDown,
  ArrowRight,
  BarChart2,
  Brain,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    id: 1,
    icon: Brain,
    title: "What Is Stress?",
    subtitle: "Understanding the silent global threat",
    type: "explainer" as const,
    body: 'Stress is the body\'s physiological response to any demand or challenge. It triggers a cascade of hormones — cortisol, adrenaline — preparing you for "fight or flight". In short bursts it can sharpen focus. But prolonged, unmanaged stress becomes silently toxic, eroding your health, relationships, and career. The World Health Organization now classifies burnout as an occupational phenomenon.',
    pills: ["Acute Stress", "Chronic Stress", "Episodic Stress"],
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "The Global Corporate Stress Crisis",
    subtitle: "A worldwide epidemic — not just a US problem",
    type: "stats-row" as const,
    stats: [
      {
        value: "1B+",
        label: "workers worldwide affected by work-related stress",
        source: "WHO 2023",
      },
      {
        value: "12B",
        label: "working days lost per year to depression & anxiety globally",
        source: "WHO",
      },
      {
        value: "76%",
        label:
          "of workers globally report at least one symptom of poor mental health",
        source: "McKinsey 2022",
      },
    ],
  },
  {
    id: 3,
    icon: Activity,
    title: "How Stress Hits Your People",
    subtitle: "The effects are real and measurable",
    type: "columns" as const,
    columns: [
      {
        emoji: "🫀",
        heading: "Physical",
        items: [
          "Persistent headaches",
          "Chronic fatigue",
          "Sleep disorders",
          "Elevated blood pressure",
          "Weakened immunity",
        ],
      },
      {
        emoji: "🧠",
        heading: "Mental",
        items: [
          "Anxiety & panic attacks",
          "Clinical depression",
          "Poor concentration",
          "Memory impairment",
          "Decision fatigue",
        ],
      },
      {
        emoji: "⚡",
        heading: "Behavioral",
        items: [
          "Rising absenteeism",
          "Reduced productivity",
          "Substance dependency",
          "Interpersonal conflict",
          "Presenteeism",
        ],
      },
    ],
  },
  {
    id: 4,
    icon: BarChart2,
    title: "The Numbers Don't Lie",
    subtitle: "Global workplace stress by the data",
    type: "grid-stats" as const,
    gridStats: [
      {
        value: "$1T",
        label: "lost annually to global productivity from depression & anxiety",
      },
      {
        value: "745K",
        label: "deaths per year from overwork (long hours) — WHO/ILO",
      },
      {
        value: "$322B",
        label:
          "global cost of employee burnout in turnover & lost productivity",
      },
      {
        value: "44%",
        label:
          "of employees worldwide say their stress has increased in the past year",
      },
    ],
    source: "Sources: WHO, ILO, McKinsey, Gallup 2023",
  },
  {
    id: 5,
    icon: Globe,
    title: "Stress by Region",
    subtitle: "No continent is immune",
    type: "bars" as const,
    bars: [
      { label: "South Asia (India, Bangladesh)", pct: 82 },
      { label: "North America (US, Canada)", pct: 79 },
      { label: "East Asia (Japan, China, S. Korea)", pct: 75 },
      { label: "Europe (UK, Germany, France)", pct: 68 },
      { label: "Middle East & Africa", pct: 65 },
      { label: "Latin America", pct: 62 },
    ],
  },
  {
    id: 6,
    icon: Building2,
    title: "Industries Hit Hardest",
    subtitle: "No sector is immune — globally",
    type: "bars" as const,
    bars: [
      { label: "Finance & Banking", pct: 79 },
      { label: "Healthcare", pct: 74 },
      { label: "Technology", pct: 69 },
      { label: "Legal", pct: 67 },
      { label: "Manufacturing", pct: 60 },
    ],
  },
  {
    id: 7,
    icon: AlertOctagon,
    title: "The Burnout Spiral",
    subtitle: "When stress goes unaddressed",
    type: "spiral" as const,
    stages: [
      "Unmanaged Stress",
      "Chronic Fatigue",
      "Emotional Exhaustion",
      "Disengagement",
      "Burnout",
      "High Turnover",
    ],
  },
  {
    id: 8,
    icon: ShieldCheck,
    title: "How We Resolve This",
    subtitle: "Corporate Wellness Hub — your all-in-one solution",
    type: "solutions" as const,
    solutions: [
      {
        emoji: "😔",
        problem: "Isolation & Disengagement",
        problemStat: "1 in 3 employees feel lonely at work",
        fix: "Mindfully Meetup & Social Gathering",
        fixDetail: "Team bonding in low-pressure activities",
        href: "/mindful-meetup",
        cta: "Explore Meetups",
      },
      {
        emoji: "🪑",
        problem: "Physical Fatigue",
        problemStat: "Sedentary work → chronic exhaustion",
        fix: "Movement & Exercise (Sports)",
        fixDetail: "Cricket, Badminton, Pickleball & more",
        href: "/programs",
        cta: "Browse Sports",
      },
      {
        emoji: "🤐",
        problem: "Bottled Emotions",
        problemStat: "76% fear stigma when speaking up",
        fix: "Anonymous Discussion Board",
        fixDetail: "Voice stress freely, without judgment",
        href: "/discuss",
        cta: "Talk Anonymously",
      },
      {
        emoji: "🧩",
        problem: "Mental Health Gaps",
        problemStat: "Only 1 in 10 gets needed support",
        fix: "Licensed Psychologists",
        fixDetail: "Private online sessions on your schedule",
        href: "/psychologists",
        cta: "Book a Session",
      },
      {
        emoji: "🌀",
        problem: "Task Overwhelm",
        problemStat: "Unclear ownership → stress overload",
        fix: "Task Allocation Module",
        fixDetail: "Fair workload distribution across teams",
        href: "/programs",
        cta: "Try Task Tools",
      },
    ],
  },
];

const SLIDE_DURATION = 5000;

export function StressBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const goTo = useCallback((index: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent(index);
    setProgress(0);
    progressRef.current = 0;
    startTimeRef.current = performance.now();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => {
      const n = (c + 1) % slides.length;
      setDirection(1);
      setProgress(0);
      progressRef.current = 0;
      startTimeRef.current = performance.now();
      return n;
    });
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => {
      const n = (c - 1 + slides.length) % slides.length;
      setDirection(-1);
      setProgress(0);
      progressRef.current = 0;
      startTimeRef.current = performance.now();
      return n;
    });
  }, []);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!paused) {
        const elapsed = now - startTimeRef.current;
        const p = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
        setProgress(p);
        progressRef.current = p;
        if (p >= 100) {
          setCurrent((c) => (c + 1) % slides.length);
          setDirection(1);
          setProgress(0);
          progressRef.current = 0;
          startTimeRef.current = now;
        }
      } else {
        startTimeRef.current =
          now - (progressRef.current / 100) * SLIDE_DURATION;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section
      className="relative bg-zinc-950 overflow-hidden stress-banner-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-ocid="stress_banner.section"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 40%, #e11d48 0%, transparent 55%), radial-gradient(circle at 85% 60%, #7c3aed 0%, transparent 50%)",
        }}
      />

      {/* Section Header */}
      <div className="relative container max-w-6xl mx-auto px-4 pt-10 sm:pt-14 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-rose-400 mb-2 sm:mb-3">
            🌍 Global Awareness Series
          </span>
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight"
            style={{ color: "#ffffff" }}
          >
            The Stress Reality
          </h2>
          <p
            className="text-zinc-300 text-sm md:text-base max-w-xl mx-auto"
            style={{ color: "#d4d4d8" }}
          >
            Why corporate wellness isn&apos;t optional anymore — worldwide
          </p>
        </motion.div>
      </div>

      {/* Slider area */}
      <div className="relative container max-w-6xl mx-auto px-3 sm:px-4 pb-6">
        <div className="relative flex items-center md:gap-4">
          {/* Desktop Prev button */}
          <button
            type="button"
            onClick={prev}
            data-ocid="stress_banner.pagination_prev"
            className="hidden md:flex flex-shrink-0 w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white items-center justify-center transition-colors z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide container - full width on mobile, no side squeezing */}
          <div className="w-full flex-1 overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-900/80 shadow-2xl min-h-[420px] sm:min-h-[360px] md:min-h-[300px] relative flex flex-col justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: "easeInOut" }}
                className="p-5 sm:p-7 md:p-10 w-full"
              >
                <SlideContent slide={slides[current]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop Next button */}
          <button
            type="button"
            onClick={next}
            data-ocid="stress_banner.pagination_next"
            className="hidden md:flex flex-shrink-0 w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white items-center justify-center transition-colors z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation & Dot indicators */}
        <div
          className="flex items-center justify-between sm:justify-center gap-3 mt-5 px-1 sm:px-0"
          data-ocid="stress_banner.tab"
        >
          {/* Mobile Prev button */}
          <button
            type="button"
            onClick={prev}
            className="md:hidden flex w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 active:scale-95 text-white items-center justify-center transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((s, i) => (
              <button
                type="button"
                key={s.id}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? i === slides.length - 1
                      ? "w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "w-8 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Mobile Next button */}
          <button
            type="button"
            onClick={next}
            className="md:hidden flex w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 active:scale-95 text-white items-center justify-center transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-rose-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

function SlideContent({ slide }: { slide: (typeof slides)[number] }) {
  const Icon = slide.icon;

  const isSolution = slide.type === "solutions";

  const header = (
    <div className="flex items-start gap-3 mb-5 sm:mb-6">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isSolution
            ? "bg-emerald-500/20 border border-emerald-500/30"
            : "bg-rose-500/20 border border-rose-500/30"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            isSolution ? "text-emerald-400" : "text-rose-400"
          }`}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">
          {String(slide.id).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </p>
        <h3
          className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight"
          style={{ color: "#ffffff" }}
        >
          {slide.title}
        </h3>
        <p className="text-zinc-300 text-xs sm:text-sm mt-0.5" style={{ color: "#d4d4d8" }}>
          {slide.subtitle}
        </p>
      </div>
    </div>
  );

  if (slide.type === "explainer") {
    return (
      <div>
        {header}
        <p
          className="text-zinc-200 text-sm sm:text-base leading-relaxed mb-5"
          style={{ color: "#e4e4e7" }}
        >
          {slide.body}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {slide.pills.map((p) => (
            <span
              key={p}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-200"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "stats-row") {
    return (
      <div>
        {header}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slide.stats.map((s) => (
            <div
              key={s.value}
              className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08]"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-rose-400 mb-1">
                {s.value}
              </div>
              <div className="text-zinc-200 text-sm leading-snug mb-2" style={{ color: "#e4e4e7" }}>
                {s.label}
              </div>
              <div className="text-zinc-500 text-xs" style={{ color: "#71717a" }}>{s.source}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "columns") {
    return (
      <div>
        {header}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slide.columns.map((col) => (
            <div
              key={col.heading}
              className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08]"
            >
              <div className="text-2xl mb-2">{col.emoji}</div>
              <div className="font-semibold text-white mb-2 text-sm" style={{ color: "#ffffff" }}>
                {col.heading}
              </div>
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-zinc-300 flex items-start gap-1.5"
                    style={{ color: "#d4d4d8" }}
                  >
                    <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "grid-stats") {
    return (
      <div>
        {header}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {slide.gridStats.map((s) => (
            <div
              key={s.value}
              className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.08]"
            >
              <div className="font-display text-2xl md:text-3xl font-bold text-amber-400 mb-1">
                {s.value}
              </div>
              <div className="text-zinc-400 text-xs leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <p className="text-zinc-600 text-xs">{slide.source}</p>
      </div>
    );
  }

  if (slide.type === "bars") {
    return (
      <div>
        {header}
        <div className="space-y-3">
          {slide.bars.map((bar, i) => (
            <div key={bar.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-zinc-300">{bar.label}</span>
                <span className="text-sm font-bold text-rose-400">
                  {bar.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "spiral") {
    return (
      <div>
        {header}
        <div className="flex flex-wrap gap-1.5 items-center mb-6">
          {slide.stages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  i === slide.stages.length - 1
                    ? "bg-rose-500/25 border-rose-500/50 text-rose-300"
                    : "bg-white/5 border-white/15 text-zinc-300"
                }`}
              >
                {stage}
              </span>
              {i < slide.stages.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-5">
          <p className="text-amber-300 text-sm">
            💸 Globally, replacing one employee costs{" "}
            <strong className="text-amber-200">150–200%</strong> of their annual
            salary — a universal cost across all markets
          </p>
        </div>

        <a
          href="/discuss"
          data-ocid="stress_banner.primary_button"
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-colors"
        >
          Talk Anonymously →
        </a>
      </div>
    );
  }

  if (slide.type === "solutions") {
    return (
      <div>
        {header}

        {/* Column labels */}
        <div className="hidden md:grid grid-cols-[1fr_48px_1fr] gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
              The Problem
            </span>
          </div>
          <div />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Our Solution
            </span>
          </div>
        </div>

        {/* Transformation rows */}
        <div className="space-y-2">
          {slide.solutions.map((sol, i) => (
            <motion.div
              key={sol.problem}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-2 items-center"
            >
              {/* Problem card */}
              <div className="flex items-center gap-3 bg-rose-950/40 border border-rose-800/40 rounded-xl px-4 py-3 hover:border-rose-600/50 transition-colors group/prob">
                <span className="text-xl flex-shrink-0">{sol.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-rose-300 leading-tight">
                    {sol.problem}
                  </p>
                  <p className="text-xs text-rose-500/80 mt-0.5 truncate">
                    {sol.problemStat}
                  </p>
                </div>
              </div>

              {/* Arrow — horizontal on md+, vertical on mobile */}
              <div className="flex md:justify-center justify-start pl-4 md:pl-0">
                <ArrowRight className="hidden md:block w-5 h-5 text-zinc-500" />
                <ArrowDown className="block md:hidden w-5 h-5 text-zinc-600" />
              </div>

              {/* Solution card */}
              <a
                href={sol.href}
                className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-4 py-3 hover:border-emerald-500/60 hover:bg-emerald-950/60 transition-all group/sol"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-300 leading-tight">
                    {sol.fix}
                  </p>
                  <p className="text-xs text-emerald-600/90 mt-0.5 truncate">
                    {sol.fixDetail}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover/sol:text-emerald-400 group-hover/sol:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* CTA bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <a
            href="/membership"
            data-ocid="stress_banner.primary_button"
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full text-white transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Start Your Wellness Journey
          </a>
          <span className="text-zinc-500 text-xs">
            One membership · Every tool your team needs
          </span>
        </motion.div>
      </div>
    );
  }

  return null;
}
