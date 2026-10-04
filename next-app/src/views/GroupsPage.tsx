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
  const [error, setError] = useState("");

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
      <form className="modal-card" onSubmit={submit}>
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
          placeholder="Friendly weekend football games, all levels welcome."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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