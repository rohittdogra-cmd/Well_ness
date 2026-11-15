"use client";

import Link from "next/link";
import { HomeInterests } from "@/components/HomeInterests";
import { RegionalWellbeing } from "@/components/RegionalWellbeing";
import { HomeNextSteps } from "@/components/HomeNextSteps";
import { HomeReturnPanel } from "@/components/HomeReturnPanel";
import { ConnectionStory } from "@/components/ConnectionStory";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { StressArcade } from "@/components/StressArcade";
import { GlobalStressPulse } from "@/components/GlobalStressPulse";
import { ArrowUpRight, ArrowRight, Compass, Coffee, Gamepad2 } from "lucide-react";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { getCategory } from "@/lib/groupCategories";
import { getGroupImage } from "@/lib/groupImages";

export function HomePage() {
  const groups = useGroups();
  const { user } = useInternetIdentity();
  const joined =
    groups.data?.filter((g) =>
      g.group_members.some((m) => m.user_id === user?.id),
    ) ?? [];

  return (
    <div className="member-home">
      <header className="home-banner-edge">
        <Link href="/book-activities" className="take-a-break-banner">
          <span className="break-coffee" aria-hidden="true"><Coffee size={25} strokeWidth={1.6} /></span>
          <span className="break-banner-copy">Consider this your sign to <strong>take a little break.</strong></span>
          <span className="break-banner-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
        </Link>
      </header>
      <section className="home-campaign-hero live-community-hero">
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/user-banners/community-hero-mobile.webp" type="image/webp" />
          <source srcSet="/assets/user-banners/community-hero-wide.webp" type="image/webp" />
          <img
            className="community-hero-photo"
            src="/assets/user-banners/community-hero-wide.webp"
            alt="Friends enjoying a relaxed cafe and terrace table conversation with warm laughs"
            fetchPriority="high"
          />
        </picture>
        <div className="community-hero-copy">
          <h1>Your people. Your pause.<br /><span>Your kind of happy.</span></h1>
          <p>Find your circle. Share your interests. Make room for the moments that matter.</p>
          <Link href="/groups" className="community-hero-explore">Explore <ArrowRight size={24} /></Link>
        </div>
      </section>

      {/* 3. Global Workplace Stress Monitor (Data, Epidemic Scale & Vitals) */}
      <GlobalStressPulse />

      {user && <HomeReturnPanel />}

      {/* 4. The Daily De-Stress Arcade & Micro-Games Studio */}
      <StressArcade />

      <HomeNextSteps signedIn={!!user} />

      <RegionalWellbeing />

      <details className="connection-guide">
        <summary>
          New here? Find your first little connection <ArrowRight size={18} />
        </summary>
        <ConnectionStory />
      </details>

      <section className="live-welcome-banner" aria-labelledby="welcome-banner-title">
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/user-banners/welcome-mobile.webp" type="image/webp" />
          <source srcSet="/assets/user-banners/welcome-wide.webp" type="image/webp" />
          <img
            className="welcome-background"
            src="/assets/user-banners/welcome-wide.webp"
            alt="Friends enjoying sunny outdoor connection"
            loading="lazy"
          />
        </picture>
        <div className="welcome-live-copy">
          <h2 id="welcome-banner-title">Welcome to your<br />happy place!</h2>
          <p>A little time for yourself. A few new faces.<br />A whole lot of possibilities.</p>
          <Link href="/book-activities" className="welcome-explore">Explore activities <ArrowRight size={20} /></Link>
        </div>
      </section>
      <HomeInterests />

      {/* 7. Bottom Grid: Groups & Daily Check-In */}
      <div className={`home-bottom-grid ${user ? "" : "guest-home-bottom"}`}>
        <section className="your-groups circle-discovery">
          <div className="section-title">
            <div>
              <span className="eyebrow">YOUR NEXT LITTLE CONNECTION</span>
              <h2>{user ? "Your groups" : "Find your circle"}</h2>
              <p>
                {user
                  ? "Pick up where you left off. Your people are right here."
                  : "A few places to start. Explore at your own pace."}
              </p>
            </div>
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
          ) : (user ? joined : (groups.data ?? [])).length ? (
            (user ? joined : (groups.data ?? [])).slice(0, 4).map((g) => {
              const c = getCategory(g.category);
              return (
                <Link
                  className="your-group-row"
                  href={`/groups/${g.slug}`}
                  key={g.id}
                >
                  <span className="your-group-thumb">
                    <img src={getGroupImage(g.slug, g.category)} alt="" loading="lazy" />
                  </span>
                  <span className={c.color}>
                    <c.icon size={18} />
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
        {user && <DailyCheckIn />}
      </div>
      <footer className="home-banner-edge">
        <Link href="/book-activities" className="take-a-break-banner activities-footer-banner">
          <span className="break-coffee" aria-hidden="true"><Gamepad2 size={25} strokeWidth={1.6} /></span>
          <span className="break-banner-copy">Find activities. Meet people. <strong>Make memories.</strong></span>
          <span className="break-banner-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
        </Link>
      </footer>
    </div>
  );
}
