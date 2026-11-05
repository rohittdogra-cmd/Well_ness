import test from "node:test";
import assert from "node:assert/strict";
import { launchGate } from "../src/lib/launchGate.mjs";

const opens = "2026-11-05T17:42:00.000Z";
const hosts = "stress-unwind.com,www.stress-unwind.com";
const start = Date.parse(opens);

test("custom domain remains gated until precisely 11:12 PM IST", () => {
  const html = launchGate("stress-unwind.com", opens, hosts, start - 1);
  assert.match(html, /11:12 PM IST/);
  assert.match(html, /5 November 2026/);
  assert.match(html, /performance.now/);
  assert.equal(launchGate("stress-unwind.com", opens, hosts, start), null);
  assert.equal(launchGate("stress-unwind.com", opens, hosts, start + 1), null);
});

test("www is gated and Vercel URLs remain available for release checks", () => {
  assert.ok(launchGate("www.stress-unwind.com", opens, hosts, start - 1000));
  assert.equal(launchGate("well-ness-pink.vercel.app", opens, hosts, start - 1000), null);
  assert.equal(launchGate("stress-unwind.com.attacker.test", opens, hosts, start - 1000), null);
});

test("missing configuration leaves ordinary environments unchanged", () => {
  assert.equal(launchGate("localhost"), null);
  assert.equal(launchGate("stress-unwind.com", "invalid", hosts), null);
});
