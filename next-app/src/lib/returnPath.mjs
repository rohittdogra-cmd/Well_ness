/** Accept only ordinary same-site destinations; never credentials or auth pages. */
export function safeReturnPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x20]/.test(value)
  )
    return "/";
  const url = new URL(value, "https://return.invalid");
  if (
    url.origin !== "https://return.invalid" ||
    /^\/(signin|auth|onboarding)(\/|$)/.test(url.pathname)
  )
    return "/";
  return url.pathname + url.search + url.hash;
}
