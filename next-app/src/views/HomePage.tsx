"use client";

import { motion, type Variants } from "framer-motion";
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
  Stethoscope,
  Tag,
  Sparkles,
  Star,
  Activity,
  Heart,
} from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import { useLiveOffers } from "@/lib/liveDataManager";
export { getStoredAppointments, saveAppointment, type BookedAppointment } from "@/lib/appointments";
import "../app/circlein.css";

const TESTIMONIALS = [
  {
    quote: "I was on the verge of burnout after endless release sprints. Joining the weekend Box Cricket and Sunday Chai meetup felt like exhaling after months of holding my breath. No office politics, just real people having fun.",
    name: "Rohan Mehta",
    role: "Senior Software Engineer · Gurgaon",
    tag: "🏏 Box Cricket",
    href: "/groups/cricket",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan&backgroundColor=b6e3f4",
    stars: 5,
  },
  {
    quote: "Being able to talk anonymously about imposter syndrome and panic attacks with people who truly get it was life-saving. I didn't have to put on a brave corporate face or worry about reviews.",
    name: "Ananya Sen",
    role: "Product Designer · Bangalore",
    tag: "💬 Anonymous Peer Support",
    href: "/discuss",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=ffd5dc",
    stars: 5,
  },
  {
    quote: "Our team used to do awkward Zoom happy hours nobody wanted to attend. Since finding Well_ness, our people organically joined Cyber Hub coffee circles and badminton games. Morale skyrocketed.",
    name: "Karan Verma",
    role: "Engineering Director · CyberCity",
    tag: "☕ Cyber Hub Cafes",
    href: "/groups/cyber-hub-cafes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan&backgroundColor=c0aede",
    stars: 5,
  },
  {
    quote: "Clinical therapy works best when reinforced by daily social belonging. Well_ness bridges the gap between 1-on-1 mental health consultations and informal sports or study circles. The outcomes are remarkable.",
    name: "Dr. Sarah Jenkins, Ph.D.",
    role: "Senior Clinical Psychologist",
    tag: "🩺 Licensed Practitioner",
    href: "/therapy",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80",
    stars: 5,
  },
  {
    quote: "The Aravali Sunday morning trek group turned our Monday mornings from dread into something to genuinely look forward to. The 100% employer-blind confidentiality gives everyone complete peace of mind.",
    name: "Pooja Kashyap",
    role: "People Operations Lead",
    tag: "🌲 Aravali Treks",
    href: "/groups/aravali-treks",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja&backgroundColor=d1fae5",
    stars: 5,
  },
  {
    quote: "I booked a 1-on-1 counseling session using the corporate promo code in under two minutes. Talking to Dr. Amit helped me untangle chronic insomnia and work stress without any corporate paperwork.",
    name: "Dev Patel",
    role: "Senior Financial Analyst · Mumbai",
    tag: "🌿 Confidential Therapy",
    href: "/therapy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev&backgroundColor=fef3c7",
    stars: 5,
  },
  {
    quote: "I relocated to Gurgaon and knew nobody outside my team pod. The Coding Study Circle and evening walks gave me lifelong friends who turned into chosen family.",
    name: "Sneha Roy",
    role: "Frontend Developer",
    tag: "📚 Study Circle & Walks",
    href: "/groups/coding",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha&backgroundColor=b6e3f4",
    stars: 5,
  },
];

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
  // Only the groups this member has actually joined, filtered in Postgres / local storage.
  const groups = useGroups({ joinedOnly: true });
  const { user } = useInternetIdentity();
  const { activeOffers } = useLiveOffers();
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

      {/* ─── Live Special Offers & Corporate Wellness Banner ─── */}
      {activeOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 sm:p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Tag size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {activeOffers[0].title}
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                  {activeOffers[0].discount}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use code <code className="font-mono font-bold text-emerald-800 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">{activeOffers[0].code}</code> · {activeOffers[0].description}
              </p>
            </div>
          </div>

          <Link
            href="/therapy"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto bg-background/80 hover:bg-background px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all shadow-xs"
          >
            Redeem Offer <ArrowRight size={14} />
          </Link>
        </motion.div>
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
              onClick={() => router.push('/groups/cyber-hub-cafes')}
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
              onClick={() => router.push('/groups/coding')}
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
          { href: "/therapy", icon: Stethoscope, color: "mint", title: "Talk to a Doctor", desc: "Confidential therapy & support" },
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
                {(c as any).image && (
                  <div style={{ position: "relative", width: "100%", height: "100px", marginBottom: "12px", borderRadius: "8px", overflow: "hidden", background: "#e8edea" }}>
                    <Image src={(c as any).image} alt={c.name} fill style={{ objectFit: "cover" }} />
                  </div>
                )}
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

      {/* ─── Workplace Wellness Crisis vs. Well_ness Impact ─── */}
      <motion.section
        className="impact-section"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="impact-heading">
          <span className="eyebrow">THE REALITY &amp; OUR IMPACT</span>
          <h2>From Silent Burnout to Everyday Belonging</h2>
          <p>
            Modern workplaces demand relentless productivity. Here is what corporate employees face in isolation — and how our anonymous community turns the curve.
          </p>
        </div>

        <div className="impact-grid">
          {/* Left Column: The Silent Crisis */}
          <div className="impact-card struggle">
            <div className="impact-card-header">
              <div className="impact-icon-badge">⚠️</div>
              <div>
                <h3>The Silent Struggle</h3>
                <span>What modern professionals endure in silence</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">76%</div>
              <div className="stat-info">
                <strong>Suffer from chronic burnout &amp; anxiety</strong>
                <p>Over 3 in 4 corporate workers report persistent mental fatigue, sleeplessness, and Sunday-night anxiety.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">58%</div>
              <div className="stat-info">
                <strong>Feel completely isolated at work</strong>
                <p>Fear of appearing vulnerable or impacting career appraisals prevents professionals from sharing struggles with peers.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">84%</div>
              <div className="stat-info">
                <strong>Hesitate to seek traditional clinical therapy</strong>
                <p>Prohibitive hourly fees, lack of strict employer anonymity, and cultural stigma keep millions from timely help.</p>
              </div>
            </div>
          </div>

          {/* Right Column: The Well_ness Transformation */}
          <div className="impact-card transformation">
            <div className="impact-card-header">
              <div className="impact-icon-badge">✨</div>
              <div>
                <h3>The Well_ness Transformation</h3>
                <span>How our members feel better every single week</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">91%</div>
              <div className="stat-info">
                <strong>Measurable anxiety &amp; stress reduction</strong>
                <p>Report feeling noticeably lighter and recharged within 3 weeks of joining informal peer circles and chats.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">10K+</div>
              <div className="stat-info">
                <strong>Active corporate members feeling supported</strong>
                <p>Finding real human connection across 66+ interest subgroups — from box cricket and football to coffee and treks.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">98%</div>
              <div className="stat-info">
                <strong>Safe, confidential &amp; judgment-free space</strong>
                <p>Zero data shared with HR or employers. Complete peace of mind with vetted therapists and anonymous peer spaces.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Moving Testimonials Marquee ─── */}
      <motion.section
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="impact-heading">
          <span className="eyebrow">VOICES OF RELIEF</span>
          <h2>What real members say about feeling better</h2>
          <p>
            Real stories from engineers, designers, managers, and mental health professionals who found relief and belonging.
          </p>
        </div>

        <div className="testimonials-marquee-wrapper">
          <div className="testimonials-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <div key={`${t.name}-${idx}`} className="testimonial-card">
                <div>
                  <div className="testimonial-stars" style={{ marginBottom: "10px" }}>
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p className="testimonial-quote">“{t.quote}”</p>
                </div>

                <div>
                  <Link href={t.href} className="testimonial-tag hover:underline" style={{ marginBottom: "12px", display: "inline-flex" }}>
                    {t.tag} <ArrowRight size={11} />
                  </Link>

                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="testimonial-meta">
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Your Groups / Communities ─── */}
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

      {/* ─── Bottom CTA ─── */}
      <motion.section
        className="home-bottom-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2>Ready to feel lighter this week?</h2>
        <p>
          Connect anonymously with colleagues, play a weekend game of cricket, grab coffee, or speak 1-on-1 with a confidential psychologist.
        </p>
        <div className="bottom-cta-buttons">
          <Link href="/groups" className="btn-cta-white">
            Find Your Community <ArrowRight size={16} />
          </Link>
          <Link href="/therapy" className="btn-cta-ghost">
            Talk to a Doctor <Stethoscope size={16} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
