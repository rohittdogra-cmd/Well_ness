"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  ArrowUpRight,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { useGroups, useCommunityAction } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import { toast } from "sonner";
const subscribeToLocation = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
export function GroupsPage() {
  const groups = useGroups();
  const { user, login } = useInternetIdentity();
  const action = useCommunityAction();
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);
  const initialCategory = useSyncExternalStore(
    subscribeToLocation,
    () => new URLSearchParams(window.location.search).get("category") || "",
    () => "",
  );
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const category =
    selectedCategory ??
    (groupCategories.some((c) => c.id === initialCategory)
      ? initialCategory
      : "");
  const [create, setCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newCategory, setNewCategory] = useState("sports");
  const filtered =
    groups.data?.filter(
      (g) =>
        (!mine || g.group_members.some((m) => m.user_id === user?.id)) &&
        (!category || g.category === category) &&
        `${g.name} ${g.description} ${getCategory(g.category).name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) ?? [];
  const chosen = getCategory(category);
  return (
    <div className="hub-page discover-page">
      <header className="discover-heading">
        <div>
          <span className="eyebrow">YOUR COMMUNITY, YOUR WAY</span>
          <h1>Find your next connection.</h1>
          <p>Start with an interest. Stay for the people.</p>
        </div>
        <button
          className="wellness-button"
          aria-expanded={create}
          onClick={() => {
            if (!user) {
              login();
              return;
            }
            setCreate(!create);
            setNewCategory(category || "sports");
          }}
        >
          <Plus size={18} /> Create a subgroup
        </button>
      </header>
      <div className="discovery-banner">
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
      </div>
      <div className="group-toolbar">
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
            onClick={() => {
              if (!user) {
                login();
                return;
              }
              setMine(true);
            }}
          >
            My groups
          </button>
        </div>
      </div>
      {create && (
        <form
          className="composer create-group-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await action.mutateAsync({
                name: "create_group",
                args: {
                  p_name: name,
                  p_description: description,
                  p_category: newCategory,
                },
              });
              setCreate(false);
              setName("");
              setDescription("");
              setCategory(newCategory);
              setSearch("");
              setMine(false);
              toast.success("Your subgroup is ready.");
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Could not create group",
              );
            }
          }}
        >
          <div className="section-title">
            <h2>Bring your people together</h2>
            <button
              type="button"
              aria-label="Close group form"
              className="icon-button"
              onClick={() => setCreate(false)}
            >
              <X size={20} />
            </button>
          </div>
          <label className="field-label" htmlFor="group-category">
            Main category
          </label>
          <select
            id="group-category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            {groupCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="field-label" htmlFor="group-name">
            Subgroup name
          </label>
          <input
            id="group-name"
            required
            minLength={2}
            maxLength={60}
            placeholder="e.g. Weekend football crew"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="field-label" htmlFor="group-description">
            What brings this group together?
          </label>
          <textarea
            id="group-description"
            required
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="composer-actions">
            <button
              type="button"
              className="text-action"
              onClick={() => setCreate(false)}
            >
              Cancel
            </button>
            <button className="wellness-button" disabled={action.isPending}>
              {action.isPending ? "Creating…" : "Create subgroup"}
            </button>
          </div>
        </form>
      )}
      <div className="section-title">
        <h2>{category ? chosen.name : "Explore by category"}</h2>
        {category && (
          <button className="text-action" onClick={() => setCategory("")}>
            <ArrowLeft size={16} /> All categories
          </button>
        )}
      </div>
      <div
        className={`category-grid ${category ? "compact" : ""}`}
        aria-label="Group categories"
      >
        {groupCategories.map((c) => (
          <button
            key={c.id}
            className={`category-card ${c.color} ${category === c.id ? "selected" : ""}`}
            aria-pressed={category === c.id}
            onClick={() => setCategory(category === c.id ? "" : c.id)}
          >
            <span className="category-symbol">
              <c.icon size={25} />
            </span>
            <strong>{c.name}</strong>
            {!category && (
              <>
                <p>{c.examples}</p>
                <span className="category-foot">
                  {groups.data
                    ? `${groups.data.filter((g) => g.category === c.id).length} subgroups`
                    : "Explore subgroups"}
                  <ArrowUpRight size={17} />
                </span>
              </>
            )}
          </button>
        ))}
      </div>
      <div className="section-title results-heading">
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
          {filtered.length} {filtered.length === 1 ? "group" : "groups"}
        </span>
      </div>
      {groups.isPending ? (
        <p role="status">Loading your groups…</p>
      ) : groups.error ? (
        <div className="empty-state" role="alert">
          <p>We couldn’t load your groups.</p>
          <button className="wellness-button" onClick={() => groups.refetch()}>
            Try again
          </button>
        </div>
      ) : !filtered.length ? (
        <div className="empty-state">
          <Users />
          <h2>
            {mine ? "Your next group is waiting." : "No matching groups yet."}
          </h2>
          <p>Try another category or create a subgroup around your interest.</p>
          <button
            className="text-action"
            onClick={() => {
              setSearch("");
              setCategory("");
              setMine(false);
            }}
          >
            Explore all groups
          </button>
        </div>
      ) : (
        <div className="subgroup-grid">
          {filtered.map((g) => {
            const c = getCategory(g.category);
            const joined = g.group_members.some((m) => m.user_id === user?.id);
            return (
              <Link
                className="subgroup-card"
                key={g.id}
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
                    {g.member_count ?? g.group_members.length}{" "}
                    {(g.member_count ?? g.group_members.length) === 1
                      ? "member"
                      : "members"}
                  </span>
                  {joined ? (
                    <b>
                      <Check size={14} /> Joined
                    </b>
                  ) : (
                    <strong>Explore group →</strong>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
