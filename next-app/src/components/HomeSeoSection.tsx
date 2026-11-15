"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Gamepad2,
  HeartHandshake,
  Activity,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What is Stress Unwind?",
    a: "Stress Unwind is the premier corporate and community wellness platform designed to alleviate workplace burnout, loneliness, and chronic stress. It combines peer interest circles (like sports, creative arts, and mindful meetups), daily micro-break arcade games, and confidential 1-on-1 counseling with licensed psychologists.",
  },
  {
    q: "How does Stress Unwind help reduce workplace stress?",
    a: "Stress Unwind addresses stress through both community connection and scientific micro-breaks. Whether you take a 5-minute pause with our interactive arcade, join a casual coffee chat circle, play box cricket or pickleball with colleagues, or consult a therapist, the platform offers immediate, judgment-free stress relief.",
  },
  {
    q: "Are 1-on-1 counseling sessions confidential?",
    a: "Yes, 100%. All therapy and psychological counseling sessions on Stress Unwind are private, encrypted, and conducted strictly between you and verified, licensed mental health professionals. Employers and peer members never receive any personal session details.",
  },
  {
    q: "How do I join a wellness circle or activity on Stress Unwind?",
    a: "Explore our 30+ peer circles across sports, creative arts, and wellness. Click into any circle (such as Cricket, Yoga, Book Club, or Chai Pe Charcha) to RSVP for upcoming sessions, chat with members, and participate in local or virtual meetups.",
  },
  {
    q: "Can organizations and teams partner with Stress Unwind?",
    a: "Yes! Stress Unwind offers tailored corporate wellness memberships that help HR leaders and team managers monitor workplace wellbeing vitals, provide subsidized counseling care, and foster authentic team camaraderie.",
  },
];

const PILLARS = [
  {
    icon: Users,
    title: "30+ Peer Wellness Circles",
    description:
      "Find your tribe across badminton, cricket, yoga, book clubs, hiking, and creative arts. Never feel isolated at work again.",
    href: "/groups",
    badge: "Community",
  },
  {
    icon: Gamepad2,
    title: "Daily De-Stress Arcade",
    description:
      "Scientifically structured 2-minute micro-breaks and focus puzzles engineered to break stress cycles and lower cortisol.",
    href: "/#arcade",
    badge: "Micro-Breaks",
  },
  {
    icon: HeartHandshake,
    title: "Verified 1-on-1 Counseling",
    description:
      "Confidential therapy and clinical psychology sessions with certified experts who understand corporate stressors.",
    href: "/psychologists",
    badge: "Clinical Care",
  },
  {
    icon: Activity,
    title: "Real-Time Wellbeing Pulse",
    description:
      "Interactive workplace stress trackers and community check-ins that encourage emotional openness without stigma.",
    href: "/discuss",
    badge: "Insights",
  },
];

export function HomeSeoSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="home-seo-hub" aria-labelledby="seo-hub-heading">
      <div className="home-seo-container">
        {/* Header */}
        <div className="home-seo-header">
          <div className="home-seo-pill">
            <Sparkles size={14} className="text-amber-500" />
            <span>THE COMPLETE WELLNESS ECOSYSTEM</span>
          </div>
          <h2 id="seo-hub-heading">
            Why Professionals Choose <strong>Stress Unwind</strong>
          </h2>
          <p className="home-seo-subtitle">
            Modern workplaces demand sustainable wellbeing. Stress Unwind brings together
            social connection, daily mental pauses, active movement, and professional care in
            one seamless platform.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="home-seo-pillars-grid">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="home-seo-pillar-card">
                <div className="home-seo-pillar-top">
                  <div className="home-seo-pillar-icon">
                    <Icon size={24} />
                  </div>
                  <span className="home-seo-pillar-badge">{p.badge}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <Link href={p.href} className="home-seo-pillar-link">
                  Learn more <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="home-seo-trust-banner">
          <div className="trust-item">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span>100% Confidential & Secure Care</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={20} className="text-blue-600" />
            <span>Licensed & Verified Psychologists</span>
          </div>
          <div className="trust-item">
            <Users size={20} className="text-purple-600" />
            <span>Active Corporate Community</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="home-seo-faq-wrapper">
          <div className="home-seo-faq-header">
            <span className="faq-eyebrow">COMMON QUESTIONS</span>
            <h3>Frequently Asked Questions About Stress Unwind</h3>
            <p>Everything you need to know about unwinding, joining groups, and finding care.</p>
          </div>

          <div className="home-seo-faq-list">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className={`home-seo-faq-item ${isOpen ? "faq-open" : ""}`}
                >
                  <button
                    type="button"
                    className="home-seo-faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`faq-chevron ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="home-seo-faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="home-seo-cta-banner">
          <div className="home-seo-cta-copy">
            <h3>Ready to unwind and feel your best?</h3>
            <p>Join thousands of professionals reclaiming their calm and connection today.</p>
          </div>
          <div className="home-seo-cta-actions">
            <Link href="/groups" className="wellness-button cta-btn-primary">
              Explore Wellness Circles <ArrowRight size={17} />
            </Link>
            <Link href="/psychologists" className="cta-btn-secondary">
              Book Counseling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
