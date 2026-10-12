export interface StoredAccount {
  id: string;
  email: string;
  password?: string;
  memberType: "professional" | "student";
  name?: string;
  role?: "admin" | "member";
  createdAt: string;
  lastLoginAt: string;
}

export const ADMIN_EMAILS: readonly string[] = [
  "chhavi.dogra@gmail.com",
  "chhavi0889@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isValidAdminCredentials(email: string, password?: string): boolean {
  if (!email || !isAdminEmail(email)) return false;
  if (!password) return false;
  const p = password.trim();
  const lower = p.toLowerCase();
  
  // Accept both primary assigned passwords across admin accounts
  if (
    p === "Stress@420" ||
    p === "Stress@421" ||
    lower === "stress@420" ||
    lower === "stress@421" ||
    lower === "stress420" ||
    lower === "stress421"
  ) {
    return true;
  }
  
  // Also accept any password saved or updated for this admin account
  const stored = getStoredAccountByEmail(email);
  if (stored?.password && stored.password.trim() === p) {
    return true;
  }
  
  return false;
}

export const SEEDED_ACCOUNTS: Record<string, StoredAccount> = {
  "chhavi.dogra@gmail.com": {
    id: "a0000001-0000-4000-8000-000000000001",
    email: "chhavi.dogra@gmail.com",
    password: "Stress@420",
    memberType: "professional",
    name: "Chhavi Dogra (Admin)",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: "2026-01-01T00:00:00.000Z",
  },
  "chhavi0889@gmail.com": {
    id: "a0000002-0000-4000-8000-000000000002",
    email: "chhavi0889@gmail.com",
    password: "Stress@421",
    memberType: "professional",
    name: "Chhavi Dogra (SuperAdmin)",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: "2026-01-01T00:00:00.000Z",
  },
  "alex@company.com": {
    id: "11111111-1111-4111-8111-111111111111",
    email: "alex@company.com",
    password: "password123",
    memberType: "professional",
    name: "Alex Rivera",
    role: "member",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: "2026-01-01T00:00:00.000Z",
  },
};

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
  if (norm === "chhavi.dogra@gmail.com") {
    return "a0000001-0000-4000-8000-000000000001";
  }
  if (norm === "chhavi0889@gmail.com") {
    return "a0000002-0000-4000-8000-000000000002";
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
  if (typeof window === "undefined") return { ...SEEDED_ACCOUNTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Record<string, StoredAccount> = raw ? JSON.parse(raw) : {};
    // Ensure seeded accounts (including both admins) exist
    let updated = false;
    for (const [key, val] of Object.entries(SEEDED_ACCOUNTS)) {
      if (!parsed[key]) {
        parsed[key] = val;
        updated = true;
      }
    }
    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch (e) {
    console.error("Error reading stored accounts", e);
    return { ...SEEDED_ACCOUNTS };
  }
}

export function getStoredAccountByEmail(email: string): StoredAccount | undefined {
  if (!email) return undefined;
  const accounts = getStoredAccounts();
  const key = email.trim().toLowerCase();
  return accounts[key] || SEEDED_ACCOUNTS[key];
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
