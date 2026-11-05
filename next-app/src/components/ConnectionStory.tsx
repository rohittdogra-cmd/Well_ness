"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Music2,
  Pause,
  Play,
  Quote,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Mascot } from "./Mascot";

const interests = [
  {
    name: "Badminton",
    icon: Trophy,
    plan: "A friendly doubles game",
    when: "After work · On the court",
    hello: "Up for a few friendly rallies?",
    reply: "Count me in. No scorekeeping!",
    group: "The after-work crew",
  },
  {
    name: "Coffee",
    icon: Coffee,
    plan: "A coffee, away from the screen",
    when: "Lunch break · At the café",
    hello: "Coffee and a proper screen break?",
    reply: "Yes please. See you at lunch!",
    group: "The coffee-break circle",
  },
  {
    name: "Music",
    icon: Music2,
    plan: "A little listening session",
    when: "This weekend · Good company",
    hello: "Want to swap a few favourite tracks?",
    reply: "Absolutely. I have a whole playlist.",
    group: "The good-listening club",
  },
];
const chapters = [
  {
    title: "Start with your kind of thing.",
    short: "Find a spark",
    text: "Pick an interest. Explore groups and people who enjoy the same little things you do.",
    href: "/groups",
    cta: "Explore your interests",
  },
  {
    title: "Turn a shared interest into hello.",
    short: "Say hello",
    text: "Send a connection request. When your request is accepted, your conversation can begin. Verify your profile to connect and chat.",
    href: "/people",
    cta: "Meet the community",
  },
  {
    title: "Make a little plan. Make a memory.",
    short: "Show up",
    text: "Join an activity or host one of your own. A shared moment is a lovely place to start.",
    href: "/book-activities",
    cta: "Find your next plan",
  },
];
const stories = [
  {
    title: "The lunchtime walker",
    interest: "A little fresh air",
    quote:
      "I came for a break from my screen. I stayed for the conversations on the way back.",
    avatar: 1,
    color: "mint",
  },
  {
    title: "The after-work player",
    interest: "A game, and a new circle",
    quote:
      "A shared badminton court made saying hello feel easier than another introduction at work.",
    avatar: 2,
    color: "peach",
  },
  {
    title: "The quiet first-timer",
    interest: "Finding a place to belong",
    quote:
      "It helped to start with something we both enjoyed. The conversation followed from there.",
    avatar: 3,
    color: "lilac",
  },
];

