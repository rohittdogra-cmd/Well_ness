export function profileIsComplete(
  profile:
    | {
        name?: string;
        interests?: string[];
        availability?: string[];
        goal?: string;
      }
    | null
    | undefined,
) {
  return (
    !!profile &&
    (profile.name?.trim().length ?? 0) >= 2 &&
    !!profile.interests?.length &&
    !!profile.availability?.length &&
    !!profile.goal?.trim()
  );
}
