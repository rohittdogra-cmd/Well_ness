"use client";

import { useState, useMemo } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  PhoneCall,
  Info,
  Navigation,
  Compass,
  Award,
  Search,
  Check,
} from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useGroups } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import { useLiveOffers } from "@/lib/liveDataManager";
import { TURF_VENUES, calculateProximity, type TurfVenue } from "@/lib/turfVenues";
import { BadmintonTurfBookingModal } from "@/components/BadmintonTurfBookingModal";
import "../app/circlein.css";

const TESTIMONIALS = [
  {
    quote: "Working 12-hour sprint shifts at DLF Cyber City had me burnt out by Thursday. Joining the weekend Box Cricket and Sunday Chai circle felt like exhaling after months of holding my breath. Pure fun, zero office politics.",
    name: "Aarav Singhal",
    role: "Staff SWE @ Google · DLF Cyber City, Gurgaon",
    tag: "🏏 Box Cricket",
    href: "/groups/cricket",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=b6e3f4",
    stars: 5,
  },
  {
    quote: "Being able to vent anonymously about imposter syndrome and relentless sprint deadlines with peers who truly understand Gurgaon corporate pressure saved my mental health. No fake smiles or review fears.",
    name: "Priya Raghavan",
    role: "Senior Product Manager · One Horizon Center, Golf Course Rd",
    tag: "💬 Anonymous Peer Venting",
    href: "/discuss",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc",
    stars: 5,
  },
  {
    quote: "Our tech teams used to endure awkward corporate Zoom calls. With stress-unwind, our engineers organically joined Cyber Hub coffee circles and badminton games at Sector 54. Team morale skyrocketed.",
    name: "Karanvir Verma",
    role: "Engineering Director · DLF CyberCity, Gurgaon",
    tag: "☕ Cyber Hub Cafes",
    href: "/groups/cyber-hub-cafes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karanvir&backgroundColor=c0aede",
    stars: 5,
  },
  {
    quote: "Clinical therapy works best when reinforced by daily social belonging. stress-unwind bridges the gap between 1-on-1 mental health consultations and informal weekend sports circles across Gurgaon.",
    name: "Dr. Sunita Rao, M.Phil.",
    role: "Consultant Psychologist & Corporate Wellness Specialist · Gurgaon",
    tag: "🩺 Licensed Practitioner",
    href: "/therapy",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&q=80",
    stars: 5,
  },
  {
    quote: "The Sunday morning Aravali trail group turned our Monday morning dread into something to genuinely look forward to. The 100% employer-blind confidentiality gives everyone complete peace of mind.",
    name: "Pooja Kashyap",
    role: "People Operations Lead · Sector 29, Gurgaon",
    tag: "🌲 Aravali Treks",
    href: "/groups/aravali-treks",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja&backgroundColor=d1fae5",
    stars: 5,
  },
  {
    quote: "I booked a 1-on-1 session with Dr. Amit Sharma using our corporate wellness code in under two minutes. Untangled chronic insomnia and late-night US market trade fatigue without awkward HR paperwork.",
    name: "Devashish Patel",
    role: "Quantitative Finance Analyst · Golf Course Road, Gurgaon",
    tag: "🌿 Confidential Therapy",
    href: "/therapy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Devashish&backgroundColor=fef3c7",
    stars: 5,
  },
  {
    quote: "I moved to Gurgaon from Kolkata and knew nobody outside my team pod. The Weekend Coding & Chai circle gave me lifelong friends who feel like chosen family now.",
    name: "Sneha Roy",
    role: "Frontend Tech Lead @ Zomato · Udyog Vihar, Gurgaon",
    tag: "📚 Tech & Chai Circle",
    href: "/groups/coding",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha&backgroundColor=b6e3f4",
    stars: 5,
  },
  {
    quote: "After grueling consulting deliverables, running with the Early Morning Runners circle on Golf Course Extension Road clears my mind completely. It has become non-negotiable for my wellbeing.",
    name: "Rishabh Sen",
    role: "Strategy Consultant @ BCG · Ambience Island, Gurgaon",
    tag: "🏃 Morning Runners",
    href: "/groups/running",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rishabh&backgroundColor=c0aede",
    stars: 5,
  },
];

const FAQS = [
  {
    category: "handles",
    q: "Why are member display names auto-assigned and locked?",
    a: "To eliminate online trolling, inappropriate usernames, and identity bias, display names are auto-assigned as cute, sporty handles (like Junior Ronaldo, Crazy Kohli, Shuttle Queen, and Iron Gymmer) based on your selected gender and interests. You can shuffle to roll another cute name with the dice button, but manual text entry is locked to ensure a wholesome, safe environment.",
  },
  {
    category: "turfs",
    q: "How does 2-player badminton matchmaking and turf booking work?",
    a: "When you and another member want to play badminton, both players enter their localities (e.g., Janakpuri, Gurgaon, Noida, or Palwal). Our proximity engine calculates the distance between you and recommends balanced meetup areas (such as Central Aerocity or DLF Cyber City). You then select an indoor court, choose a 1-hour time slot, enter your verification phone number, and our operations desk confirms slot availability with the venue manager before issuing your digital match pass.",
  },
  {
    category: "privacy",
    q: "Is my employer, HR, or manager able to see my activity or therapy notes?",
    a: "No. stress-unwind is 100% Employer-Blind. Your registration, anonymous handles, discussion posts, sports bookings, and doctor consultations are completely isolated from your corporate HR systems. Even if your company sponsors wellness codes, zero personal data or consultation transcripts are ever shared with corporate administrators.",
  },
  {
    category: "localities",
    q: "What happens if my match is located far away or in another country?",
    a: "Our location system computes geographic proximity in real-time. If you and your peer are in the same metro area (e.g. Janakpuri <-> Gurgaon ~22 km), you get a green 'Same City' badge enabling in-person turf play. If someone is located overseas (e.g., New Zealand vs. Delhi ~11,000 km), a purple 'Remote' indicator clarifies that in-person meetup is not feasible, keeping your interaction to virtual chats and expat wellness sharing.",
  },
  {
    category: "turfs",
    q: "What amenities and equipment are provided at partner badminton turfs?",
    a: "All partner arenas (SP Arena Janakpuri, Fitso Cyber Hub, Sector 54 Rapid Sports, Noida Sec 62, Palwal Arena, Central Aerocity) feature international BWF-standard synthetic mats or teak wooden flooring, air conditioning, and clean locker rooms. You can choose to bring your own gear or request Yonex Astrox rackets and Mavis 350 shuttles at ₹50/racket directly during booking.",
  },
  {
    category: "therapy",
    q: "Are the therapists on the platform certified licensed practitioners?",
    a: "Yes. All psychologists and psychiatrists listed in our therapy department hold recognized clinical qualifications (M.Phil., Ph.D., or MD) with verified RCI licenses and 8+ years of clinical experience specializing in workplace burnout, anxiety, depression, and executive performance.",
  },
  {
    category: "turfs",
    q: "What shoe rules apply on indoor badminton courts?",
    a: "All partner venues strictly enforce non-marking gum rubber badminton shoes to protect the certified tournament mats. If you do not own non-marking footwear, shoes in sizes UK 6–11 can be rented directly at the venue reception for ₹50 per hour.",
  },
  {
    category: "privacy",
    q: "How does the operations verification desk protect player phone numbers?",
    a: "Your phone number is strictly used by our internal operations desk to coordinate slot confirmation with venue managers and dispatch your entrance SMS passcode. Opponents never see your personal phone number, real name, or employer details.",
  },
];

