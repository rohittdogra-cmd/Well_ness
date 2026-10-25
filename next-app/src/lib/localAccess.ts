// Explicitly enabled by dev:local; never enables access in a production build.
export const localAccess =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_LOCAL_ACCESS === "true";
