"use client";
import { useState } from "react";
import { Globe, Minus, Plus, ArrowRight } from "lucide-react";
const regions = [
  [
    "🇮🇳",
    "South Asia",
    "India & Bangladesh",
    82,
    "Workplace pressure and long commutes",
  ],
  [
    "🇺🇸",
    "North America",
    "US & Canada",
    79,
    "Always-on messages and blurred boundaries",
  ],
  [
    "🇯🇵",
    "East Asia",
    "Japan, China & S. Korea",
    75,
    "Long hours and overtime culture",
  ],
  [
    "🇪🇺",
    "Europe",
    "UK, Germany & France",
    68,
    "Finding a sustainable work-life balance",
  ],
  [
    "🌍",
    "Middle East & Africa",
    "Across the region",
    65,
    "Changing workplaces and workload pressure",
  ],
  [
    "🇧🇷",
    "Latin America",
    "Across the region",
    62,
    "Job uncertainty and economic pressure",
  ],
] as const;
export function GlobalStressPulse() {
  const [region, setRegion] = useState(0);
  const [levels, setLevels] = useState([7, 8, 6]);
  const score = Math.round((levels.reduce((a, b) => a + b, 0) / 30) * 100);
  function adjust(index: number, change: number) {
    setLevels((values) =>
      values.map((v, i) =>
        i === index ? Math.max(0, Math.min(10, v + change)) : v,
      ),
    );
  }
  return (
    <section
      className="pulse-compact"
      id="global-stress"
      aria-labelledby="pulse-title"
    >
      <header className="compact-heading">
        <div>
          <span className="eyebrow">
            <Globe size={14} /> GLOBAL WORKPLACE PULSE
          </span>
          <h2 id="pulse-title">Worldwide Stress by the Numbers</h2>
          <p>A little perspective. A moment to check in with yourself.</p>
        </div>
        <span className="soft-label">Make room for a break</span>
      </header>
      <div className="pulse-facts">
        <div>
          <strong>12B</strong>
          <span>working days lost / year</span>
        </div>
        <div>
          <strong>$1T</strong>
          <span>annual productivity cost</span>
        </div>
        <p>
          Global estimates for depression and anxiety.{" "}
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work"
            target="_blank"
            rel="noreferrer"
          >
            Source: WHO ↗
          </a>
        </p>
      </div>
      <div className="pulse-columns">
        <div className="region-explorer">
          <div className="compact-subhead">
            <h3>Explore by region</h3>
            <small>Illustrative stress scores</small>
          </div>
          <div
            className="region-chips"
            role="group"
            aria-label="Choose a region"
          >
            {regions.map((r, i) => (
              <button
                key={r[1]}
                type="button"
                aria-pressed={region === i}
                onClick={() => setRegion(i)}
              >
                <span>
                  {r[0]} {r[1]}
                </span>
                <strong>{r[3]}%</strong>
              </button>
            ))}
          </div>
          <p className="region-note" aria-live="polite">
            <strong>{regions[region][2]}</strong> · {regions[region][4]}. These
            sample scores are for exploration, not a regional survey.
          </p>
        </div>
        <div className="personal-pulse">
          <div className="compact-subhead">
            <h3>Your stress pulse</h3>
            <output aria-live="polite">{score}%</output>
          </div>
          {[
            "Neck & shoulder stiffness",
            "Mental overload",
            "Sleep deficit / fatigue",
          ].map((label, i) => (
            <div className="pulse-stepper" key={label}>
              <span>{label}</span>
              <div>
                <button
                  type="button"
                  aria-label={`Decrease ${label}`}
                  disabled={levels[i] === 0}
                  onClick={() => adjust(i, -1)}
                >
                  <Minus size={14} />
                </button>
                <output aria-label={label}>
                  {levels[i]}
                  <small>/10</small>
                </output>
                <button
                  type="button"
                  aria-label={`Increase ${label}`}
                  disabled={levels[i] === 10}
                  onClick={() => adjust(i, 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="pulse-action">
            <small>
              {score > 65
                ? "Time for a gentle reset?"
                : "Keep a little space for yourself."}
            </small>
            <a href="#stress-arcade" className="text-action">
              Play reset game <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
