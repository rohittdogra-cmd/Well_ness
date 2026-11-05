"use client";
import { useState } from "react";
import {
  Wind,
  Armchair,
  CircleDot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ZenBubblePopper } from "./ZenBubblePopper";
import { MindfulResetSanctuary } from "./MindfulResetSanctuary";
import { ErgonomicDeskStretch } from "./ErgonomicDeskStretch";
import Link from "next/link";
type GameTab = "bubbles" | "breathing" | "stretching";
const games = [
  { id: "bubbles", label: "Pop a worry", time: "Quick play", icon: CircleDot },
  { id: "breathing", label: "Breathe", time: "60 seconds", icon: Wind },
  {
    id: "stretching",
    label: "Desk stretch",
    time: "2 minutes",
    icon: Armchair,
  },
] as const;
export function StressArcade() {
  const [activeTab, setActiveTab] = useState<GameTab>("bubbles");
  const [expanded, setExpanded] = useState(false);
  function choose(tab: GameTab) {
    setActiveTab(tab);
    setExpanded(true);
  }
  return (
    <section
      className="arcade-compact"
      id="stress-arcade"
      aria-labelledby="arcade-title"
    >
      <header className="compact-heading">
        <div>
          <span className="eyebrow">A LITTLE PAUSE, RIGHT HERE</span>
          <h2 id="arcade-title">Micro-games for a better workday</h2>
          <p>Pick a small reset. Come back a little lighter.</p>
        </div>
        <button
          type="button"
          className="text-action"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="reset-game-panel"
        >
          {expanded ? "Close reset" : "Open reset"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </header>
      <div
        className="reset-choices"
        role="group"
        aria-label="Choose your reset"
      >
        {games.map((game) => (
          <button
            type="button"
            key={game.id}
            aria-pressed={activeTab === game.id && expanded}
            onClick={() => choose(game.id)}
          >
            <game.icon size={22} />
            <span>
              <strong>{game.label}</strong>
              <small>{game.time}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      {expanded && (
        <div id="reset-game-panel" className="game-display-container">
          {activeTab === "bubbles" ? (
            <ZenBubblePopper />
          ) : activeTab === "breathing" ? (
            <MindfulResetSanctuary />
          ) : (
            <ErgonomicDeskStretch />
          )}
        </div>
      )}
      <div className="pause-companion">
        <div className="cat-trail" aria-hidden="true">
          <svg viewBox="0 0 240 80">
            <path
              d="M0 65 Q60 15 120 55 T240 30"
              fill="none"
              stroke="#bad7cd"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
          </svg>
          <span className="pause-cat">🐈</span>
        </div>
        <div>
          <strong>A little less stress. A little more connection.</strong>
          <p>
            Your next good conversation could start with one shared interest.
          </p>
          <Link href="/people">Find your people →</Link>
        </div>
      </div>
    </section>
  );
}