const LOCALITIES = [
  {
    city: "Gurgaon, Haryana",
    tagline: "Corporate Cyber Corridor",
    metro: "Rapid Metro Phase 2 & Sector 54 Chowk · Yellow Line Huda City Centre",
    hubs: ["DLF Cyber City & Cyber Hub", "Sector 54 Rapid Metro Dome", "Golf Course Road & One Horizon", "Sector 29 Evening Cafes"],
    sports: "Fitso Smash Arena (6 Courts), Sector 54 Badminton Dome, Turf Box Cricket Phase 2",
    cost: "₹480 – ₹550 / hr",
    timing: "Morning 6:00 – 9:00 AM · Post-Sprint 7:00 – 10:30 PM",
  },
  {
    city: "Janakpuri & West Delhi",
    tagline: "Sports Clubs & Active Circles",
    metro: "Blue Line & Magenta Line Interchange (Janakpuri West Metro)",
    hubs: ["District Centre Janakpuri", "Dhaula Kuan Sports Complex", "Vasant Kunj Hub", "Central Aerocity Gateway"],
    sports: "SP Arena Indoor Badminton (4 BWF Courts), Central Aerocity Racquet Club, District Tennis",
    cost: "₹450 – ₹600 / hr",
    timing: "Early Bird 6:00 – 8:30 AM · Evening 6:00 – 10:00 PM",
  },
  {
    city: "Noida, Uttar Pradesh",
    tagline: "Electronic City & Night Turfs",
    metro: "Blue Line (Noida Electronic City Sec 62) · Aqua Line Corridor",
    hubs: ["Sector 62 IT Corridor", "Sector 18 Market Circles", "Advant Navis Boulevard", "Expressway Green Corridors"],
    sports: "Smash & Drop Badminton Center (5 Courts), Sector 62 Floodlit Box Turf, Morning Jogging Tracks",
    cost: "₹400 – ₹450 / hr",
    timing: "Morning 6:00 – 8:30 AM · Night Turfs 7:00 – 10:30 PM",
  },
  {
    city: "Palwal, Haryana",
    tagline: "NCR South Emerging Sports Hub",
    metro: "Direct access via Sohna Elevated Corridor & Delhi-Mumbai Expressway",
    hubs: ["Mini Secretariat Complex", "Sohna Elevated Corridor", "Agra Road District", "Palwal Town Hub"],
    sports: "Palwal National Sports Arena (3 Teak Wood Courts), Weekend Cricket Grounds, Athletic Track",
    cost: "₹350 / hr",
    timing: "Sunrise 6:00 – 8:30 AM · Evening 5:00 – 8:00 PM",
  },
  {
    city: "Central Aerocity & IGI Gateway",
    tagline: "Cross-Metro Neutral Midpoint",
    metro: "Airport Express Line & Magenta Line (Delhi Aerocity Station)",
    hubs: ["Worldmark Aerocity", "Hospitality District", "IGI T3 Boulevard", "Mahipalpur Sports Links"],
    sports: "Central Aerocity Racquet Club (4 BWF Synthetic Courts), Premium Player Lounge",
    cost: "₹600 / hr",
    timing: "All-Day 6:00 AM – 11:00 PM (Ideal midpoint Janakpuri + Gurgaon)",
  },
  {
    city: "International & Expat Pods",
    tagline: "Remote Wellness & Expat Connections",
    metro: "Virtual Global Time-Zone Channels (Zoom / Discord / Google Meet)",
    hubs: ["Auckland, New Zealand", "London, UK", "Singapore Tech Hub", "San Francisco Bay Area"],
    sports: "Async Venting Circles, Expat Chai Catchups, Time-Zone Stress Debriefs",
    cost: "100% Free Virtual Community",
    timing: "Flexible 24/7 Asynchronous Circles",
  },
];

