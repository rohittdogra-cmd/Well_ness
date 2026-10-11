export interface StoredAccount {
  id: string;
  email: string;
  password?: string;
  memberType: "professional" | "student";
  name?: string;
  createdAt: string;
  lastLoginAt: string;
}

const STORAGE_KEY = "wellness_stored_accounts";
const LAST_EMAIL_KEY = "wellness_last_account_email";

/**
 * Generate a consistent, deterministic UUID for an email address.
 * Preserves the fixture UUID for the default demo/test email.
 */
export function deterministicIdForEmail(email: string): string {
  const norm = email.trim().toLowerCase();
  if (
    norm === "alex@example.com" ||
    norm === "alex@example.test" ||
    norm === "alex@company.com"
  ) {
    return "11111111-1111-4111-8111-111111111111";
  }

  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < norm.length; i++) {
    const ch = norm.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + ch;
    hash1 |= 0;
    hash2 = (hash2 << 7) - hash2 + ch;
    hash2 |= 0;
  }
  const hex1 = Math.abs(hash1).toString(16).padStart(8, "0");
  const hex2 = Math.abs(hash2).toString(16).padStart(8, "0");
  const hex3 = Math.abs((hash1 ^ hash2) >>> 0).toString(16).padStart(8, "0");
  const hex4 = Math.abs((hash1 * 31 + hash2) >>> 0).toString(16).padStart(8, "0");

  const p1 = (hex1 + hex2).slice(0, 8);
  const p2 = (hex2 + hex3).slice(0, 4);
  const p3 = "4" + (hex3 + hex4).slice(1, 4);
  const p4 = "a" + (hex4 + hex1).slice(1, 4);
  const p5 = (hex1 + hex2 + hex3 + hex4).slice(0, 12);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
}

export function getStoredAccounts(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Error reading stored accounts", e);
    return {};
  }
}

export function getStoredAccountByEmail(email: string): StoredAccount | undefined {
  if (!email) return undefined;
  const accounts = getStoredAccounts();
  return accounts[email.trim().toLowerCase()];
}

export function saveStoredAccount(account: StoredAccount): void {
  if (typeof window === "undefined" || !account.email) return;
  try {
    const accounts = getStoredAccounts();
    const key = account.email.trim().toLowerCase();
    accounts[key] = {
      ...account,
      email: key,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem(LAST_EMAIL_KEY, key);
  } catch (e) {
    console.error("Error saving stored account", e);
  }
}

export function getLastLoginEmail(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export function setLastLoginEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
  } catch {}
}

export function clearLastLoginEmail(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_EMAIL_KEY);
  } catch {}
}

export function removeStoredAccount(email: string): void {
  if (typeof window === "undefined" || !email) return;
  try {
    const accounts = getStoredAccounts();
    const key = email.trim().toLowerCase();
    delete accounts[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    if (getLastLoginEmail() === key) {
      clearLastLoginEmail();
    }
  } catch (e) {
    console.error("Error removing stored account", e);
  }
}
