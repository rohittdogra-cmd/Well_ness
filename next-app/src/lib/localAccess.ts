// Explicitly enabled in development via NEXT_PUBLIC_LOCAL_ACCESS, NEXT_PUBLIC_SKIP_AUTH, or localStorage bypass.
export const localAccess =
  process.env.NODE_ENV === "development" &&
  (process.env.NEXT_PUBLIC_LOCAL_ACCESS === "true" ||
    process.env.NEXT_PUBLIC_SKIP_AUTH === "true" ||
    (typeof window !== "undefined" &&
      window.localStorage?.getItem("wellness_skip_auth") === "true"));