const LIVE_PEER_UPDATES = [
  { text: "⚡ Shuttle Queen & Junior Ronaldo matched for SP Arena Janakpuri (Court #3 Verified)", time: "2m ago", badge: "Match Confirmed" },
  { text: "⚡ Crazy Kohli launched an evening Box Cricket match in DLF Cyber City", time: "5m ago", badge: "Box Cricket" },
  { text: "⚡ Iron Gymmer booked 7:30 PM court slot at Fitso Cyber Hub", time: "9m ago", badge: "Turf Slot" },
  { text: "⚡ Zen Zebra initiated a 25-min Pomodoro co-working circle in Sector 29", time: "14m ago", badge: "Peer Circle" },
  { text: "⚡ Smash Sensation matched for Central Aerocity neutral midpoint court", time: "21m ago", badge: "Badminton" },
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
  const groups = useGroups({ joinedOnly: true });
  const { user } = useInternetIdentity();
  const { activeOffers } = useLiveOffers();
  const joined = groups.data?.pages.flat() ?? [];

  // Modal and Interactive States
  const [turfModalOpen, setTurfModalOpen] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<{ name: string; location: string }>({
    name: "Shuttle Queen",
    location: "Janakpuri, Delhi",
  });

  // Venue filters
  const [selectedVenueArea, setSelectedVenueArea] = useState<string>("all");

  // User's permanent locked location (cannot be changed once entered)
  const userLockedLocation = profile?.location || "Janakpuri, Delhi";
  const [calcLocB, setCalcLocB] = useState<string>("Gurgaon, Haryana");
  const proximityEstimate = useMemo(() => {
    return calculateProximity(userLockedLocation, calcLocB);
  }, [userLockedLocation, calcLocB]);

  // FAQ filters & accordion
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    if (faqCategory === "all") return FAQS;
    return FAQS.filter((f) => f.category === faqCategory);
  }, [faqCategory]);

  const filteredVenues = useMemo(() => {
    if (selectedVenueArea === "all") return TURF_VENUES;
    if (selectedVenueArea === "gurgaon") return TURF_VENUES.filter((t) => t.area === "Gurgaon");
    if (selectedVenueArea === "janakpuri") return TURF_VENUES.filter((t) => t.area === "Janakpuri");
    if (selectedVenueArea === "noida") return TURF_VENUES.filter((t) => t.area === "Noida");
    if (selectedVenueArea === "palwal") return TURF_VENUES.filter((t) => t.area === "Palwal");
    if (selectedVenueArea === "aerocity") return TURF_VENUES.filter((t) => t.area.includes("Aerocity"));
    return TURF_VENUES;
  }, [selectedVenueArea]);

  return (
    <div className="member-home" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* ─── Top Live Ticker & Operational Trust Bar ─── */}
      <div className="home-live-ticker">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#087f79", fontWeight: 800 }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            LIVE IN DELHI-NCR:
          </span>
          <span>🏸 2-Player Badminton Turf Matching</span>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <span>66+ Interest Circles</span>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <span>100% Employer-Blind Anonymity</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#047857" }}>
          <ShieldCheck size={15} />
          <span>Operations Court Desk Online</span>
        </div>
      </div>

      {/* Member Personalized Greeting */}
      {user && profile ? (
        <div style={{ marginBottom: "20px" }}>
          <h1 className="member-greeting" style={{ fontSize: "1.35rem", color: "#0f172a", marginBottom: "4px" }}>
            Welcome back, <strong>{profile.name}</strong> 🏸
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "13px", color: "#64748b" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={14} color="#087f79" /> {profile.location || "Janakpuri, Delhi"}
            </span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Award size={14} color="#ea580c" /> Auto-Assigned Cute Handle Active
            </span>
            <span>•</span>
            <span style={{ color: "#059669", fontWeight: 700 }}>🟢 Verified for Matchmaking</span>
          </div>
        </div>
      ) : (
        <h1 className="member-greeting" style={{ fontSize: "1.3rem", color: "#0f172a", marginBottom: "20px" }}>
          A calmer, playful way to connect, play sports, and de-stress at work.
        </h1>
      )}

      {/* ─── Special Offer Banner ─── */}
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

      {/* ─── Hero Section ─── */}
      <motion.section 
        className="responsive-hero"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className="circlein-bg-shape top-right"></div>
        <div className="circlein-bg-shape bottom-left"></div>

        <div className="hero-layout">
          {/* Left Text Column */}
          <div className="hero-text-col">
            <motion.div className="intro-badge" variants={fadeUp}>
              <span className="dot"></span> CUTE ANONYMOUS HANDLES · REAL NCR PEERS
            </motion.div>

            <motion.h2 className="main-headline" variants={fadeUp}>
              Break the<br />
              sprint cycle.<br />
              <span className="green-text">Play, connect<br />&amp; unwind.</span>
              <div className="underline">
                <svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M5,15 Q100,5 195,15" stroke="#08783D" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
              </div>
            </motion.h2>

            <motion.p className="supporting-text" variants={fadeUp}>
              Escape corporate pressure without awkward HR scrutiny. Auto-assigned handles, spontaneous Cyber Hub coffee catchups, weekend badminton turf bookings, and confidential clinical therapy in one safe space.
            </motion.p>

            <motion.div className="cta-wrapper" variants={fadeUp} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/groups" className="main-cta">
                Find Your People <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <button
                type="button"
                onClick={() => setTurfModalOpen(true)}
                style={{
                  background: "#087f79",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "100px",
                  padding: "16px 28px",
                  fontSize: "15px",
                  fontWeight: 750,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(8, 127, 121, 0.28)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                🏸 Match Badminton &amp; Book Turf
              </button>
            </motion.div>

            <motion.div className="feature-row" variants={fadeUp}>
              <div className="feature">
                <div className="circle">🎭</div>
                <span>Cute Anonymous<br/>Handles</span>
              </div>
              <div className="divider"></div>
              <div className="feature">
                <div className="circle">🏸</div>
                <span>Verified<br/>Turf Courts</span>
              </div>
              <div className="divider"></div>
              <div className="feature">
                <div className="circle">🔒</div>
                <span>100% Employer<br/>Blind</span>
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
                alt="Friends enjoying sports and coffee"
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority
              />
              <div className="photo-glow"></div>
              
              <div className="social-proof-panel">
                <div className="avatars">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=JuniorRonaldo&backgroundColor=b6e3f4" alt="Junior Ronaldo" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CrazyKohli&backgroundColor=c0aede" alt="Crazy Kohli" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ShuttleQueen&backgroundColor=ffd5dc" alt="Shuttle Queen" />
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=MessedMessi&backgroundColor=b6e3f4" alt="Messed Messi" />
                  <div className="count">+10k</div>
                </div>
                <div className="text">
                  <strong>10,000+ Corporate Peers</strong>
                  <span>Playing and de-stressing across NCR every week.</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="chat-card card-1" 
              variants={floatAnim} 
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setPartnerDetails({ name: "Shuttle Queen", location: "Janakpuri, Delhi" });
                setTurfModalOpen(true);
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="icon">🏸</div>
              <span className="text">Badminton at<br/>SP Arena 7 AM?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
              <div className="card-annotation">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 20 Q10 20 20 2 L18 10 M20 2 L10 4" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                <span>Book turf in 60s 🏸</span>
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
              <span className="text">Box cricket<br/>Cyber Hub tonight?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
            </motion.div>
            
            <motion.div 
              className="chat-card card-3" 
              variants={floatAnim} 
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push('/groups/cyber-hub-cafes')}
              style={{ cursor: "pointer" }}
            >
              <div className="icon">☕</div>
              <span className="text">Chai &amp; vent<br/>at Sector 29?</span>
              <div className="menu-dots"><MoreHorizontal size={14} color="#a0a0a0" /></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Interactive Proximity & Midpoint Distance Calculator ─── */}
      <section className="proximity-tool-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#087f79", letterSpacing: "0.08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Navigation size={13} /> INTERACTIVE NCR PROXIMITY CALCULATOR
            </span>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
              Check Mutual Distance &amp; Find the Perfect Midpoint Court
            </h3>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Test how our engine calculates commute viability between Janakpuri, Gurgaon, Noida, Palwal, or remote international cities.
            </p>
          </div>
          <span style={{ background: "#ccfbf1", color: "#0f766e", fontSize: "11.5px", fontWeight: 750, padding: "4px 10px", borderRadius: "100px" }}>
            Real-Time Engine
          </span>
        </div>

        <div className="proximity-tool-grid">
          {/* Selectors Column */}
          <div className="locality-selector-group">
            <div className="locality-select-row">
              <span className="locality-select-label">
                <MapPin size={14} color="#087f79" /> Your Area:
              </span>
              <div
                className="locality-locked-box"
                title="Your location is permanently locked and cannot be changed"
              >
                <div className="locality-locked-text">
                  <MapPin size={14} color="#087f79" style={{ flexShrink: 0 }} />
                  <span>{userLockedLocation}</span>
                </div>
                <span className="locality-locked-badge">
                  <Lock size={11} /> Locked
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", margin: "-6px 0 2px" }}>
              <Lock size={12} color="#087f79" style={{ flexShrink: 0 }} />
              <span>Location is permanently locked to your account and cannot be modified.</span>
            </div>

            <div className="locality-select-row">
              <span className="locality-select-label">
                <Users size={14} color="#ea580c" /> Match Area:
              </span>
              <select
                value={calcLocB}
                onChange={(e) => setCalcLocB(e.target.value)}
                className="locality-select-dropdown"
              >
                <option value="Gurgaon, Haryana">Gurgaon, Haryana (DLF Cyber City / Sec 54)</option>
                <option value="Janakpuri, Delhi">Janakpuri, Delhi (SP Arena Hub)</option>
                <option value="Noida, Uttar Pradesh">Noida, UP (Sector 62 IT Corridor)</option>
                <option value="Palwal, Haryana">Palwal, Haryana (National Sports Arena)</option>
                <option value="Aerocity, New Delhi">Aerocity, New Delhi (Midpoint Neutral)</option>
                <option value="Auckland, New Zealand">Auckland, New Zealand (Overseas Expat)</option>
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="proximity-result-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: proximityEstimate.isViableForMeetup ? "#f0fdf4" : "#faf5ff",
                  color: proximityEstimate.isViableForMeetup ? "#15803d" : "#7e22ce",
                  border: proximityEstimate.isViableForMeetup ? "1px solid #bbf7d0" : "1px solid #e9d5ff",
                }}
              >
                {proximityEstimate.isViableForMeetup ? "🟢 " : "🟣 "}
                {proximityEstimate.label}
              </span>
              <span style={{ fontSize: "12px", fontWeight: 750, color: "#0f766e" }}>
                Approx: {proximityEstimate.approxDistance}
              </span>
            </div>

            <p style={{ margin: "0 0 12px", fontSize: "12.5px", color: "#475569", lineHeight: 1.5, wordBreak: "break-word" }}>
              {proximityEstimate.explanation}
            </p>

            {proximityEstimate.isViableForMeetup ? (
              <button
                type="button"
                onClick={() => {
                  setPartnerDetails({ name: "Shuttle Queen", location: calcLocB });
                  setTurfModalOpen(true);
                }}
                style={{
                  width: "100%",
                  background: "#087f79",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  fontSize: "13px",
                  fontWeight: 750,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(8, 127, 121, 0.2)",
                  whiteSpace: "normal",
                  lineHeight: 1.35,
                  textAlign: "center",
                  wordBreak: "break-word",
                  boxSizing: "border-box",
                }}
              >
                <span>🏸 Book Midpoint Court ({proximityEstimate.suggestedMidpoints[0] || "Neutral Venue"})</span>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </button>
            ) : (
              <Link
                href="/community"
                style={{
                  width: "100%",
                  background: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  fontSize: "13px",
                  fontWeight: 750,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  whiteSpace: "normal",
                  lineHeight: 1.35,
                  textAlign: "center",
                  wordBreak: "break-word",
                  boxSizing: "border-box",
                }}
              >
                <span>💬 Join Virtual Expat Chat Board</span>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Real-Time Live Peer Activity Feed ─── */}
      <section style={{ marginBottom: "45px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
              <strong style={{ fontSize: "13px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Live Community Stream
              </strong>
            </div>
            <Link href="/community" style={{ fontSize: "12px", color: "#087f79", fontWeight: 700, textDecoration: "none" }}>
              View full live board &rarr;
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {LIVE_PEER_UPDATES.slice(0, 3).map((u, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#334155",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>
                  {u.text}
                </span>
                <span style={{ fontSize: "10.5px", background: "#e2e8f0", color: "#475569", padding: "2px 6px", borderRadius: "6px", flexShrink: 0, fontWeight: 700 }}>
                  {u.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4 Core Pillars Grid ─── */}
      <section style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span className="eyebrow">OUR FOUR FOUNDATIONS</span>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", margin: "6px 0" }}>
            Engineered for Real Belonging &amp; Genuine Relief
          </h2>
          <p style={{ color: "#64748b", maxWidth: "620px", margin: "0 auto", fontSize: "14px" }}>
            Everything you need to step away from corporate burnout, find active workout partners, and speak without fear.
          </p>
        </div>

        <div className="home-pillars-grid">
          {/* Pillar 1 */}
          <div className="pillar-card">
            <div>
              <div className="pillar-icon-box" style={{ background: "rgba(8, 127, 121, 0.1)", color: "#087f79" }}>
                🏸
              </div>
              <h3>Badminton &amp; Turf Matchmaking</h3>
              <p>
                Pair up with badminton partners in Janakpuri, Gurgaon, Noida, or Palwal. Check mutual distances, discover verified wooden/synthetic arenas, and book confirmed slots.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTurfModalOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#087f79",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Book Nearby Turf <ArrowRight size={14} />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="pillar-card">
            <div>
              <div className="pillar-icon-box" style={{ background: "rgba(234, 88, 12, 0.1)", color: "#ea580c" }}>
                🎭
              </div>
              <h3>Cute Anonymous Identity</h3>
              <p>
                Names are auto-assigned as playful sports handles (Junior Ronaldo, Crazy Kohli, Shuttle Queen, Iron Gymmer). Manual text is locked to eliminate trolls and bias.
              </p>
            </div>
            <Link
              href="/onboarding"
              style={{
                color: "#ea580c",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                textDecoration: "none",
              }}
            >
              Roll Your Handle <ArrowRight size={14} />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="pillar-card">
            <div>
              <div className="pillar-icon-box" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}>
                ☕
              </div>
              <h3>Spontaneous Peer Circles</h3>
              <p>
                Post random activities on our live board — 20-minute coffee breaks, pomodoro deep-work sprints, evening box cricket, or weekend Aravali treks.
              </p>
            </div>
            <Link
              href="/community"
              style={{
                color: "#2563eb",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                textDecoration: "none",
              }}
            >
              Explore Live Board <ArrowRight size={14} />
            </Link>
          </div>

          {/* Pillar 4 */}
          <div className="pillar-card">
            <div>
              <div className="pillar-icon-box" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}>
                🩺
              </div>
              <h3>Confidential Clinical Care</h3>
              <p>
                1-on-1 private appointments with licensed psychologists in dedicated doctor cabins. 100% employer-blind with zero HR insurance or medical filings.
              </p>
            </div>
            <Link
              href="/therapy"
              style={{
                color: "#7c3aed",
                fontWeight: 700,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                textDecoration: "none",
              }}
            >
              Consult a Doctor <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works (4-Step Visual Journey) ─── */}
      <section style={{ marginBottom: "50px", background: "#f8fafc", borderRadius: "28px", padding: "36px 28px", border: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="eyebrow">STEP-BY-STEP FLOW</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "6px 0" }}>
            How stress-unwind Connects You in Minutes
          </h2>
          <p style={{ color: "#64748b", maxWidth: "600px", margin: "0 auto", fontSize: "13.5px" }}>
            From setting up an anonymous handle to stepping onto the court or sitting down for chai.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="how-step-card">
            <span className="how-step-badge">01</span>
            <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              Pick Gender &amp; Sports
            </h4>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
              Choose your favorite activities (badminton, cricket, gym, yoga). Our engine assigns you a cute anonymous handle with a shuffle button.
            </p>
          </div>

          <div className="how-step-card">
            <span className="how-step-badge">02</span>
            <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              Location &amp; Proximity Check
            </h4>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
              Set your city/area (Janakpuri, Gurgaon, Noida, Palwal). Real-time distance indicators verify if you can play locally or connect virtually.
            </p>
          </div>

          <div className="how-step-card">
            <span className="how-step-badge">03</span>
            <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              Coordinate &amp; Book Turf
            </h4>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
              Agree on a central court, select a convenient 1-hour time slot, and submit your phone number for our operations verification desk.
            </p>
          </div>

          <div className="how-step-card">
            <span className="how-step-badge">04</span>
            <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              Receive Pass &amp; Play
            </h4>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
              Our team verifies court coordinates, issues your official match pass with court number and entry passcode. Unwind and enjoy!
            </p>
          </div>
        </div>
      </section>

      {/* ─── Verified Badminton Turfs & Arenas Showcase (With Filter Tabs) ─── */}
      <section style={{ marginBottom: "50px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div>
            <span className="eyebrow">VERIFIED PLAYABLE VENUES</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
              Indoor Badminton Arenas Across Delhi-NCR
            </h2>
            <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
              Certified BWF synthetic mats &amp; teak wooden courts with rental gear and air conditioning.
            </p>
          </div>
          <Link
            href="/programs/badminton"
            style={{
              color: "#087f79",
              fontWeight: 750,
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Explore all venues <ArrowRight size={15} />
          </Link>
        </div>

        {/* Region Filter Bar */}
        <div className="venue-filter-container">
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "all" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("all")}
          >
            All Arenas ({TURF_VENUES.length})
          </button>
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "janakpuri" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("janakpuri")}
          >
            West Delhi (Janakpuri)
          </button>
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "gurgaon" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("gurgaon")}
          >
            Gurgaon (Cyber Hub &amp; Sec 54)
          </button>
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "noida" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("noida")}
          >
            Noida (Sector 62 IT)
          </button>
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "palwal" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("palwal")}
          >
            Palwal National Arena
          </button>
          <button
            type="button"
            className={`venue-filter-btn ${selectedVenueArea === "aerocity" ? "active" : ""}`}
            onClick={() => setSelectedVenueArea("aerocity")}
          >
            Central Aerocity Midpoint
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {filteredVenues.map((turf) => (
            <div
              key={turf.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                transition: "all 0.25s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{turf.name}</h3>
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "6px",
                    }}
                  >
                    ⭐ {turf.rating} ({turf.reviewsCount})
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                  <MapPin size={13} color="#0d9488" /> {turf.address}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                  <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 650, padding: "3px 8px", borderRadius: "6px" }}>
                    {turf.courtType}
                  </span>
                  {turf.amenities.slice(0, 3).map((a) => (
                    <span key={a} style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "3px 7px", borderRadius: "6px" }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: "17px", fontWeight: 800, color: "#0f766e" }}>
                    ₹{turf.pricePerHour}
                  </span>
                  <small style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>/ hr</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPartnerDetails({ name: "Shuttle Queen", location: turf.cityState });
                    setTurfModalOpen(true);
                  }}
                  style={{
                    background: "#087f79",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    fontSize: "13px",
                    fontWeight: 750,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(8, 127, 121, 0.25)",
                  }}
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Workplace Wellness Crisis vs. Transformation ─── */}
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
            Modern corporate workplaces demand relentless output. Here is what employees face in silence — and how our anonymous community turns the curve.
          </p>
        </div>

        <div className="impact-grid">
          <div className="impact-card struggle">
            <div className="impact-card-header">
              <div className="impact-icon-badge">⚠️</div>
              <div>
                <h3>The Silent Struggle</h3>
                <span>What corporate workers endure in isolation</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">76%</div>
              <div className="stat-info">
                <strong>Suffer from chronic burnout &amp; anxiety</strong>
                <p>Over 3 in 4 corporate workers report persistent mental fatigue, sleeplessness, and Sunday-night dread.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">58%</div>
              <div className="stat-info">
                <strong>Feel completely isolated at work</strong>
                <p>Fear of appearing vulnerable or impacting appraisals prevents professionals from sharing struggles.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">84%</div>
              <div className="stat-info">
                <strong>Hesitate to seek traditional clinical therapy</strong>
                <p>Prohibitive fees and fear of employer discovery keep millions from seeking timely mental relief.</p>
              </div>
            </div>
          </div>

          <div className="impact-card transformation">
            <div className="impact-card-header">
              <div className="impact-icon-badge">✨</div>
              <div>
                <h3>The stress-unwind Transformation</h3>
                <span>How our members recharge every single week</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">91%</div>
              <div className="stat-info">
                <strong>Measurable anxiety &amp; stress reduction</strong>
                <p>Report feeling noticeably lighter within 3 weeks of joining informal peer sports and chai circles.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">10K+</div>
              <div className="stat-info">
                <strong>Active corporate members feeling supported</strong>
                <p>Connecting across 66+ interest circles — from badminton and box cricket to coding and treks.</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-num">98%</div>
              <div className="stat-info">
                <strong>Safe, confidential &amp; judgment-free space</strong>
                <p>Zero data shared with HR. Complete peace of mind with vetted therapists and anonymous peer circles.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Testimonials Marquee ─── */}
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
            Real stories from engineers, designers, managers, and mental health professionals across Gurgaon &amp; Delhi-NCR.
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

      {/* ══════════════════════════════════════════════════════════════
          COMPREHENSIVE BOTTOM INFORMATION ARCHITECTURE & KNOWLEDGE BASE
          ══════════════════════════════════════════════════════════════ */}
      <div className="bottom-info-architecture">
        {/* ─── Part 1: Deep Metro Locality Directory ─── */}
        <section style={{ marginBottom: "55px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <span className="eyebrow">METRO LOCALITY &amp; SPORTS GUIDE</span>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
              Active Communities, Court Density &amp; Transit Hubs
            </h2>
            <p style={{ color: "#64748b", maxWidth: "660px", margin: "0 auto", fontSize: "13.5px" }}>
              Comprehensive regional breakdown of where tech professionals, analysts, and founders regularly meet for badminton, box cricket, and chai across Delhi-NCR.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {LOCALITIES.map((loc) => (
              <div key={loc.city} className="locality-guide-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={17} color="#087f79" />
                    <strong style={{ fontSize: "15px", color: "#0f172a" }}>{loc.city}</strong>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 750, color: "#087f79", background: "#f0fdfa", padding: "2px 8px", borderRadius: "6px" }}>
                    {loc.cost}
                  </span>
                </div>

                <span style={{ fontSize: "11px", fontWeight: 750, color: "#0f766e", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                  {loc.tagline}
                </span>

                <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "12px", background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <strong>🚇 Metro Links:</strong> {loc.metro}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <small style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: 750, display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
                    POPULAR CORPORATE &amp; SPORTS HUBS:
                  </small>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#475569", lineHeight: 1.55 }}>
                    {loc.hubs.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", fontSize: "11.5px", color: "#334155" }}>
                  <strong>Verified Venues:</strong> {loc.sports}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Part 2: Badminton Operations Protocol & Clearance Timeline ─── */}
        <section style={{ marginBottom: "55px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "10px" }}>
            <div>
              <span className="eyebrow">MATCH CLEARANCE STANDARDS</span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                Turf Booking &amp; Operations Clearance Protocol
              </h2>
              <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
                How our operations team confirms court availability, protects privacy, and guarantees high-grade playing standards.
              </p>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 750, display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={15} /> 10-15 Min SLA Clearance
            </div>
          </div>

          <div className="ops-protocol-grid">
            <div className="ops-protocol-card">
              <span className="ops-step-num">01</span>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                Proximity Calculation
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                Both player localities are matched against Delhi-NCR corridors. The algorithm suggests central midpoints (e.g. Aerocity or Cyber Hub) so travel is balanced.
              </p>
            </div>

            <div className="ops-protocol-card">
              <span className="ops-step-num">02</span>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                BWF Floor Inspection
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                Courts must feature genuine 4.5mm-5.0mm PVC tournament mats or sprung teak wood to prevent knee and joint impact injuries for working athletes.
              </p>
            </div>

            <div className="ops-protocol-card">
              <span className="ops-step-num">03</span>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                Privacy Verification Call
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                Our operations team verifies the slot with the court manager directly. Zero personal phone numbers or corporate details are revealed to opponents.
              </p>
            </div>

            <div className="ops-protocol-card">
              <span className="ops-step-num">04</span>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                Digital Pass &amp; Entry Code
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                Both players receive an official match pass with court number, security entry passcode, and 10-minute warm-up buffer before start.
              </p>
            </div>

            <div className="ops-protocol-card">
              <span className="ops-step-num">05</span>
              <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                Non-Marking Shoe Rule
              </h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                Gum rubber non-marking footwear is mandatory to preserve the synthetic mats. Rental shoes and Yonex rackets are available at venue reception for ₹50.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Part 3: Mental Health Care Hierarchy & 100% Employer-Blind Model ─── */}
        <section style={{ marginBottom: "55px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <span className="eyebrow">CLINICAL STANDARDS &amp; CARE TIERS</span>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
              A Holistic Spectrum of Relief &amp; Clinical Care
            </h2>
            <p style={{ color: "#64748b", maxWidth: "660px", margin: "0 auto", fontSize: "13.5px" }}>
              Mental health is not one-size-fits-all. From casual weekend badminton to 1-on-1 consultations with RCI-licensed doctors, find the exact care level you need.
            </p>
          </div>

          <div className="care-pyramid-grid">
            <div className="care-tier-card">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#087f79", background: "rgba(8,127,121,0.1)", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginBottom: "10px" }}>
                  TIER 1 · RECREATIONAL
                </span>
                <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  Active Sports &amp; Social Circles
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Badminton match coordination, DLF Cyber Hub chai meetups, Box Cricket leagues, and Sunday morning Aravali trail hikes.
                </p>
                <div style={{ fontSize: "11.5px", color: "#334155", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong>Best For:</strong> Sedentary stiffness, work fatigue, informal connection.
                </div>
              </div>
              <Link href="/groups" style={{ color: "#087f79", fontWeight: 750, fontSize: "12.5px", marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Explore 66+ Groups <ArrowRight size={13} />
              </Link>
            </div>

            <div className="care-tier-card">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#ea580c", background: "rgba(234,88,12,0.1)", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginBottom: "10px" }}>
                  TIER 2 · PEER VENTING
                </span>
                <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  Anonymous Discussion Boards
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Share sprint anxieties, appraisal stress, and toxic management friction with peers who understand the corporate landscape.
                </p>
                <div style={{ fontSize: "11.5px", color: "#334155", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong>Best For:</strong> Anonymous emotional venting, empathy, imposter syndrome.
                </div>
              </div>
              <Link href="/discuss" style={{ color: "#ea580c", fontWeight: 750, fontSize: "12.5px", marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Open Venting Board <ArrowRight size={13} />
              </Link>
            </div>

            <div className="care-tier-card">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563eb", background: "rgba(37,99,235,0.1)", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginBottom: "10px" }}>
                  TIER 3 · COUNSELING
                </span>
                <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  1-on-1 Certified Counseling
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Sessions with certified counseling psychologists focusing on career burnout, work-life boundary setting, and performance anxiety.
                </p>
                <div style={{ fontSize: "11.5px", color: "#334155", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong>Best For:</strong> Coping toolkits, career transitions, sleep rhythm reset.
                </div>
              </div>
              <Link href="/therapy" style={{ color: "#2563eb", fontWeight: 750, fontSize: "12.5px", marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Book Counseling <ArrowRight size={13} />
              </Link>
            </div>

            <div className="care-tier-card">
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#7c3aed", background: "rgba(124,58,237,0.1)", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginBottom: "10px" }}>
                  TIER 4 · CLINICAL CARE
                </span>
                <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                  RCI Licensed Clinical Psychology
                </h4>
                <p style={{ margin: "0 0 14px", fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
                  Private doctor cabins with licensed psychologists (M.Phil / MD) for clinical depression, chronic insomnia, and panic episodes.
                </p>
                <div style={{ fontSize: "11.5px", color: "#334155", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong>Best For:</strong> Clinical diagnostics, severe anxiety, psychiatric support.
                </div>
              </div>
              <Link href="/psychologists" style={{ color: "#7c3aed", fontWeight: 750, fontSize: "12.5px", marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Consult Clinical Doctors <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Part 4: 24/7 Verified Crisis & Emergency Helplines ─── */}
        <section style={{ marginBottom: "55px", background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)", border: "1.5px solid #fecaca", borderRadius: "24px", padding: "30px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px" }}>🆘</span>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#991b1b", margin: 0 }}>
                  National Mental Health &amp; Crisis Emergency Directory
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#7f1d1d", maxWidth: "720px", lineHeight: 1.55 }}>
                If you or a coworker are experiencing acute panic, severe depressive crisis, or feeling overwhelmed, free confidential mental health assistance is available 24/7 across India.
              </p>
            </div>
            <span style={{ background: "#dc2626", color: "white", padding: "4px 12px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 800 }}>
              24/7 Toll-Free Numbers
            </span>
          </div>

          <div className="helplines-grid">
            <div className="helpline-box">
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>Tele-MANAS (Govt. of India)</strong>
                <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginBottom: "8px" }}>National Tele Mental Health Programme · 20+ Regional Languages</span>
              </div>
              <a
                href="tel:14416"
                style={{
                  background: "#dc2626",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <PhoneCall size={14} /> Call 14416 / 1800-891-4416
              </a>
            </div>

            <div className="helpline-box">
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>KIRAN Mental Health Helpline</strong>
                <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginBottom: "8px" }}>Ministry of Social Justice · 13 Languages · Toll-Free</span>
              </div>
              <a
                href="tel:18005990019"
                style={{
                  background: "#ffffff",
                  color: "#991b1b",
                  border: "1.5px solid #f87171",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Phone size={14} /> Call 1800-599-0019
              </a>
            </div>

            <div className="helpline-box">
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>Vandrevala Foundation</strong>
                <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginBottom: "8px" }}>24/7 Professional Crisis &amp; Emotional Counseling</span>
              </div>
              <a
                href="tel:9999666555"
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1.5px solid #cbd5e1",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Phone size={14} /> Call +91 9999 666 555
              </a>
            </div>

            <div className="helpline-box">
              <div>
                <strong style={{ fontSize: "14.5px", color: "#0f172a", display: "block" }}>NIMHANS Helpline</strong>
                <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginBottom: "8px" }}>Premier National Institute Psychosocial Support</span>
              </div>
              <a
                href="tel:08046110007"
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1.5px solid #cbd5e1",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Phone size={14} /> Call 080-46110007
              </a>
            </div>
          </div>
        </section>

        {/* ─── Part 5: Interactive Categorized FAQ Accordion ─── */}
        <section style={{ marginBottom: "55px" }}>
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
              Everything You Need to Know
            </h2>
            <p style={{ color: "#64748b", maxWidth: "600px", margin: "0 auto", fontSize: "13.5px" }}>
              Clear answers regarding cute naming rules, badminton turf bookings, employer blindness, and safety.
            </p>
          </div>

          {/* FAQ Category Pills */}
          <div className="faq-filter-bar">
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "all" ? "active" : ""}`}
              onClick={() => setFaqCategory("all")}
            >
              All Questions ({FAQS.length})
            </button>
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "turfs" ? "active" : ""}`}
              onClick={() => setFaqCategory("turfs")}
            >
              🏸 Badminton &amp; Turfs
            </button>
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "handles" ? "active" : ""}`}
              onClick={() => setFaqCategory("handles")}
            >
              🎭 Cute Handles
            </button>
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "privacy" ? "active" : ""}`}
              onClick={() => setFaqCategory("privacy")}
            >
              🔒 Employer Blindness
            </button>
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "therapy" ? "active" : ""}`}
              onClick={() => setFaqCategory("therapy")}
            >
              🩺 Clinical Therapy
            </button>
            <button
              type="button"
              className={`faq-filter-chip ${faqCategory === "localities" ? "active" : ""}`}
              onClick={() => setFaqCategory("localities")}
            >
              📍 Metro Localities
            </button>
          </div>

          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            {filteredFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="faq-accordion-item">
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#087f79" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="faq-answer-panel"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Part 6: Enterprise Trust & Compliance Badges ─── */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "24px 28px",
            marginBottom: "50px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(8, 127, 121, 0.1)", color: "#087f79", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>100% Employer Blind</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Zero company email tracking or HR audit log sharing.</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(37, 99, 235, 0.1)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Lock size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>256-Bit SSL Encryption</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>End-to-end encrypted direct talks &amp; profile data.</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>BWF Verified Turfs</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Certified wooden &amp; synthetic mats with operations verification.</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>RCI Licensed Doctors</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Vetted corporate wellness therapists &amp; clinical psychologists.</span>
            </div>
          </div>
        </section>

        {/* ─── Part 7: Multi-Column Comprehensive Information Directory ─── */}
        <footer
          style={{
            background: "#0f172a",
            color: "#94a3b8",
            borderRadius: "24px",
            padding: "44px 34px 28px",
          }}
        >
          <div className="bottom-directory-grid">
            {/* Column 1: Brand & Mission */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: 800, fontSize: "18px", marginBottom: "12px" }}>
                <span>🌱</span>
                <span>stress-unwind</span>
              </div>
              <p style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#cbd5e1", margin: "0 0 16px" }}>
                The safe corporate wellness and sports hub connecting modern professionals anonymously. Escape burnout, play badminton, and speak freely.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }} />
                Delhi-NCR Turf Desk Operational
              </div>
            </div>

            {/* Column 2: Sports & Turfs */}
            <div>
              <strong className="directory-col-title">Sports &amp; Turfs</strong>
              <ul className="directory-links-list">
                <li>
                  <button
                    type="button"
                    onClick={() => setTurfModalOpen(true)}
                  >
                    🏸 Badminton Match &amp; Book Turf
                  </button>
                </li>
                <li><Link href="/programs/badminton">🏟️ Verified Arena Showcase</Link></li>
                <li><Link href="/groups/cricket">🏏 DLF Cyber City Box Cricket</Link></li>
                <li><Link href="/groups/football">⚽ Sector 62 Turf Football</Link></li>
                <li><Link href="/groups/running">🏃 Golf Course Road Runners</Link></li>
                <li><Link href="/programs/exercise">🧘 Yoga &amp; Mobility Sessions</Link></li>
              </ul>
            </div>

            {/* Column 3: Community & Circles */}
            <div>
              <strong className="directory-col-title">Community &amp; Circles</strong>
              <ul className="directory-links-list">
                <li><Link href="/community">💬 Live Activity Board</Link></li>
                <li><Link href="/people">👥 Proximity Member Directory</Link></li>
                <li><Link href="/onboarding">🎭 Cute Name Generator</Link></li>
                <li><Link href="/discuss">🗣️ Anonymous Peer Venting</Link></li>
                <li><Link href="/groups/cyber-hub-cafes">☕ Cyber Hub Chai Circles</Link></li>
                <li><Link href="/groups/aravali-treks">🌲 Aravali Weekend Treks</Link></li>
              </ul>
            </div>

            {/* Column 4: Clinical Care & Doctors */}
            <div>
              <strong className="directory-col-title">Clinical Care</strong>
              <ul className="directory-links-list">
                <li><Link href="/therapy">🩺 Licensed Psychologists</Link></li>
                <li><Link href="/psychologists">🛋️ Doctor&apos;s Private Cabins</Link></li>
                <li><Link href="/safety">🛡️ 100% Employer-Blind Model</Link></li>
                <li><Link href="/privacy">🔒 Zero-Tracking Privacy Policy</Link></li>
                <li><Link href="/take-a-moment">🧘 2-Minute Breathing Exercise</Link></li>
                <li><Link href="/contact">📞 Care Desk &amp; Concierge</Link></li>
              </ul>
            </div>

            {/* Column 5: Regional Hubs */}
            <div>
              <strong className="directory-col-title">Delhi-NCR Hubs</strong>
              <ul className="directory-links-list">
                <li><Link href="/programs/badminton">📍 Janakpuri SP Arena Hub</Link></li>
                <li><Link href="/programs/badminton">📍 Gurgaon Cyber City &amp; Sec 54</Link></li>
                <li><Link href="/programs/badminton">📍 Noida Sector 62 Electronic City</Link></li>
                <li><Link href="/programs/badminton">📍 Palwal National Sports Arena</Link></li>
                <li><Link href="/programs/badminton">📍 Central Aerocity Racquet Club</Link></li>
                <li><Link href="/community">🌐 Expat &amp; Overseas Pods</Link></li>
              </ul>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            <span>© 2026 stress-unwind Technologies. Protected by Auto-Assigned Handles &amp; Enterprise Anonymity.</span>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/privacy" className="hover:text-white" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/safety" className="hover:text-white" style={{ color: "inherit", textDecoration: "none" }}>Safety Charter</Link>
              <Link href="/how-it-works" className="hover:text-white" style={{ color: "inherit", textDecoration: "none" }}>How It Works</Link>
              <Link href="/contact" className="hover:text-white" style={{ color: "inherit", textDecoration: "none" }}>Grievance Desk</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* ─── Integrated Badminton Turf Booking Modal ─── */}
      <BadmintonTurfBookingModal
        isOpen={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        partnerCuteName={partnerDetails.name}
        partnerLocation={partnerDetails.location}
        userCuteName={profile?.name || "Smash Sensation"}
        userLocation={profile?.location || "Janakpuri, Delhi"}
      />
    </div>
  );
}
