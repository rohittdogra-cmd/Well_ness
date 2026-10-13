"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  Send,
  Heart,
  Share2,
  Copy,
  Check,
  Search,
  Sparkles,
  User,
  Tag,
  PlusCircle,
  X,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smile,
  Activity,
  Flame,
  Coffee,
  Briefcase,
  Users,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import {
  getShortUniqueId,
  lookupMemberById,
  KNOWN_MEMBERS,
  type CommunityMember,
} from "@/lib/uniqueId";
import { BadmintonTurfBookingModal } from "@/components/BadmintonTurfBookingModal";
import { calculateProximity } from "@/lib/turfVenues";

export interface CommunityPostItem {
  id: string;
  authorName: string;
  authorUniqueId: string;
  authorRole: string;
  authorAvatarSeed: number;
  category: "sports" | "coffee" | "work" | "mindful" | "hobbies" | "open";
  categoryLabel: string;
  location?: string;
  content: string;
  createdAt: string;
  likes: number;
  liked?: boolean;
  repliesCount: number;
}

const CATEGORY_META = {
  all: { label: "All Posts", icon: Flame, color: "#087f79" },
  sports: { label: "🏸 Sports & Fitness", icon: Activity, color: "#16a34a" },
  coffee: { label: "☕ Coffee & Vent", icon: Coffee, color: "#d97706" },
  work: { label: "💼 Work & Co-working", icon: Briefcase, color: "#2563eb" },
  mindful: { label: "🧘 Mindful & Walk", icon: Sparkles, color: "#7c3aed" },
  hobbies: { label: "🎨 Hobbies & Fun", icon: Smile, color: "#db2777" },
  open: { label: "💬 Spontaneous Talk", icon: MessageCircle, color: "#087f79" },
};

const SEED_POSTS: CommunityPostItem[] = [
  {
    id: "post-1",
    authorName: "Shuttle Queen",
    authorUniqueId: "SU-2910-AS",
    authorRole: "Badminton Doubles Partner",
    authorAvatarSeed: 2,
    category: "sports",
    categoryLabel: "🏸 Sports & Fitness",
    location: "Janakpuri, Delhi",
    content:
      "Anyone up for badminton this Saturday 7:30 AM? Intermediate level, need a doubles partner. Court is reserved at SP Arena Janakpuri, just looking for 1 friendly player to join and unwind!",
    createdAt: "12m ago",
    likes: 12,
    repliesCount: 4,
  },
  {
    id: "post-2",
    authorName: "Junior Ronaldo",
    authorUniqueId: "SU-8492-RM",
    authorRole: "Football & Turf Striker",
    authorAvatarSeed: 1,
    category: "sports",
    categoryLabel: "⚽ Turf Football",
    location: "Gurgaon, Haryana",
    content:
      "Organizing a friendly 5-a-side weekend turf friendly near Cyber Hub / Sector 54. Looking for peers who love quick passing and good cardio. DM to join the squad!",
    createdAt: "24m ago",
    likes: 15,
    repliesCount: 6,
  },
  {
    id: "post-3",
    authorName: "Crazy Kohli",
    authorUniqueId: "SU-5183-VD",
    authorRole: "Box Cricket Enthusiast",
    authorAvatarSeed: 3,
    category: "sports",
    categoryLabel: "🏏 Box Cricket",
    location: "Noida, Uttar Pradesh",
    content:
      "Box cricket night under turf lights this Sunday 6:00 PM in Sector 62 Noida! Need 2 more players to balance the teams. Tennis ball, zero pressure, lots of fun.",
    createdAt: "45m ago",
    likes: 18,
    repliesCount: 7,
  },
  {
    id: "post-4",
    authorName: "Iron Gymmer",
    authorUniqueId: "SU-4391-PN",
    authorRole: "Morning Lifting & Mobility",
    authorAvatarSeed: 4,
    category: "sports",
    categoryLabel: "💪 Gym & Fitness",
    location: "Gurgaon, Haryana",
    content:
      "Looking for a 6:30 AM gym & mobility accountability buddy around DLF Phase 2. Staying consistent with functional workouts and stretching before morning work meetings.",
    createdAt: "1h ago",
    likes: 9,
    repliesCount: 3,
  },
  {
    id: "post-5",
    authorName: "Messed Messi",
    authorUniqueId: "SU-6029-SG",
    authorRole: "Weekend Sports Peer",
    authorAvatarSeed: 5,
    category: "sports",
    categoryLabel: "⚽ Sports Meetup",
    location: "Palwal, Haryana",
    content:
      "Anyone based in or around Palwal up for weekend badminton or turf football? Trying to get a regular local group going every Saturday morning!",
    createdAt: "2h ago",
    likes: 11,
    repliesCount: 5,
  },
  {
    id: "post-6",
    authorName: "Drop Shot Dave",
    authorUniqueId: "SU-3721-NS",
    authorRole: "Badminton Enthusiast",
    authorAvatarSeed: 6,
    category: "sports",
    categoryLabel: "🏸 Sports & Fitness",
    location: "Janakpuri, Delhi",
    content:
      "Smash rallies & drop shots! Looking for a sparring buddy for singles or doubles practice on weekdays after 6 PM. Can split court booking fee.",
    createdAt: "3h ago",
    likes: 14,
    repliesCount: 8,
  },
  {
    id: "post-7",
    authorName: "Cold Brew Charlie",
    authorUniqueId: "SU-9134-MJ",
    authorRole: "Remote Peer",
    authorAvatarSeed: 8,
    category: "coffee",
    categoryLabel: "☕ Coffee & Vent",
    location: "Auckland, New Zealand",
    content:
      "Working remotely overseas from New Zealand! Happy to hop on virtual coffee chats or share expat wellness thoughts with peers back home.",
    createdAt: "5h ago",
    likes: 21,
    repliesCount: 9,
  },
  {
    id: "post-8",
    authorName: "Zen Zebra",
    authorUniqueId: "SU-7241-SR",
    authorRole: "Yoga & Breathwork",
    authorAvatarSeed: 7,
    category: "mindful",
    categoryLabel: "🧘 Mindful & Walk",
    location: "South Delhi",
    content:
      "Morning mindfulness stroll and gentle yoga breathing in South Delhi parks at 7:00 AM. A quiet space to destress away from laptops.",
    createdAt: "6h ago",
    likes: 16,
    repliesCount: 4,
  },
];

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

