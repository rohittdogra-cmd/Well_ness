import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
function run(args, env = process.env) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: "inherit" });
  children.push(child);
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => stop(code ?? 0));
  return child;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

// Reuse the project's isolated in-memory demo API; no real account is needed.
run(["tests/fixture-server.mjs"], { ...process.env, LOCAL_DEMO: "true" });
let ready = false;
for (let attempt = 0; attempt < 50 && !stopping; attempt++) {
  try {
    const response = await fetch("http://127.0.0.1:54329/auth/v1/settings");
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 100));
}
if (!ready || stopping) {
  console.error("Could not start the local demo API on port 54329.");
  stop(1);
} else {
  run(
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      process.env.PORT || "3100",
    ],
    {
      ...process.env,
      NEXT_PUBLIC_LOCAL_ACCESS: process.env.LOCAL_ACCESS === "false" ? "false" : "true",
      NEXT_PUBLIC_SKIP_AUTH: "false",
      GUEST_BOOKING_SERVER_KEY: "local-preview-only",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-demo-publishable-key",
      NEXT_DIST_DIR: ".next-local",
    },
  );
}
