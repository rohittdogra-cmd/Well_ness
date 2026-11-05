import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Use the appointment form on this website." },
      { status: 403, headers },
    );
  const secret = process.env.GUEST_BOOKING_SERVER_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!secret || !url || !key)
    return NextResponse.json(
      { message: "Guest appointment requests are temporarily unavailable." },
      { status: 503, headers },
    );
  try {
    if (Number(request.headers.get("content-length")) > 2048)
      throw new Error("Request too large");
    const input = await request.json();
    if (
      !Number.isSafeInteger(input.provider) ||
      input.provider < 1 ||
      typeof input.email !== "string" ||
      input.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
      typeof input.time !== "string" ||
      !Number.isFinite(Date.parse(input.time))
    )
      return NextResponse.json(
        { message: "Enter a valid email and preferred appointment time." },
        { status: 400, headers },
      );
    const ip =
      request.headers.get("x-vercel-forwarded-for") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const requesterHash = createHmac("sha256", secret).update(ip).digest("hex");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.rpc("request_guest_appointment", {
      p_provider: input.provider,
      p_time: input.time,
      p_email: input.email.trim(),
      p_server_key: secret,
      p_requester_hash: requesterHash,
    });
    if (error)
      return NextResponse.json(
        { message: error.message },
        { status: 400, headers },
      );
    return NextResponse.json(data, { status: 201, headers });
  } catch {
    return NextResponse.json(
      { message: "Could not request this appointment. Please try again." },
      { status: 400, headers },
    );
  }
}
