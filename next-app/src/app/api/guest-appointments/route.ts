import { NextResponse } from "next/server";
// Existing private receipt links still work. New care requests require an account.
export async function POST() {
  return NextResponse.json(
    { message: "Please sign in to request care." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}
