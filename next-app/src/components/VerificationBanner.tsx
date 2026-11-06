"use client";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { useVerification } from "@/hooks/useVerification";
export function VerificationBanner() {
  const { data, isPending } = useVerification();
  if (data?.verified || isPending) return null;
  return (
    <aside className="verification-banner">
      <ShieldCheck size={22} />
      <div>
        <strong>
          {data?.status === "pending"
            ? "Your verification is being reviewed"
            : "Look around. Find your people. Verify when you’re ready."}
        </strong>
        <p>
          Browsing is open. Verify to chat, connect and join activities. Care requests need a signed-in account only.
        </p>
      </div>
      <Link href="/verify">
        {data?.status === "pending" ? "View status" : "Get verified"}
        <ArrowUpRight size={17} />
      </Link>
    </aside>
  );
}