export function ConnectionStory() {
  const [chapter, setChapter] = useState(0);
  const [interest, setInterest] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const reducedMotion = useReducedMotion();
  const topic = interests[interest];
  const current = chapters[chapter];
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setChapter((value) => (value + 1) % chapters.length),
      5500,
    );
    return () => clearInterval(timer);
  }, [playing]);
  function chooseChapter(index: number) {
    setChapter(index);
    setPlaying(false);
  }
  const animate = reducedMotion ? { duration: 0 } : { duration: 0.35 };

  return (
    <>
      <section
        className="connection-story"
        aria-labelledby="connection-story-title"
        id="how-we-connect"
      >
        <header className="story-heading">
          <div>
            <span className="eyebrow">SMALL STARTS. REAL POSSIBILITIES.</span>
            <h2 id="connection-story-title">
              From “same here”
              <br />
              to <em>“see you there.”</em>
            </h2>
          </div>
          <p>
            No perfect introductions needed.
            <br />
            Just a shared interest and a little curiosity.
          </p>
        </header>
        <div className="connection-story-grid">
          <div className="story-narrative">
            <div
              className="story-chapters"
              role="group"
              aria-label="Connection story chapters"
            >
              {chapters.map((item, index) => (
                <button
                  key={item.short}
                  type="button"
                  aria-pressed={chapter === index}
                  aria-controls="connection-scene"
                  onClick={() => chooseChapter(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.short}</strong>
                  {chapter === index && <ArrowRight size={15} />}
                </button>
              ))}
            </div>
            <div className="story-explanation">
              <span className="story-chapter-label">
                CHAPTER {chapter + 1} / 3
              </span>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <Link href={current.href}>
                {current.cta} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="story-playback">
              <button
                type="button"
                aria-pressed={playing}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}{" "}
                {playing ? "Pause story" : "Play the story"}
              </button>
              <span>Go at your own pace</span>
            </div>
          </div>
          <div
            className={`connection-scene scene-${chapter}`}
            id="connection-scene"
            aria-label={`Chapter ${chapter + 1}: ${current.short}`}
          >
            <div className="scene-topline">
              <span>
                <Sparkles size={13} /> A LITTLE CONNECTION STORY
              </span>
              <small>Illustrated example</small>
            </div>
            <div
              className="scene-interests"
              role="group"
              aria-label="Try a shared interest"
            >
              {interests.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={interest === index}
                  onClick={() => setInterest(index)}
                >
                  <item.icon size={13} />
                  {item.name}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${chapter}-${interest}`}
                className="scene-content"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
                transition={animate}
              >
                <div className="scene-people" aria-hidden="true">
                  <svg className="scene-thread" viewBox="0 0 400 100">
                    <motion.path
                      d="M35 58 C110 -4 145 110 205 53 S310 10 365 55"
                      fill="none"
                      stroke="#a2bdb1"
                      strokeWidth="2"
                      strokeDasharray="5 7"
                      initial={{ pathLength: reducedMotion ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reducedMotion ? 0 : 1.2 }}
                    />
                  </svg>
                  <div className="scene-person person-you">
                    <Mascot variant={0} />
                    <span>You</span>
                  </div>
                  <span className="scene-shared">
                    <topic.icon size={23} />
                    {chapter === 1 ? (
                      <small>
                        <Check size={10} /> Connected
                      </small>
                    ) : (
                      <small>{topic.name}</small>
                    )}
                  </span>
                  <div className="scene-person person-them">
                    <Mascot variant={1} />
                    <span>Your kind of people</span>
                  </div>
                </div>
                {chapter === 0 ? (
                  <div className="scene-discovery">
                    <span className="scene-caption">
                      A SHARED INTEREST IS A START
                    </span>
                    <h4>{topic.group}</h4>
                    <p>Different days. One thing in common.</p>
                    <div className="scene-common">
                      <Check size={13} /> You both enjoy{" "}
                      {topic.name.toLowerCase()}
                    </div>
                  </div>
                ) : chapter === 1 ? (
                  <div className="scene-chat">
                    <div>
                      <span>You</span>
                      <p>{topic.hello}</p>
                    </div>
                    <div>
                      <span>A new connection</span>
                      <p>{topic.reply}</p>
                    </div>
                    <small>
                      <Check size={12} /> A mutual connection. A conversation on
                      your terms.
                    </small>
                  </div>
                ) : (
                  <div className="scene-plan">
                    <span className="scene-date">
                      <strong>LET’S</strong>MAKE TIME
                    </span>
                    <div>
                      <small>YOUR NEXT LITTLE PLAN</small>
                      <h4>{topic.plan}</h4>
                      <p>{topic.when}</p>
                      <span>
                        <Users size={13} /> Good company starts here
                      </span>
                    </div>
                    <Check size={18} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="scene-bottom">
              <span>One interest</span>
              <i />
              <span>One hello</span>
              <i />
              <span>A little more belonging</span>
            </div>
            <div className="story-mobile-controls">
              <button
                type="button"
                aria-label="Previous story chapter"
                onClick={() => chooseChapter((chapter + 2) % 3)}
              >
                <ChevronLeft size={16} />
              </button>
              <span>{chapter + 1} of 3</span>
              <button
                type="button"
                aria-label="Next story chapter"
                onClick={() => chooseChapter((chapter + 1) % 3)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section
        className="member-stories"
        aria-labelledby="member-stories-title"
      >
        <header className="story-heading">
          <div>
            <span className="eyebrow">THE LITTLE MOMENTS THAT MATTER</span>
            <h2 id="member-stories-title">
              A shared moment.
              <br />
              <em>A different kind of day.</em>
            </h2>
          </div>
          <div className="stories-disclosure">
            <span>Illustrative testimonials</span>
            <p>
              Sample stories showing what connection could feel like.
              <br />
              These are not verified member reviews.
            </p>
          </div>
        </header>
        <div className="testimonial-grid">
          {stories.map((story, index) => (
            <figure
              className={`testimonial-card ${story.color} ${testimonial === index ? "is-selected" : ""}`}
              key={story.title}
            >
              <Quote size={24} aria-hidden="true" />
              <blockquote>{story.quote}</blockquote>
              <figcaption>
                <span>
                  <Mascot variant={story.avatar} />
                </span>
                <div>
                  <strong>{story.title}</strong>
                  <small>{story.interest}</small>
                </div>
                <span className="sample-quote-label">Sample</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="testimonial-controls">
          <div
            className="testimonial-dots"
            role="group"
            aria-label="Choose a sample story"
          >
            {stories.map((story, index) => (
              <button
                type="button"
                key={story.title}
                aria-label={`Show ${story.title}`}
                aria-pressed={testimonial === index}
                onClick={() => setTestimonial(index)}
              />
            ))}
          </div>
          <span>
            {testimonial + 1} / {stories.length}
          </span>
          <button
            type="button"
            aria-label="Previous sample story"
            onClick={() => setTestimonial((testimonial + 2) % 3)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next sample story"
            onClick={() => setTestimonial((testimonial + 1) % 3)}
          >
            <ChevronRight size={17} />
          </button>
          <Link href="/groups">
            Find your own little moment <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
