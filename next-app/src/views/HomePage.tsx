"use client";

import Link from "next/link";
import { ConnectionStory } from "@/components/ConnectionStory";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { StressArcade } from "@/components/StressArcade";
import { GlobalStressPulse } from "@/components/GlobalStressPulse";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  CalendarDays,
  MessageCircle,
  Compass,
  Gamepad2,
  Globe,
  Sparkles,
} from "lucide-react";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";

export function HomePage() {
  const groups = useGroups();
  const { user } = useInternetIdentity();
  const joined =
    groups.data?.filter((g) =>
      g.group_members.some((m) => m.user_id === user?.id),
    ) ?? [];

  return (
    <div className="member-home">
      {/* 2. Signature Connection Hero */}
      <section className="connection-hero">
        <div className="connection-copy">
          <span className="connection-kicker">
            <span /> LESS WORK MODE. MORE YOU.
          </span>
          <h1>
            Your people.
            <br />
            Your pause.
            <br />
            <em>Your kind of happy.</em>
          </h1>
          <p>
            A lunchtime walk. A badminton buddy. A conversation that just
            clicks. Make room for the things that make you, you.
          </p>
          <div className="connection-ctas">
            <Link className="wellness-button" href="/groups">
              Find your people <ArrowUpRight size={19} />
            </Link>
            <a href="#stress-arcade" className="text-action">
              Play De-Stress Games <ArrowRight size={17} />
            </a>
          </div>
          <div className="connection-footer">
            <span className="hero-mini-avatars">
              <img src="/images/student-wellness.jpg" alt="" />
              <img src="/images/mindful-support.jpg" alt="" />
              <img src="/images/community-hero.webp" alt="" />
            </span>
            <span>
              Different days. Shared interests.
              <br />
              <strong>There’s a little room for everyone.</strong>
            </span>
          </div>
        </div>
        <div className="connection-collage">
          <div className="hero-orbit" aria-hidden="true" />
          <span className="hero-spark" aria-hidden="true">
            ✳
          </span>
          <figure className="hero-photo-main">
            <img
              src="/images/walk-together.webp"
              alt="Friends enjoying a refreshing walk together outdoors"
              width="640"
              height="760"
            />
            <figcaption>
              <span>🌿</span> A walk. A chat. A fresh start.
            </figcaption>
          </figure>
          <figure className="hero-photo-small">
            <img
              src="/images/community-hero.webp"
              alt="A warm conversation with good company"
              width="360"
              height="300"
            />
            <figcaption>Good company, great energy.</figcaption>
          </figure>
          <div className="hero-floating-note">
            <span>☀</span>
            <div>
              <strong>Make time for your kind of good.</strong>
              <small>Your next connection starts here.</small>
            </div>
          </div>
          <span className="hero-interest-chip">
            <Users size={16} /> Find your circle
          </span>
        </div>
      </section>

      {/* 3. Global Workplace Stress Monitor (Data, Epidemic Scale & Vitals) */}
      <GlobalStressPulse />

      {/* 4. The Daily De-Stress Arcade & Micro-Games Studio */}
      <StressArcade />

      <ConnectionStory />

      {/* 5. Quick Action Cards */}
      <div className="quick-actions">
        <Link href="/people">
          <span className="mint">
            <Users size={22} />
          </span>
          <div>
            <h3>Meet people</h3>
            <p>Connect, then start a chat</p>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/book-activities">
          <span className="peach">
            <CalendarDays size={22} />
          </span>
          <div>
            <h3>Make a plan</h3>
            <p>Discover or host an activity</p>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/discuss">
          <span className="lilac">
            <MessageCircle size={22} />
          </span>
          <div>
            <h3>Join the conversation</h3>
            <p>Share a thought with the hub</p>
          </div>
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* 6. Interest Categories */}
      <section className="home-interests">
        <div className="section-title">
          <div>
            <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
            <h2>What’s your kind of good?</h2>
          </div>
          <Link className="text-action" href="/groups">
            View all groups <ArrowRight size={17} />
          </Link>
        </div>
        <div className="home-category-grid">
          {groupCategories.map((c) => (
            <Link
              key={c.id}
              href={`/groups?category=${c.id}`}
              className={`home-category ${c.color}`}
            >
              <c.icon size={25} />
              <h3>{c.name}</h3>
              <p>{c.examples}</p>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Bottom Grid: Groups & Daily Check-In */}
      <div className="home-bottom-grid">
        <section className="your-groups">
          <div className="section-title">
            <h2>Your groups</h2>
            <Link href="/groups" aria-label="Explore your groups">
              <ArrowUpRight size={20} />
            </Link>
          </div>
          {groups.isPending ? (
            <p>Loading your groups…</p>
          ) : groups.error ? (
            <div>
              <p>Couldn’t load your groups.</p>
              <button className="text-action" onClick={() => groups.refetch()}>
                Try again
              </button>
            </div>
          ) : joined.length ? (
            joined.slice(0, 4).map((g) => {
              const c = getCategory(g.category);
              return (
                <Link
                  className="your-group-row"
                  href={`/groups/${g.slug}`}
                  key={g.id}
                >
                  <span className={c.color}>
                    <c.icon size={20} />
                  </span>
                  <div>
                    <strong>{g.name}</strong>
                    <small>{c.name}</small>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              );
            })
          ) : (
            <div className="small-empty">
              <Compass size={30} />
              <h3>Find a place to start.</h3>
              <p>Join a subgroup and it will appear here for easy access.</p>
              <Link href="/groups" className="text-action">
                Find your first group <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
        <DailyCheckIn />
      </div>
    </div>
  );
}
