"use client";
import Link from "next/link";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { RowSkeleton } from "@/components/Skeleton";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  CalendarDays,
  MessageCircle,
  Sparkles,
  Compass,
  Zap,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function HomePage() {
  const profile = useLocalProfile();
  const groups = useGroups();
  const { user } = useInternetIdentity();
  const joined =
    groups.data?.filter((g) =>
      g.group_members.some((m) => m.user_id === user?.id),
    ) ?? [];

  const greeting = getGreeting();
  const firstName = profile?.name ? profile.name.split(" ")[0] : "";

  return (
    <div className="member-home">
      {/* ─── Animated Greeting ─── */}
      <motion.header
        className="member-greeting"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            YOUR DAILY DOSE OF CONNECTION
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {greeting}
            {firstName ? (
              <>, <span className="gradient-text-warm">{firstName}</span></>
            ) : ""}.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            Make a little time for the things—and people—you enjoy.
          </motion.p>
        </div>
        <motion.span
          className="greeting-mark"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 15 }}
        >
          <Sparkles size={27} />
        </motion.span>
      </motion.header>

      {/* ─── Hero Banner ─── */}
      <motion.section
        className="member-hero"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <motion.span
            className="hero-pill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span /> YOUR NEXT GOOD THING
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            Less scrolling.
            <br />
            <em className="gradient-text-hero">More belonging.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            Find your weekend team, your study circle, or someone who gets your
            favourite hobby.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <Link className="wellness-button" href="/groups">
              Explore your interests <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </div>
        <div className="member-hero-image">
          <img
            src="/images/community-hero.webp"
            alt="Friends taking a break together outdoors"
            width="1000"
            height="560"
          />
          <span>
            <Users size={18} /> Better with good company.
          </span>
        </div>
      </motion.section>

      {/* ─── Quick Actions with stagger ─── */}
      <motion.div
        className="quick-actions"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {[
          { href: "/people", icon: Users, color: "mint", title: "Meet people", desc: "Connect, then start a chat" },
          { href: "/book-activities", icon: CalendarDays, color: "peach", title: "Make a plan", desc: "Discover or host an activity" },
          { href: "/discuss", icon: MessageCircle, color: "lilac", title: "Join the conversation", desc: "Share a thought with the hub" },
        ].map((action) => (
          <motion.div key={action.href} variants={fadeUp}>
            <Link href={action.href}>
              <span className={action.color}>
                <action.icon size={22} />
              </span>
              <div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Interest Categories with stagger ─── */}
      <motion.section
        className="home-interests"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
            <h2>What&apos;s your kind of <span className="gradient-text-warm">good</span>?</h2>
          </div>
          <Link className="text-action animated-underline" href="/groups">
            View all groups <ArrowRight size={17} />
          </Link>
        </div>
        <motion.div
          className="home-category-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-30px" }}
        >
          {groupCategories.map((c, i) => (
            <motion.div
              key={c.id}
              variants={fadeUp}
            >
              <Link
                href={`/groups?category=${c.id}`}
                className={`home-category stagger-item ${c.color}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <c.icon size={25} />
                <h3>{c.name}</h3>
                <p>{c.examples}</p>
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ─── Your Groups + Daily Check-in ─── */}
      <motion.div
        className="home-bottom-grid"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <section className="your-groups">
          <div className="section-title">
            <h2>Your groups</h2>
            <Link href="/groups" aria-label="Explore your groups">
              <ArrowUpRight size={20} />
            </Link>
          </div>
          {groups.isPending ? (
            <RowSkeleton count={3} />
          ) : groups.error ? (
            <div>
              <p>Couldn&apos;t load your groups.</p>
              <button className="text-action" onClick={() => groups.refetch()}>
                Try again
              </button>
            </div>
          ) : joined.length ? (
            joined.slice(0, 4).map((g, i) => {
              const c = getCategory(g.category);
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    className="your-group-row"
                    href={`/groups/${g.slug}`}
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
                </motion.div>
              );
            })
          ) : (
            <div className="small-empty">
              <Compass size={30} />
              <h3>Find a place to start.</h3>
              <p>Join a subgroup and it will appear here for easy access.</p>
              <Link href="/groups" className="text-action animated-underline">
                Find your first group <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
        <DailyCheckIn />
      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
