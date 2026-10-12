"use client";
import { useState, useSyncExternalStore } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Users,
  ArrowUpRight,
  ArrowLeft,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import {
  useGroups,
  useGroupCategoryCounts,
  useCommunityAction,
} from "@/hooks/useCommunity";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import { toast } from "sonner";
import Image from "next/image";

export function GroupsPage() {
  const subscribeToLocation = (callback: () => void) => {
    window.addEventListener("popstate", callback);
    return () => window.removeEventListener("popstate", callback);
  };
  const initialCategory = useSyncExternalStore(
    subscribeToLocation,
    () =>
      new URLSearchParams(window.location.search).get("category") || "",
    () => "",
  );
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const category =
    selectedCategory ??
    (groupCategories.some((c) => c.id === initialCategory)
      ? initialCategory
      : "");

  const groups = useGroups({
    category: category || null,
    search,
    joinedOnly: mine,
  });
  const counts = useGroupCategoryCounts();
  const filtered = groups.data?.pages.flat() ?? [];
  const chosen = getCategory(category);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setMine(false);
  }

  const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div 
      className="hub-page discover-page"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      <motion.header className="discover-heading" variants={fadeUp}>
        <div>
          <span className="eyebrow">YOUR COMMUNITY, YOUR WAY</span>
          <h1>Find your next connection.</h1>
          <p>Start with an interest. Stay for the people.</p>
        </div>
        <button
          className="wellness-button"
          onClick={() => setCreating(true)}
        >
          <Plus size={16} /> Create a subgroup
        </button>
      </motion.header>
      <motion.div className="discovery-banner circlein-banner" variants={fadeUp}>
        <span className="banner-icon">
          <Users size={30} />
        </span>
        <div>
          <h2>A place for every side of you.</h2>
          <p>
            From the office to campus, discover people who share what you love.
          </p>
        </div>
        <span className="banner-label">Explore. Join. Belong.</span>
      </motion.div>
      <motion.div className="group-toolbar modern-toolbar" variants={fadeUp}>
        <label className="search-field">
          <Search size={19} />
          <input
            type="search"
            aria-label="Search groups"
            placeholder="Search football, music, study circles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="segmented">
          <button
            aria-pressed={!mine}
            className={!mine ? "selected" : ""}
            onClick={() => setMine(false)}
          >
            Explore groups
          </button>
          <button
            aria-pressed={mine}
            className={mine ? "selected" : ""}
            onClick={() => setMine(true)}
          >
            My groups
          </button>
        </div>
      </motion.div>

      {/* ─── Category Quick Filter Pills ─── */}
      <motion.div 
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        variants={fadeUp}
        style={{ margin: "14px 0 20px" }}
      >
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            !category
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground"
          }`}
        >
          All Categories
        </button>
        {groupCategories.map((c) => {
          const isSelected = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              <c.icon size={13} />
              <span>{c.name}</span>
              {counts.data?.[c.id] !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {counts.data[c.id]}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      <motion.div className="section-title" variants={fadeUp}>
        <h2>{category ? chosen.name : "Explore by category"}</h2>
        {category && (
          <button className="text-action" onClick={() => setCategory("")}>
            <ArrowLeft size={16} /> All categories
          </button>
        )}
      </motion.div>
      {!category && (
        <motion.div 
          className="category-grid" 
          aria-label="Group categories"
          variants={stagger}
        >
          {groupCategories.map((c) => (
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              key={c.id}
              className={`category-card ${c.color}`}
              onClick={() => setCategory(c.id)}
            >
              <span className="category-symbol">
                <c.icon size={25} />
              </span>
              <strong>{c.name}</strong>
              <p>{c.examples}</p>
              <span className="category-foot">
                {counts.data
                  ? `${counts.data[c.id] ?? 0} subgroups`
                  : "Explore subgroups"}
                <ArrowUpRight size={17} />
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}
      <motion.div className="section-title results-heading" variants={fadeUp}>
        <h2>
          {mine
            ? "Your subgroups"
            : category
              ? `${chosen.name} subgroups`
              : search
                ? "Search results"
                : "All subgroups"}
        </h2>
        <span>
          {groups.data
            ? `${filtered.length}${groups.hasNextPage ? "+" : ""} ${
                filtered.length === 1 ? "group" : "groups"
              }`
            : "Loading"}
        </span>
      </motion.div>
      {groups.isPending ? (
        <p role="status">Loading your groups…</p>
      ) : groups.error ? (
        <div className="empty-state" role="alert">
          <p>We couldn&apos;t load your groups.</p>
          <button className="wellness-button" onClick={() => groups.refetch()}>
            Try again
          </button>
        </div>
      ) : !filtered.length ? (
        <motion.div className="empty-state" variants={fadeUp}>
          <Users />
          <h2>
            {mine
              ? "Your next group is waiting."
              : "No matching groups yet."}
          </h2>
          <p>
            Try another category, start your own subgroup, or check back soon
            for new groups.
          </p>
          <button className="text-action" onClick={resetFilters}>
            Explore all groups
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div className="subgroup-grid" variants={stagger}>
            {filtered.map((g) => {
              const c = getCategory(g.category);
              return (
                <motion.div key={g.id} variants={fadeUp} whileHover={{ y: -3 }}>
                  <Link
                    className="subgroup-card modern-subgroup-card"
                    href={`/groups/${g.slug}`}
                  >
                  {(g as any).image && (
                    <div style={{ position: "relative", width: "100%", height: "140px", marginBottom: "16px", borderRadius: "8px", overflow: "hidden", background: "#e8edea" }}>
                      <Image src={(g as any).image} alt={g.name} fill style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="subgroup-top">
                    <span className={`subgroup-symbol ${c.color}`}>
                      <c.icon size={24} />
                    </span>
                    <span className="category-tag">{c.name}</span>
                    <ArrowUpRight size={18} />
                  </div>
                  <h3>{g.name}</h3>
                  <p>{g.description}</p>
                  <div className="subgroup-footer">
                    <span>
                      <Users size={15} />
                      {g.member_count}{" "}
                      {g.member_count === 1 ? "member" : "members"}
                    </span>
                    {g.joined ? (
                      <b>
                        <Check size={14} /> Joined
                      </b>
                    ) : (
                      <strong>Explore group →</strong>
                    )}
                  </div>
                </Link>
                </motion.div>
              );
            })}
          </motion.div>
          {groups.hasNextPage && (
            <button
              className="wellness-button"
              disabled={groups.isFetchingNextPage}
              onClick={() => groups.fetchNextPage()}
            >
              {groups.isFetchingNextPage
                ? "Loading more…"
                : `Load more subgroups`}
            </button>
          )}
        </>
      )}
      {creating && (
        <CreateSubgroupDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setMine(true);
            setCategory("");
            setSearch("");
          }}
        />
      )}
    </motion.div>
  );
}

function CreateSubgroupDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const action = useCommunityAction();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("sports");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState("");

  const presetImages = [
    { label: "Turf Football", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80" },
    { label: "Cricket", url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80" },
    { label: "Yoga / Zen", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" },
    { label: "Coffee Meet", url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80" },
    { label: "Hiking / Aravali", url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80" },
    { label: "Coding / Tech", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" },
  ];

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Please select an image smaller than 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await action.mutateAsync({
        name: "create_group",
        args: {
          p_name: name.trim(),
          p_description: description.trim(),
          p_category: category,
          p_image: imagePreview || imageUrl || undefined,
        },
      });
      toast.success(`Your ${name.trim()} subgroup is live.`);
      onCreated();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create the subgroup.",
      );
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-subgroup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !action.isPending) onClose();
      }}
    >
      <form className="modal-card" onSubmit={submit} style={{ maxWidth: "520px" }}>
        <h2 id="create-subgroup-title">Start a subgroup</h2>
        <p className="muted">
          You will be the first member. Others can join from the directory.
        </p>

        <label className="field-label" htmlFor="subgroup-category">
          Main category
        </label>
        <select
          id="subgroup-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {groupCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="subgroup-name">
          Subgroup name
        </label>
        <input
          id="subgroup-name"
          required
          minLength={2}
          maxLength={60}
          placeholder="Weekend football crew"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="field-label" htmlFor="subgroup-description">
          What brings this group together?
        </label>
        <textarea
          id="subgroup-description"
          rows={3}
          maxLength={500}
          placeholder="Friendly weekend games, talks or walks, all levels welcome."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Group Image Upload & Preset */}
        <div style={{ marginTop: "12px", marginBottom: "14px" }}>
          <label className="field-label" style={{ display: "block", marginBottom: "6px" }}>
            Group Cover Image
          </label>

          {imagePreview && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "130px",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "10px",
                border: "1px solid #d1d5db",
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview("");
                  setImageUrl("");
                }}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label
              style={{
                cursor: "pointer",
                padding: "8px 14px",
                background: "rgba(20, 184, 166, 0.1)",
                color: "var(--teal-700)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px dashed var(--teal-500)",
                display: "inline-block",
              }}
            >
              Upload image from device
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </label>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>or pick a preset:</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {presetImages.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setImageUrl(p.url);
                  setImagePreview(p.url);
                }}
                style={{
                  padding: "6px 8px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  border: imagePreview === p.url ? "2px solid var(--teal-600)" : "1px solid #e5e7eb",
                  background: imagePreview === p.url ? "rgba(20, 184, 166, 0.1)" : "#f9fafb",
                  cursor: "pointer",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="signin-error">
            {error}
          </p>
        )}

        <div className="composer-actions">
          <button
            type="button"
            className="text-action"
            onClick={onClose}
            disabled={action.isPending}
          >
            Cancel
          </button>
          <button
            className="wellness-button"
            disabled={action.isPending || !name.trim()}
          >
            {action.isPending ? (
              <>
                <Loader2 size={16} /> Creating…
              </>
            ) : (
              "Create subgroup"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}