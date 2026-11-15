"use client";
import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  HeartHandshake,
  Info,
  MapPin,
} from "lucide-react";
const indiaSource = "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1554374";
const prevalenceSource =
  "https://sansad.in/getFile/annex/253/A114.pdf?source=pqars";
const surveySource =
  "https://indianmhs.nimhans.ac.in/phase1/detailed-news.php?eid=6";
const whoSource =
  "https://www.who.int/southeastasia/news/detail/24-07-2025-who-south-east-asia-launches-mental-health-dashboard-to-accelerate-and-strengthen-evidence-based-action";
const views = {
  india: {
    label: "India",
    eyebrow: "A CLOSER LOOK AT INDIA",
    amount: "150",
    unit: "million",
    caption: "people estimated to need active mental-health intervention",
    period: "NMHS · 2015–16",
    detail:
      "A national estimate from the 2015–16 survey, not a count of people diagnosed today.",
    source: indiaSource,
    sourceLabel: "Government of India · NMHS estimate",
    scope:
      "Mental disorders, including substance-use disorders; tobacco-use disorders excluded.",
    mapLabel: "India",
    statA: "10.6%",
    statALabel:
      "Current mental-disorder prevalence among adults aged 18+ in the survey",
    statB: "12 states",
    statBLabel: "Survey fieldwork across six regions of India",
    note: "“Current” refers to the survey’s assessment period in 2015–16. These figures do not measure workplace stress or describe every person’s experience.",
  },
  region: {
    label: "WHO South-East Asia",
    eyebrow: "A WIDER REGIONAL PERSPECTIVE",
    amount: "289",
    unit: "million",
    caption:
      "people estimated to live with a mental, neurological or substance-use condition",
    period: "WHO statement · 24 Jul 2025",
    detail:
      "The estimate reported by WHO in its July 2025 dashboard announcement; not a live count or a total for all of Asia.",
    source: whoSource,
    sourceLabel: "WHO · July 2025 announcement",
    scope:
      "A broader set of conditions than the India survey. The two totals should not be directly compared or added.",
    mapLabel: "WHO regional focus",
    statA: "2025",
    statALabel:
      "Publication year of the WHO announcement; the underlying data cover earlier periods",
    statB: "3 groups",
    statBLabel:
      "Mental, neurological and substance-use conditions included in this estimate",
    note: "WHO’s South-East Asia Region is an administrative health region, including India. It is not the same as geographic Southeast Asia or all of Asia.",
  },
};
export function RegionalWellbeing() {
  const [view, setView] = useState<keyof typeof views>("india");
  const selected = views[view];
  const id = useId().replace(/:/g, "");
  return (
    <section
      className="regional-wellbeing"
      aria-labelledby="regional-wellbeing-title"
      id="wellbeing-near-us"
    >
      <header className="regional-heading">
        <div>
          <span className="eyebrow">
            <Globe2 size={14} /> THE BIGGER PICTURE, CLOSER TO HOME
          </span>
          <h2 id="regional-wellbeing-title">
            Behind every number,
            <br />
            <em>there’s a person.</em>
          </h2>
        </div>
        <p>
          From a regional perspective to a closer look at India.
          <br />
          Understanding the need is one step towards making space for support.
        </p>
      </header>
      <div
        className="regional-view-controls"
        role="group"
        aria-label="Choose wellbeing geography"
      >
        {Object.entries(views).map(([key, item]) => (
          <button
            type="button"
            key={key}
            aria-pressed={view === key}
            aria-controls={`regional-figures-${id}`}
            onClick={() => setView(key as keyof typeof views)}
          >
            {key === "india" ? <MapPin size={15} /> : <Globe2 size={15} />}{" "}
            {item.label}
          </button>
        ))}
        <span>Published estimates · source dates shown</span>
      </div>
      <div className="regional-content regional-content-refresh">
        <div className="regional-human-panel">
          <span className="eyebrow">{view === "india" ? "INDIA IN FOCUS" : "A REGIONAL PERSPECTIVE"}</span>
          <div className="regional-human-photo-frame">
            <img
              src={view === "india" ? "/images/peer-support.jpg" : "/images/team-connection.jpg"}
              alt={view === "india" ? "People in a caring, supportive conversation" : "Team members supporting one another"}
              loading="lazy"
            />
            <div className="regional-photo-overlay">
              <span className="regional-photo-badge">
                <HeartHandshake size={14} /> Compassionate Peer Care
              </span>
            </div>
          </div>
          <h3>Real lives.<br /><em>Room for support.</em></h3>
          <p>Every number represents someone with a story. Making space to listen, connect and seek care starts with understanding.</p>
          <div className="regional-peer-avatars">
            <div className="avatar-stack">
              <img src="/images/student-wellness.jpg" alt="Peer guide" />
              <img src="/images/mindful-support.jpg" alt="Community buddy" />
              <img src="/images/corporate-wellness.jpg" alt="Wellness mentor" />
            </div>
            <div className="regional-peer-avatars-text">
              <strong>Dedicated listening circles</strong>
              <span>Safe, moderated spaces for any day</span>
            </div>
          </div>
          <div className="regional-study-card">
            <span>ABOUT THESE FIGURES</span>
            <strong>{view === "india" ? "National Mental Health Survey" : "WHO South-East Asia Region"}</strong>
            <p>{view === "india" ? "Survey period: 2015–16. National estimates, with fieldwork across 12 states." : "Published July 2025. A regional estimate covering mental, neurological and substance-use conditions."}</p>
          </div>
          <Link href="/psychologists" className="regional-care-link">Find support for you <ArrowUpRight size={18} /></Link>
        </div>
        <div
          className="regional-figures"
          id={`regional-figures-${id}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="regional-stat-image-banner">
            <img
              src={view === "india" ? "/images/community-friends-wide.jpg" : "/images/community-circle-wide.jpg"}
              alt="People connecting in supportive community circle"
              loading="lazy"
            />
            <div className="regional-stat-image-caption">
              <span className="regional-stat-image-badge">Support in Practice</span>
              <span>Connecting empathy to measurable clinical &amp; peer care</span>
            </div>
          </div>
          <span className="eyebrow">{selected.eyebrow}</span>
          <div className="regional-main-number">
            <strong>{selected.amount}</strong>
            <span>{selected.unit}</span>
          </div>
          <p className="regional-number-caption">{selected.caption}</p>
          <span className="regional-date">
            <span />
            {selected.period}
          </span>
          <p className="regional-estimate-detail">{selected.detail}</p>
          <div className="regional-supporting-stats visual-stat-cards">
            <div className="visual-stat-card">
              <div className="visual-stat-card-image">
                <img
                  src={view === "india" ? "/images/counseling-consultation.jpg" : "/images/corporate-wellness.jpg"}
                  alt="Clinical care consultation"
                  loading="lazy"
                />
                <span className="visual-stat-badge">Clinical Focus</span>
              </div>
              <div className="visual-stat-card-body">
                <strong>{selected.statA}</strong>
                <p>{selected.statALabel}</p>
                {view === "india" && (
                  <a
                    href={prevalenceSource}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Parliament reply ↗
                  </a>
                )}
              </div>
            </div>
            <div className="visual-stat-card">
              <div className="visual-stat-card-image">
                <img
                  src={view === "india" ? "/images/team-connection.jpg" : "/images/walk-together.webp"}
                  alt="Regional fieldwork and community connection"
                  loading="lazy"
                />
                <span className="visual-stat-badge">Field Coverage</span>
              </div>
              <div className="visual-stat-card-body">
                <strong>{selected.statB}</strong>
                <p>{selected.statBLabel}</p>
                {view === "india" && (
                  <a
                    href={surveySource}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NIMHANS survey ↗
                  </a>
                )}
              </div>
            </div>
          </div>
          <a
            className="regional-main-source"
            href={selected.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            {selected.sourceLabel}
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="regional-method-note">
        <Info size={16} />
        <div>
          <strong>A little context matters.</strong>
          <p>
            {selected.scope} {selected.note}
          </p>
          <p>
            Population estimates are not a personal assessment. Community
            connection can complement professional support.
          </p>
        </div>
      </div>
      <footer className="regional-support-footer">
        <div>
          <HeartHandshake size={25} />
          <span>
            <strong>Support starts with feeling seen.</strong>
            <small>
              A conversation, a shared interest, or a professional to talk to.
            </small>
          </span>
        </div>
        <Link href="/psychologists">
          Explore care <ArrowRight size={16} />
        </Link>
      </footer>
    </section>
  );
}
