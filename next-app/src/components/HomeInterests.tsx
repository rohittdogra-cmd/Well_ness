"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { PointerEvent } from "react";
import { groupCategories } from "@/lib/groupCategories";

export function HomeInterests() {
  const reducedMotion = useReducedMotion();
  function followPointer(event: PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty("--spot-x", `${x * 100}%`);
    card.style.setProperty("--spot-y", `${y * 100}%`);
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
  }
  function resetPointer(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--spot-x", "50%");
    event.currentTarget.style.setProperty("--spot-y", "50%");
  }
  return (
    <section
      className="home-interests interest-discovery"
      aria-labelledby="interest-discovery-title"
      id="find-your-interest"
    >
      <header className="interest-discovery-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> FOLLOW YOUR CURIOSITY
          </span>
          <h2 id="interest-discovery-title">
            What’s your kind <em>of good?</em>
          </h2>
          <p>A shared interest can be the start of something lovely.</p>
        </div>
        <Link className="interest-view-all" href="/groups">
          View all groups{" "}
          <span>
            <ArrowRight size={18} />
          </span>
        </Link>
      </header>
      <div className="interest-discovery-grid">
        {groupCategories.map((category, index) => (
          <motion.div
            key={category.id}
            className="interest-motion-item"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: reducedMotion ? 0 : 0.48,
              delay: reducedMotion ? 0 : Math.min(index * 0.06, 0.24),
              ease: "easeOut",
            }}
          >
            <Link
              className={`interest-card interest-${category.color}`}
              href={`/groups?category=${category.id}`}
              aria-label={`${category.name} ${category.examples}`}
              aria-describedby={`interest-description-${category.id}`}
              onPointerMove={followPointer}
              onPointerLeave={resetPointer}
            >
              <span className="interest-orbit" aria-hidden="true" />
              <category.icon
                className="interest-ghost"
                size={125}
                strokeWidth={0.8}
                aria-hidden="true"
              />
              <div className="interest-card-top">
                <span className="interest-icon">
                  <category.icon size={26} strokeWidth={1.6} />
                </span>
                <span className="interest-card-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="interest-card-copy">
                <h3>{category.name}</h3>
                <p id={`interest-description-${category.id}`}>
                  {category.description}
                </p>
                <div className="interest-examples" aria-hidden="true">
                  {category.examples.split(" · ").map((example) => (
                    <span key={example}>{example}</span>
                  ))}
                </div>
              </div>
              <div className="interest-card-footer">
                <span>Find your circle</span>
                <span className="interest-card-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="interest-discovery-note">
        <span /> Explore a little. Find what feels like you.
      </p>
    </section>
  );
}