export function CommunityLiveBoard() {
  const { user } = useInternetIdentity();
  const localProfile = useLocalProfile();

  // Compute current user's Unique ID
  const myEmail = user?.email || "alex@company.com";
  const myUniqueId = useMemo(() => {
    return getShortUniqueId(myEmail);
  }, [myEmail]);

  const myName = localProfile?.name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : "Alex Rivera");

  // Filter state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#category-dropdown-container")) {
        setShowCategoryMenu(false);
      }
    };
    if (showCategoryMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCategoryMenu]);

  // Post composer state
  const [showComposer, setShowComposer] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<CommunityPostItem["category"]>("coffee");
  const [newLocation, setNewLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Posts state with localStorage persistence
  const [posts, setPosts] = useState<CommunityPostItem[]>(SEED_POSTS);

  // 1-on-1 Direct Messaging state
  const [activeChatMember, setActiveChatMember] = useState<CommunityMember | null>(null);
  const [chatRegardingPost, setChatRegardingPost] = useState<CommunityPostItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [outgoingText, setOutgoingText] = useState("");
  const [isTypingPeer, setIsTypingPeer] = useState(false);

  // Badminton Matchmaking & Turf Booking Modal state
  const [turfModalOpen, setTurfModalOpen] = useState(false);
  const [turfModalPartner, setTurfModalPartner] = useState<{
    name: string;
    location: string;
  }>({ name: "Shuttle Queen", location: "Janakpuri, Delhi" });

  // Load stored posts from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("stress_unwind_community_posts_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }
  }, []);

  function savePosts(updated: CommunityPostItem[]) {
    setPosts(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("stress_unwind_community_posts_v2", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  }
  function openChatWithMember(member: CommunityMember, post: CommunityPostItem | null) {
    setActiveChatMember(member);
    setChatRegardingPost(post);

    // Load conversation history from localStorage
    const storageKey = `stress_unwind_chat_${myUniqueId}_${member.id}`;
    let history: ChatMessage[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) history = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (history.length === 0) {
      // Initial greeting setup
      if (post) {
        history = [
          {
            id: "m-seed-0",
            sender: "them",
            text: `Hey! Thanks for noticing my post about "${post.content.slice(0, 50)}...". Would love to connect and talk ahead!`,
            time: "Just now",
          },
        ];
      } else {
        history = [
          {
            id: "m-seed-0",
            sender: "them",
            text: `Hey! Glad you reached out. What's on your mind? Let's connect!`,
            time: "Just now",
          },
        ];
      }
    }

    setChatMessages(history);
  }

  // Send a direct message in the modal
  function handleSendMessage(customText?: string) {
    const textToSend = (customText || outgoingText).trim();
    if (!textToSend || !activeChatMember) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "me",
      text: textToSend,
      time: "Just now",
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setOutgoingText("");

    const storageKey = `stress_unwind_chat_${myUniqueId}_${activeChatMember.id}`;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    // Trigger realistic peer response after 1.2 seconds
    setIsTypingPeer(true);
    setTimeout(() => {
      setIsTypingPeer(false);
      let replyText = "Hey! That sounds fantastic. Let's definitely do this and talk ahead. What time works best for you?";
      if (chatRegardingPost?.category === "sports") {
        replyText = "Awesome! I'm bringing 2 rackets. Saturday 7:30 AM works great for me. Let's sync up on location coordinates!";
      } else if (chatRegardingPost?.category === "coffee") {
        replyText = "Count me in! Really need that caffeine and vent session today. I'm near 4th block, can meet at Third Wave or Starbucks around 5:30 PM!";
      } else if (chatRegardingPost?.category === "work") {
        replyText = "Great having you join the Pomodoro sprint! Sending over the Google Meet link in just a second. Let's crush this work together.";
      } else if (chatRegardingPost?.category === "mindful") {
        replyText = "So glad you're joining the morning walk! We meet near the park library entrance at 8:00 AM. See you there!";
      }

      const peerMsg: ChatMessage = {
        id: `m-peer-${Date.now()}`,
        sender: "them",
        text: replyText,
        time: "Just now",
      };

      setChatMessages((prev) => {
        const nextMsgs = [...prev, peerMsg];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, JSON.stringify(nextMsgs));
          } catch {
            // ignore
          }
        }
        return nextMsgs;
      });
      toast.success(`${activeChatMember.name} texted you back!`);
    }, 1200);
  }

  // Handle new post creation
  function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      const created: CommunityPostItem = {
        id: `post-${Date.now()}`,
        authorName: myName,
        authorUniqueId: myUniqueId,
        authorRole: "stress unwind member",
        authorAvatarSeed: 0,
        category: newCategory,
        categoryLabel: CATEGORY_META[newCategory].label,
        location: newLocation.trim() || "Open to all",
        content: newContent.trim(),
        createdAt: "Just now",
        likes: 1,
        liked: true,
        repliesCount: 0,
      };

      const updated = [created, ...posts];
      savePosts(updated);
      setNewContent("");
      setNewLocation("");
      setShowComposer(false);
      setIsPosting(false);
      toast.success("Your activity post is live! Other members can now text you directly.");
    }, 400);
  }

  // Like toggle
  function handleToggleLike(postId: string) {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const liked = !p.liked;
        return {
          ...p,
          liked,
          likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }
      return p;
    });
    savePosts(updated);
  }

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorUniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  return (
    <div className="community-live-board" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Top Banner: Community & Direct Peer Texting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #047857 100%)",
          color: "white",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "18px",
          boxShadow: "0 8px 20px -6px rgba(13, 148, 136, 0.2)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "3px 8px",
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <ShieldCheck size={13} /> Anonymous &amp; Encrypted
              </span>
              <span style={{ fontSize: "11px", opacity: 0.85 }}>● 142 Active Peers</span>
            </div>

            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "white" }}>
              Community Board &amp; Direct Texting
            </h2>
          </div>

          {/* Current Member Status Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.14)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "12px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {myName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>
                {myName}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.9, display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                Online &amp; ready to connect
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Action Bar: Category Dropdown & Post Composer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Active Category Display Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "12px",
              background: "#087f79",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 650,
              boxShadow: "0 2px 8px rgba(8, 127, 121, 0.25)",
            }}
          >
            <span>{CATEGORY_META[activeCategory as keyof typeof CATEGORY_META]?.label || "All Posts"}</span>
            {activeCategory !== "all" && (
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                title="Clear filter and show all"
                style={{
                  background: "rgba(255, 255, 255, 0.25)",
                  border: "none",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: "2px",
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Three-Dot (•••) Dropdown Trigger */}
          <div id="category-dropdown-container" style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowCategoryMenu((prev) => !prev)}
              aria-label="Filter categories"
              style={{
                background: showCategoryMenu ? "#f1f5f9" : "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                transition: "all 0.15s ease",
              }}
            >
              <MoreHorizontal size={18} />
              <ChevronDown
                size={14}
                style={{
                  transition: "transform 0.2s ease",
                  transform: showCategoryMenu ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown Menu Popover */}
            <AnimatePresence>
              {showCategoryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 50,
                    minWidth: "250px",
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div
                    style={{
                      padding: "6px 10px 6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#94a3b8",
                      borderBottom: "1px solid #f1f5f9",
                      marginBottom: "4px",
                    }}
                  >
                    Select Community Topic
                  </div>

                  {Object.entries(CATEGORY_META).map(([key, meta]) => {
                    const isSelected = activeCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActiveCategory(key);
                          setShowCategoryMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "none",
                          background: isSelected ? "rgba(8, 127, 121, 0.1)" : "transparent",
                          color: isSelected ? "#087f79" : "#334155",
                          fontWeight: isSelected ? 650 : 500,
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.12s ease",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {meta.label}
                        </span>
                        {isSelected && <Check size={16} color="#087f79" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowComposer(!showComposer)}
          style={{
            background: showComposer ? "#f1f5f9" : "#087f79",
            color: showComposer ? "#334155" : "white",
            border: "1px solid",
            borderColor: showComposer ? "#cbd5e1" : "#087f79",
            borderRadius: "12px",
            padding: "9px 18px",
            fontSize: "13px",
            fontWeight: 650,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: showComposer ? "none" : "0 4px 12px rgba(8, 127, 121, 0.25)",
          }}
        >
          {showComposer ? <X size={16} /> : <PlusCircle size={16} />}
          {showComposer ? "Cancel Post" : "Post an Activity or Thought"}
        </button>
      </div>

      {/* Interactive Post Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            style={{
              overflow: "hidden",
              marginBottom: "26px",
            }}
          >
            <form
              onSubmit={handleCreatePost}
              style={{
                background: "#ffffff",
                border: "2px solid #99f6e4",
                borderRadius: "18px",
                padding: "20px 24px",
                boxShadow: "0 12px 30px -8px rgba(13, 148, 136, 0.15)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f766e", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} /> Share an Activity, Meetup, or Thought
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Posting as: <strong style={{ color: "#0f766e" }}>{myName}</strong>
                </span>
              </div>

              <textarea
                rows={3}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What do you feel like doing or talking about? (e.g. 'Looking for a badminton partner in HSR this Friday', 'Anyone free for a quick 20-min coffee vent?', 'Hosting a quiet co-working sprint tomorrow at 10 AM...')"
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                  marginBottom: "14px",
                }}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CommunityPostItem["category"])}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      background: "#f8fafc",
                    }}
                  >
                    <option value="coffee">☕ Coffee &amp; Vent</option>
                    <option value="sports">🏸 Sports &amp; Fitness</option>
                    <option value="work">💼 Work &amp; Co-working</option>
                    <option value="mindful">🧘 Mindful &amp; Walk</option>
                    <option value="hobbies">🎨 Hobbies &amp; Fun</option>
                    <option value="open">💬 Spontaneous Talk</option>
                  </select>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Location / Platform (e.g. Koramangala or Zoom)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        width: "200px",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting || !newContent.trim()}
                    style={{
                      background: "#087f79",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isPosting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Send size={14} /> {isPosting ? "Posting..." : "Publish Post"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Filter Bar */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            position: "relative",
            maxWidth: "460px",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="search"
            placeholder="Search activities, topics, or member names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "13px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Posts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredPosts.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px dashed #cbd5e1",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <MessageCircle size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#334155" }}>
              No activities found in this filter
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Be the first to post something in this category!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isMe = post.authorUniqueId === myUniqueId;
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="community-post-card"
                style={{
                  "--category-border-color": CATEGORY_META[post.category]?.color || "#0d9488",
                } as React.CSSProperties}
              >
                {/* Post Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "14px",
                        background: `hsl(${(post.authorAvatarSeed * 45 + 160) % 360}, 75%, 90%)`,
                        color: `hsl(${(post.authorAvatarSeed * 45 + 160) % 360}, 85%, 28%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "17px",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "15px", color: "#1e293b", fontWeight: 700 }}>
                          {post.authorName}
                        </strong>
                        <span className="author-unique-pill">
                          <Tag size={10} /> {post.authorUniqueId}
                        </span>
                        {isMe && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#ccfbf1",
                              color: "#0f766e",
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: "6px",
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                          {post.authorRole}
                        </span>
                        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>•</span>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category & Location Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 650,
                        padding: "5px 12px",
                        borderRadius: "20px",
                        background: "rgba(15, 118, 110, 0.08)",
                        color: "#0f766e",
                        border: "1px solid rgba(15, 118, 110, 0.2)",
                      }}
                    >
                      {post.categoryLabel}
                    </span>
                    {post.location && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#475569",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <MapPin size={13} color="#0d9488" /> {post.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.65",
                    color: "#334155",
                    margin: "0 0 18px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.content}
                </p>

                {/* Post Actions: Direct Texting CTA & Reactions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {/* Primary Direct Texting CTA */}
                    <button
                      type="button"
                      className="direct-text-btn"
                      onClick={() => {
                        const member: CommunityMember = {
                          id: post.authorUniqueId,
                          name: post.authorName,
                          role: post.authorRole,
                          avatarSeed: post.authorAvatarSeed,
                          initials: post.authorUniqueId.slice(-2) || "MB",
                          status: "Active member",
                          location: post.location || "Janakpuri, Delhi",
                        };
                        openChatWithMember(member, post);
                      }}
                    >
                      <MessageCircle size={15} /> Text Directly
                    </button>

                    {/* Quick Badminton / Turf Matchmaking CTA */}
                    {post.category === "sports" && (
                      <button
                        type="button"
                        onClick={() => {
                          setTurfModalPartner({
                            name: post.authorName,
                            location: post.location || "Janakpuri, Delhi",
                          });
                          setTurfModalOpen(true);
                        }}
                        style={{
                          background: "rgba(8, 127, 121, 0.08)",
                          color: "#087f79",
                          border: "1px solid rgba(8, 127, 121, 0.25)",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        🏸 Match &amp; Book Turf
                      </button>
                    )}

                    {/* Secondary Heart Like Reaction */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      style={{
                        background: post.liked ? "#fee2e2" : "#f8fafc",
                        color: post.liked ? "#dc2626" : "#64748b",
                        border: "1px solid",
                        borderColor: post.liked ? "#fca5a5" : "#e2e8f0",
                        borderRadius: "12px",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Heart size={15} fill={post.liked ? "currentColor" : "none"} />
                      <span>{post.likes}</span>
                    </button>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                    <span>{post.repliesCount} active peer threads</span>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {/* 1-on-1 Direct Messaging ("Text & Connect") Modal */}
      <AnimatePresence>
        {activeChatMember && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "16px",
            }}
            onClick={() => setActiveChatMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "520px",
                height: "640px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              }}
            >
              {/* Modal Top Header */}
              <div
                style={{
                  background: "#087f79",
                  color: "white",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    {activeChatMember.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "white" }}>
                        {activeChatMember.name}
                      </h3>
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.85, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                      {activeChatMember.status || "Online now"} • {activeChatMember.role}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveChatMember(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    color: "white",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Context Banner */}
              {chatRegardingPost && (
                <div
                  style={{
                    background: "#f0fdf4",
                    borderBottom: "1px solid #dcfce7",
                    padding: "8px 16px",
                    fontSize: "12px",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={13} />
                  <span>
                    Connected regarding: <em>&ldquo;{chatRegardingPost.content.slice(0, 48)}...&rdquo;</em>
                  </span>
                </div>
              )}

              {/* Location & Proximity Bar with Badminton Matchmaking Action */}
              {(() => {
                const peerLoc = activeChatMember.location || "Janakpuri, Delhi";
                const myLoc = localProfile?.location || "Janakpuri, Delhi";
                const prox = calculateProximity(myLoc, peerLoc);
                return (
                  <div
                    style={{
                      background: prox.isViableForMeetup ? "#f0fdfa" : "#fdf2f8",
                      borderBottom: prox.isViableForMeetup ? "1px solid #99f6e4" : "1px solid #fbcfe8",
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 700, color: "#1e293b" }}>
                        <MapPin size={13} color="#0f766e" /> {peerLoc}
                      </span>
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          background: prox.isViableForMeetup ? "rgba(13, 148, 136, 0.15)" : "rgba(219, 39, 119, 0.15)",
                          color: prox.isViableForMeetup ? "#0f766e" : "#be185d",
                        }}
                      >
                        {prox.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTurfModalPartner({
                          name: activeChatMember.name,
                          location: peerLoc,
                        });
                        setTurfModalOpen(true);
                      }}
                      style={{
                        background: "#087f79",
                        color: "white",
                        border: "none",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: "0 2px 4px rgba(8, 127, 121, 0.2)",
                      }}
                    >
                      🏸 Coordinate Badminton &amp; Book Turf
                    </button>
                  </div>
                );
              })()}

              {/* Chat Message Scrollable Container */}
              <div
                style={{
                  flex: 1,
                  padding: "18px 20px",
                  overflowY: "auto",
                  background: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ textAlign: "center", margin: "4px 0 8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "#e2e8f0",
                      color: "#64748b",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Direct 1-on-1 peer conversation • End-to-end messaging
                  </span>
                </div>

                {chatMessages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "80%",
                          padding: "10px 14px",
                          borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isMe ? "#087f79" : "#ffffff",
                          color: isMe ? "#ffffff" : "#1e293b",
                          fontSize: "13.5px",
                          lineHeight: "1.5",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                          border: isMe ? "none" : "1px solid #e2e8f0",
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.text}</p>
                        <div
                          style={{
                            fontSize: "10px",
                            opacity: 0.7,
                            textAlign: "right",
                            marginTop: "4px",
                          }}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTypingPeer && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div
                      style={{
                        padding: "8px 14px",
                        borderRadius: "16px",
                        background: "#ffffff",
                        color: "#64748b",
                        fontSize: "12px",
                        border: "1px solid #e2e8f0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{activeChatMember.name} is typing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Icebreaker Suggestions */}
              <div
                style={{
                  background: "#ffffff",
                  borderTop: "1px solid #e2e8f0",
                  padding: "8px 16px",
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSendMessage("Hey! Saw your post, are you free to connect?")}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  &ldquo;Free to connect?&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Hi! Would love to chat and talk ahead about this.")}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  &ldquo;Love to chat ahead!&rdquo;
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Hey! Count me in, let's lock in details.")}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  &ldquo;Count me in!&rdquo;
                </button>
              </div>

              {/* Text Input Footer */}
              <div
                style={{
                  padding: "12px 16px 16px",
                  background: "#ffffff",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder={`Message ${activeChatMember.name}...`}
                  value={outgoingText}
                  onChange={(e) => setOutgoingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!outgoingText.trim()}
                  style={{
                    background: outgoingText.trim() ? "#087f79" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0 18px",
                    cursor: outgoingText.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badminton Matchmaking & Turf Slot Booking Modal */}
      <BadmintonTurfBookingModal
        isOpen={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        partnerCuteName={turfModalPartner.name}
        partnerLocation={turfModalPartner.location}
        userCuteName={localProfile?.name || "Smash Sensation"}
        userLocation={localProfile?.location || "Janakpuri, Delhi"}
      />
    </div>
  );
}
