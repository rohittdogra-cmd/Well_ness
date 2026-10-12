"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Users, Shield, Sparkles, Coffee, Compass } from "lucide-react";

export function AboutPage() {
  return (
    <div className="hub-page about-page">
      {/* Hero */}
      <header className="activity-hero mb-12">
        <div>
          <span className="eyebrow">THE HUMAN SIDE OF WORK</span>
          <h1>
            A calmer way to
            <br />
            <em>connect & belong.</em>
          </h1>
          <p>
            Modern work solved communication tools, but created deeper loneliness.
            stress-unwind was founded to bring back authentic human connection:
            small mindful moments, shared passions, and real peer support without judgment.
          </p>
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <Link className="wellness-button" href="/groups">
              Explore Groups <ArrowRight size={16} />
            </Link>
            <Link className="text-action" href="/contact">
              Contact our team →
            </Link>
          </div>
        </div>
        <div className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-border">
          <Image
            src="/images/walk-together.webp"
            alt="Colleagues walking and talking together"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </header>

      {/* The Impact in Numbers */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="eyebrow">REAL IMPACT</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Connection transforms how we feel at work
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Independent workplace studies and platform engagement data show the tangible power of peer belonging.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary font-display mb-1">
              76%
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Lower Burnout
            </h3>
            <p className="text-xs text-muted-foreground">
              Reported by members who attend at least two peer meetups monthly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary font-display mb-1">
              15K+
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Connections Made
            </h3>
            <p className="text-xs text-muted-foreground">
              Across tea breaks, book clubs, sports circles, and support chats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary font-display mb-1">
              120+
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Interest Circles
            </h3>
            <p className="text-xs text-muted-foreground">
              Spanning sports, mindfulness, coding, arts, reading, and wellness.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-primary font-display mb-1">
              100%
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Safe & Confidential
            </h3>
            <p className="text-xs text-muted-foreground">
              Anonymous alias support and private 1-on-1 therapist sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Our 4 Core Principles */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">
          What makes stress-unwind different
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <article className="provider-card">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              People, Not Just Productivity
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We provide space for you to show up as a whole human being, not just a job title or calendar slot.
            </p>
          </article>

          <article className="provider-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              Psychological Safety First
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share honest thoughts under quiet aliases. Zero tracking by managers and no workplace surveillance.
            </p>
          </article>

          <article className="provider-card">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              Real Life & Hybrid Friendly
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              From online chill lounges to rooftop chai meetups, cricket leagues, and city photo-walks.
            </p>
          </article>
        </div>
      </section>

      {/* Action CTA Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/20 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Ready to experience a better workplace?
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Start exploring communities, host an activity, or connect with licensed therapists today.
        </p>
        <div className="flex justify-center gap-3 pt-2 flex-wrap">
          <Link className="wellness-button" href="/groups">
            Browse Groups <ArrowRight size={16} />
          </Link>
          <Link className="wellness-button secondary" href="/book-activities">
            Browse Activities
          </Link>
          <Link className="wellness-button secondary" href="/contact">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
