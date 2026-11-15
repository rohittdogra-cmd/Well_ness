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
import { AnimatedCat } from "./AnimatedCat";
import Link from "next/link";
type GameTab = "bubbles" | "breathing" | "stretching";
const games = [
  {
    id: "bubbles",
    label: "Pop a worry",
    time: "Quick play",
    icon: CircleDot,
    image: "/images/groups/category-arts.jpg",
  },
  {
    id: "breathing",
    label: "Breathe",
    time: "60 seconds",
    icon: Wind,
    image: "/images/groups/mindfulness.jpg",
  },
  {
    id: "stretching",
    label: "Desk stretch",
    time: "2 minutes",
    icon: Armchair,
    image: "/images/groups/yoga.jpg",
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
            className="reset-choice-button has-thumb"
            aria-pressed={activeTab === game.id && expanded}
            onClick={() => choose(game.id)}
          >
            <span className="reset-choice-thumb">
              <img src={game.image} alt="" loading="lazy" />
            </span>
            <span className="reset-choice-body">
              <strong>{game.label}</strong>
              <small>{game.time}</small>
            </span>
            <span className="reset-choice-arrow" aria-hidden="true">↗</span>
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
      <div className="pause-companion has-photo">
        <div className="pause-companion-thumb">
          <img src="/images/peer-support.jpg" alt="Colleagues laughing and connecting" loading="lazy" />
        </div>
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
          <AnimatedCat />
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
