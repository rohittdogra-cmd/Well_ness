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
import { asiaCountries } from "@/data/asiaMap";
const indiaSource = "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1554374";
const prevalenceSource =
  "https://sansad.in/getFile/annex/253/A114.pdf?source=pqars";
const surveySource =
  "https://indianmhs.nimhans.ac.in/phase1/detailed-news.php?eid=6";
const whoSource =
  "https://www.who.int/southeastasia/news/detail/24-07-2025-who-south-east-asia-launches-mental-health-dashboard-to-accelerate-and-strengthen-evidence-based-action";
// WHO South-East Asia membership shown by WHO at source review, November 2026.
// This is a source geography, not all of Asia or the geographic ASEAN region.
const whoCountries = new Set([
  "BGD",
  "BTN",
  "PRK",
  "IND",
  "MDV",
  "MMR",
  "NPL",
  "LKA",
  "THA",
  "TLS",
]);
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
      <div className="regional-content">
        <div className="regional-map-panel">
          <div className="regional-map-top">
            <span>ASIA / REGIONAL CONTEXT</span>
            <span>
              <i /> {selected.mapLabel}
            </span>
          </div>
          <svg
            className="wellbeing-asia-map"
            viewBox="0 0 640 435"
            role="img"
            aria-labelledby={`map-title-${id} map-desc-${id}`}
          >
            <title id={`map-title-${id}`}>
              {view === "india"
                ? "Map of Asia with India highlighted"
                : "Map highlighting the WHO South-East Asia regional focus"}
            </title>
            <desc id={`map-desc-${id}`}>
              The shading identifies geography only. No country-level prevalence
              or individual locations are plotted. Use the geography buttons to
              change the published statistics.
            </desc>
            <defs>
              <clipPath id={`map-clip-${id}`}>
                <rect width="640" height="435" rx="10" />
              </clipPath>
              <pattern
                id={`map-dots-${id}`}
                width="17"
                height="17"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r=".7" fill="#c7d7cd" />
              </pattern>
            </defs>
            <rect width="640" height="435" fill={`url(#map-dots-${id})`} />
            <g clipPath={`url(#map-clip-${id})`} aria-hidden="true">
              {asiaCountries.map((country) => (
                <path
                  key={country.id}
                  d={country.d}
                  className={`regional-country ${country.id === "IND" && view === "india" ? "country-india" : ""} ${(view === "india" ? country.id === "IND" : whoCountries.has(country.id)) ? "is-highlighted" : ""}`}
                >
                  <title>{country.name}</title>
                </path>
              ))}
              {view === "region" && (
                <circle
                  cx="188.4"
                  cy="325"
                  r="2.5"
                  className="regional-island-marker"
                />
              )}
              <text x="246" y="130" className="map-context-label">
                ASIA
              </text>
              <text
                x="210"
                y="228"
                className={`map-india-label ${view === "india" ? "is-selected" : ""}`}
              >
                INDIA
              </text>
              <text x="280" y="375" className="map-water-label">
                INDIAN OCEAN
              </text>
            </g>
          </svg>
          <div className="regional-map-note">
            <MapPin size={15} />
            <p>
              {view === "india"
                ? "India in focus. The figures describe a national survey estimate, not a state-by-state breakdown."
                : "The highlighted countries show WHO’s regional focus. No country-by-country totals are implied."}
            </p>
          </div>
          <div className="regional-map-credit">
            <span>Geography, not a prevalence heatmap</span>
            <a
              href="https://www.naturalearthdata.com/about/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Map: Natural Earth ↗
            </a>
          </div>
        </div>
        <div
          className="regional-figures"
          id={`regional-figures-${id}`}
          aria-live="polite"
          aria-atomic="true"
        >
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
          <div className="regional-supporting-stats">
            <div>
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
            <div>
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
