"use client";

import { useState } from "react";

export function AnimatedCat() {
  const [purring, setPurring] = useState(false);

  return (
    <div
      className={`animated-cat-walker ${purring ? "is-purring" : ""}`}
      onMouseEnter={() => setPurring(true)}
      onMouseLeave={() => setPurring(false)}
      onClick={() => setPurring((p) => !p)}
      role="img"
      aria-label="Mindful wellness companion cat strolling peacefully along the trail"
      title="Click or hover to pet me!"
    >
      <span className="cat-purr-bubble" aria-hidden="true">
        purr... 🐾
      </span>

      <svg
        viewBox="0 0 76 56"
        className="cat-svg-art"
        aria-hidden="true"
      >
        {/* Animated Tail */}
        <g className="cat-svg-tail-group">
          <path
            d="M17 37 C10 35, 4 27, 6 17 C7 12, 13 13, 11 18 C9 25, 14 29, 18 36 Z"
            fill="#eb8e4d"
          />
          {/* White Tail Tip */}
          <circle cx="8" cy="15" r="3.5" fill="#fff9f0" />
        </g>

        {/* Back Leg Far */}
        <g className="cat-paw-far-back">
          <path
            d="M21 38 L20 48 C20 50.5, 24 50.5, 24 48 L24 40 Z"
            fill="#d67b3e"
          />
          <ellipse cx="22" cy="49" rx="3.2" ry="1.8" fill="#fff9f0" />
        </g>

        {/* Front Leg Far */}
        <g className="cat-paw-far-front">
          <path
            d="M45 38 L44 48 C44 50.5, 48 50.5, 48 48 L48 40 Z"
            fill="#d67b3e"
          />
          <ellipse cx="46" cy="49" rx="3.2" ry="1.8" fill="#fff9f0" />
        </g>

        {/* Plump Cat Torso */}
        <path
          className="cat-torso"
          d="M16 35 C14 25, 22 21, 35 21 C48 21, 57 25, 57 35 C57 44, 47 45, 35 45 C21 45, 16 44, 16 35 Z"
          fill="#eb8e4d"
        />

        {/* Cream Belly */}
        <path
          d="M23 36 C27 30, 43 30, 47 36 C43 43, 27 43, 23 36 Z"
          fill="#fff9f0"
        />

        {/* Ginger Tabby Stripes */}
        <path
          d="M28 21 Q29 27 31 29"
          stroke="#b8632e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M34 21 Q35 28 37 30"
          stroke="#b8632e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M40 21 Q41 27 43 29"
          stroke="#b8632e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Back Leg Near */}
        <g className="cat-paw-near-back">
          <path
            d="M25 38 L25 50 C25 52.5, 29 52.5, 30 50 L30 40 Z"
            fill="#eb8e4d"
          />
          <ellipse cx="27.5" cy="51" rx="3.5" ry="2" fill="#fff9f0" />
        </g>

        {/* Front Leg Near */}
        <g className="cat-paw-near-front">
          <path
            d="M51 38 L51 50 C51 52.5, 55 52.5, 56 50 L56 40 Z"
            fill="#eb8e4d"
          />
          <ellipse cx="53.5" cy="51" rx="3.5" ry="2" fill="#fff9f0" />
        </g>

        {/* Cat Head */}
        <g className="cat-svg-head">
          <circle cx="56" cy="23" r="13.5" fill="#eb8e4d" />

          {/* Ears */}
          <path d="M47 16 L44 5 L53 11 Z" fill="#eb8e4d" />
          <path d="M47 14 L45 7 L51 11 Z" fill="#ffb4a2" />

          <path d="M59 11 L66 4 L65 15 Z" fill="#eb8e4d" />
          <path d="M60 11 L64 6 L64 14 Z" fill="#ffb4a2" />

          {/* Cheeks / Muzzle */}
          <ellipse cx="51.5" cy="27" rx="5.5" ry="4" fill="#fff9f0" />
          <ellipse cx="60.5" cy="27" rx="5.5" ry="4" fill="#fff9f0" />

          {/* Eyes with Blinking Animation */}
          <g className="cat-eyes-group">
            <ellipse cx="51.5" cy="21.5" rx="2" ry="2.6" fill="#1e342a" />
            <circle cx="52.2" cy="20.8" r="0.75" fill="#ffffff" />

            <ellipse cx="60.5" cy="21.5" rx="2" ry="2.6" fill="#1e342a" />
            <circle cx="61.2" cy="20.8" r="0.75" fill="#ffffff" />
          </g>

          {/* Tiny Pink Nose */}
          <polygon points="56,25 54.5,23.5 57.5,23.5" fill="#e87777" />

          {/* Gentle Smile */}
          <path
            d="M54.5 25.5 Q56 27.2 56 26.2 Q56 27.2 57.5 25.5"
            fill="none"
            stroke="#68412e"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <path
            d="M47 25 L36 24 M47 27 L37 28.5 M65 25 L76 24 M65 27 L75 28.5"
            stroke="#ffffff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="48" cy="26" rx="2.4" ry="1.4" fill="#fca5a5" opacity="0.6" />
          <ellipse cx="64" cy="26" rx="2.4" ry="1.4" fill="#fca5a5" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
