"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  CalendarDays,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import "../app/circlein.css";

import { Variants } from "framer-motion";

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const floatAnim: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export function HomePage() {
  const router = useRouter();
  const profile = useLocalProfile();
  // Only the groups this member has actually joined, filtered in Postgres.
  const groups = useGroups({ joinedOnly: true });
  const { user } = useInternetIdentity();
  const joined = groups.data?.pages.flat() ?? [];

  return (
    <div className="member-home">
      {user && profile ? (
        <h1 className="member-greeting">
          Good to see you, {profile.name.split(" ")[0]}.
        </h1>
      ) : (
        <h1 className="member-greeting">
          A calmer way to feel better at work.
        </h1>
      )}

      {/* ─── Responsive Hero Section ─── */}
      <motion.section 
        className="responsive-hero"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        {/* Background shapes */}
        <div className="circlein-bg-shape top-right"></div>
        <div className="circlein-bg-shape bottom-left"></div>

        <div className="hero-layout">
          
          {/* Left Text Column */}
          <div className="hero-text-col">
            <motion.div className="intro-badge" variants={fadeUp}>
              <span className="dot"></span> REAL PEOPLE. ANONYMOUSLY.
            </motion.div>

            <motion.h2 className="main-headline" variants={fadeUp}>
              Same<br />
              questions.<br />
              <span className="green-text">Different<br />people.</span>
              <div className="underline">
                <svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M5,15 Q100,5 195,15" stroke="#08783D" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
              </div>
              <motion.div 
                className="sparks"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 12L8 10M12 2L10 8" stroke="#111" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </motion.div>
            </motion.h2>

            <motion.p className="supporting-text" variants={fadeUp}>
              Talk anonymously, meet for coffee, plan a cricket match, find a study circle, or just connect with people who get it.
            </motion.p>

            <motion.div className="cta-wrapper" variants={fadeUp}>
              <Link href="/groups" className="main-cta">
                Find Your People <ArrowRight size={20} strokeWidth={2.5} />
              </Link>
            </motion.div>

            <motion.div className="feature-row" variants={fadeUp}>
              <div className="feature">
                <div className="circle"><MessageCircle size={22} strokeWidth={1.5} /></div>
                <span>Anonymous<br/>Conversations</span>
              </div>
              <div className="divider"></div>
              <div className="feature">
                <div className="circle"><Users size={22} strokeWidth={1.5} /></div>
                <span>Meet<br/>In-Person</span>
              </div>
              <div className="divider"></div>
              <div className="feature">
                <div className="circle"><Users size={22} strokeWidth={1.5} /></div>
                <span>Topic-Based<br/>Communities</span>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Column */}
          <div className="hero-visual-col">
            <motion.div className="photo-wrapper" variants={floatAnim}>
              <Image
                src="/images/community-hero.webp"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                alt="Friends at a cafe"
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority
              />
              <div className="photo-glow"></div>
              
              <div className="social-proof-panel">
                <div className="avatars">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" alt="User" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede" alt="User" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc" alt="User" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=b6e3f4" alt="User" />
                  <div className="count">+7</div>
                </div>
                <div className="text">
                  <strong>10K+ people</strong>
                  <span>finding real connections every day.</span>
                </div>
              </div>
              
              <div className="annotation">
                <span className="handwritten">Your<br/>People</span>
              </div>
            </motion.div>

            <motion.div 
              className="chat-card card-1" 
              variants={floatAnim} 
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/groups/health-wellness')}
              style={{ cursor: "pointer" }}
            >
              <div className="icon">☕</div>
              <span className="text">Coffee<br/>tomorrow?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
              <div className="card-annotation">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 20 Q10 20 20 2 L18 10 M20 2 L10 4" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                <span>Real<br/>conversations 🤍</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="chat-card card-2" 
              variants={floatAnim} 
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/groups/cricket')}
              style={{ cursor: "pointer" }}
            >
              <div className="icon">🏏</div>
              <span className="text">Cricket<br/>this weekend?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
            </motion.div>
            
            <motion.div 
              className="chat-card card-3" 
              variants={floatAnim} 
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/groups/music')}
              style={{ cursor: "pointer" }}
            >
              <div className="icon">📚</div>
              <span className="text">Study<br/>circle?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Quick Actions ─── */}
      <motion.div
        className="quick-actions"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
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

      {/* ─── Interest Categories ─── */}
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
          {groupCategories.map((c) => (
            <motion.div
              key={c.id}
              className="home-category"
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
            >
              <Link href={`/groups?category=${c.id}`}>
                <span className="cat-icon" style={{ background: c.color + "20", color: c.color }}>
                  <c.icon size={25} />
                </span>
                <h3>{c.name}</h3>
                <p>{c.examples}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ─── Your Groups ─── */}
      {joined.length > 0 && (
        <motion.section
          className="home-my-groups"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="section-title">
            <h2>Your Communities</h2>
          </div>
          <div className="home-bottom-grid">
            {joined.slice(0, 4).map((g, i) => {
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
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
