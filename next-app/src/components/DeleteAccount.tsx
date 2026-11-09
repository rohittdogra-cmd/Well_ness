"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsAdmin } from "@/hooks/useQueries";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
export function DeleteAccount() {
  const router = useRouter();
  const admin = useIsAdmin();
  const { clear } = useInternetIdentity();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="admin-management-card admin-danger">
      <h2 className="text-xl">Delete your account</h2>
      {admin.data === true ? (
        <p>
          Administrator accounts cannot be deleted here. Transfer administrator
          access before requesting deletion.
        </p>
      ) : (
        <>
          <p>
            This permanently deletes your account, profile, authored posts,
            memberships, activities and appointment requests. This cannot be
            undone. Messages you sent are removed; other members’ content
            remains.
          </p>
          {done ? (
            <p role="status">
              Your account has been deleted.{" "}
              <a href="/signin">Return to sign-in</a>
            </p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const { error } = await getSupabase().rpc(
                    "delete_own_account",
                    { p_confirmation: text },
                  );
                  if (error) throw error;
                  setDone(true);
                  await clear().catch(() => {});
                  router.replace("/signin");
                  router.refresh();
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Could not delete account",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label htmlFor="delete-account-confirm">
                Type DELETE MY ACCOUNT to confirm permanent deletion
              </label>
              <input
                id="delete-account-confirm"
                autoComplete="off"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {error && <p role="alert">{error}</p>}
              <button
                className="wellness-button"
                disabled={
                  busy || admin.isPending || text !== "DELETE MY ACCOUNT"
                }
              >
                {busy ? "Deleting…" : "Permanently delete my account"}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
