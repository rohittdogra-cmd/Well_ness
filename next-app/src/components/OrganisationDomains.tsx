"use client";
import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
export function OrganisationDomains() {
  const qc = useQueryClient();
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("corporate");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["organisation-domains"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("organisation_domains")
        .select("domain,member_type")
        .order("domain");
      if (error) throw error;
      return data;
    },
  });
  async function save(remove = false, value = domain) {
    setBusy(true);
    setError("");
    try {
      const { error } = await getSupabase().rpc("set_organisation_domain", {
        p_domain: value.trim().toLowerCase(),
        p_type: type,
        p_remove: remove,
      });
      if (error) throw error;
      setDomain("");
      await qc.invalidateQueries({ queryKey: ["organisation-domains"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="care-workspace-section">
      <h3>Approved corporate & student domains</h3>
      <p>
        Only add domains you have confirmed belong to an eligible employer or
        institution. Other members need individually reviewed evidence. A custom
        email domain alone does not grant chat or booking access.
      </p>
      <form
        className="domain-approval-form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save();
        }}
      >
        <label>
          Organisation domain
          <input
            required
            placeholder="company.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </label>
        <label>
          Member type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="corporate">Corporate</option>
            <option value="student">Student</option>
          </select>
        </label>
        <button className="wellness-button" disabled={busy}>
          Approve domain
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {query.isPending ? (
        <p>Loading domains…</p>
      ) : query.error ? (
        <p role="alert">Could not load approved domains.</p>
      ) : (
        <ul className="approved-domains">
          {query.data?.map((d) => (
            <li key={d.domain}>
              <span>
                {d.domain} · {d.member_type}
              </span>
              <button disabled={busy} onClick={() => save(true, d.domain)}>
                Remove approval
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
