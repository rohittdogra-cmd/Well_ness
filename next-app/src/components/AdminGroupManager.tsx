"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { groupCategories } from "@/lib/groupCategories";
import Link from "next/link";
export function AdminGroupManager() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("social");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <section className="admin-management-card">
      <h2 className="text-2xl">Create a community group</h2>
      <p>
        Create a group here, then manage conversations and membership through
        its group page.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setSaved(false);
          setBusy(true);
          try {
            const { error } = await getSupabase().rpc("admin_create_group", {
              p_name: name.trim(),
              p_description: description.trim(),
              p_category: category,
            });
            if (error) throw error;
            setSaved(true);
            setName("");
            setDescription("");
            await qc.invalidateQueries({ queryKey: ["groups"] });
            await qc.invalidateQueries({ queryKey: ["admin-metrics"] });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create group");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="admin-group-name">Group name</label>
        <input
          id="admin-group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={60}
        />
        <label htmlFor="admin-group-category">Category</label>
        <select
          id="admin-group-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {groupCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="admin-group-description">Description</label>
        <textarea
          id="admin-group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={500}
        />
        <button className="wellness-button" disabled={busy}>
          {busy ? "Creating…" : "Create group"}
        </button>
        {error && <p role="alert">{error}</p>}
        {saved && (
          <p role="status">
            Group created. <Link href="/groups">View groups →</Link>
          </p>
        )}
      </form>
    </section>
  );
}
