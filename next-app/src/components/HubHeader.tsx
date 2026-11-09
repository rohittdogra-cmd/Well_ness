"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Flower2,
  Menu,
  House,
  MessageCircle,
  Users,
  Compass,
  CalendarDays,
  HeartHandshake,
  UserRound,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Settings,
  Stethoscope,
  LayoutDashboard,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Notifications } from "./Notifications";
import { Mascot } from "./Mascot";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import { toast } from "sonner";

const mainLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Conversations", href: "/discuss", icon: MessageCircle },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "People", href: "/people", icon: Users },
  { label: "Activities", href: "/book-activities", icon: Compass },
  { label: "Care", href: "/psychologists", icon: HeartHandshake },
];
const navigationNotes: Record<string, string> = {
  "/": "Your daily pause",
  "/discuss": "Read, share & feel heard",
  "/groups": "Find your shared interests",
  "/people": "Meet your kind of people",
  "/book-activities": "Make a little time together",
  "/psychologists": "Support, on your terms",
};
const accountLinks = [
  { label: "My calendar", href: "/my-sessions", icon: CalendarDays },
  { label: "My profile", href: "/profile", icon: UserRound },
  { label: "Verification", href: "/verify", icon: ShieldCheck },
  { label: "Account & security", href: "/account", icon: Settings },
  { label: "Provider workspace", href: "/provider", icon: Stethoscope },
];
const mobileLinks = [
  mainLinks[0],
  mainLinks[2],
  { ...mainLinks[1], label: "Chat" },
  accountLinks[0],
  accountLinks[1],
];
export function HubHeader() {
  const path = usePathname();
  const profile = useLocalProfile();
  const { clear, user } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const visibleAccountLinks =
    isAdmin === true && user
      ? [
          ...accountLinks,
          { label: "Admin panel", href: "/admin", icon: LayoutDashboard },
        ]
      : accountLinks;
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const active = (href: string) =>
    path === href || (href !== "/" && path.startsWith(href + "/"));
  async function signOut() {
    setBusy(true);
    try {
      await clear();
      setMenu(false);
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="hub-header">
        <div className="hub-header-inner">
          <Sheet open={menu} onOpenChange={setMenu}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="hub-icon-button mobile-menu-trigger"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="hub-navigation-drawer">
              <SheetHeader>
                <div className="drawer-brand-mark">
                  <Flower2 size={25} />
                  <span>stress & unwind</span>
                </div>
                <SheetTitle>A little space for you.</SheetTitle>
                <SheetDescription>
                  Good people. Shared interests. Room to recharge.
                </SheetDescription>
              </SheetHeader>
              <div className="drawer-section-label">EXPLORE YOUR SPACE</div>
              <nav aria-label="Expanded navigation">
                {mainLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active(item.href) ? "page" : undefined}
                    onClick={() => setMenu(false)}
                  >
                    <span className="drawer-link-icon">
                      <item.icon size={21} />
                    </span>
                    <span className="drawer-link-copy">
                      <strong>{item.label}</strong>
                      <small>{navigationNotes[item.href]}</small>
                    </span>
                    <ChevronRight className="drawer-link-arrow" size={17} />
                  </Link>
                ))}
              </nav>
              {user ? (
                <>
                  <div className="drawer-section-label">YOUR ACCOUNT</div>
                  <nav aria-label="Account navigation">
                    {visibleAccountLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active(item.href) ? "page" : undefined}
                        onClick={() => setMenu(false)}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </>
              ) : (
                <div className="drawer-invitation">
                  <strong>Found your kind of good?</strong>
                  <p>Sign in to connect, join groups and make plans.</p>
                  <Link
                    href={`/signin?next=${encodeURIComponent(path || "/")}`}
                    className="wellness-button"
                    onClick={() => setMenu(false)}
                  >
                    Sign in <ArrowUpRight size={16} />
                  </Link>
                </div>
              )}
              {user && (
                <button
                  className="hub-drawer-signout"
                  disabled={busy}
                  onClick={signOut}
                >
                  <LogOut size={18} />
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              )}
            </SheetContent>
          </Sheet>
          <Link
            className="hub-brand"
            href="/"
            aria-label="Stress & Unwind home"
          >
            <span>
              <Flower2 size={24} />
            </span>
            <div>
              stress & unwind<small>A little space for you.</small>
            </div>
          </Link>
          <nav className="hub-desktop-links" aria-label="Main navigation">
            {mainLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label === "Conversations" ? "Chat" : item.label}
              </Link>
            ))}
          </nav>
          <div className="hub-account-actions">
            {!user ? (
              <Link
                className="wellness-button"
                href={`/signin?next=${encodeURIComponent(path || "/")}`}
              >
                Sign in
              </Link>
            ) : (
              <>
                <Notifications />
                <Link
                  className="hub-profile-link"
                  href="/profile"
                  title="My profile"
                >
                  <Mascot variant={profile?.avatar ?? 0} />
                  <span>
                    <strong>{profile?.name || "Your profile"}</strong>
                    <small>My profile</small>
                  </span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hub-icon-button desktop-account-trigger"
                      aria-label="Account menu"
                    >
                      <ChevronDown size={17} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="hub-account-menu">
                    {visibleAccountLinks.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                          <item.icon size={17} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={busy} onSelect={signOut}>
                      <LogOut size={17} />
                      {busy ? "Signing out…" : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>
      {user && (
        <nav className="hub-bottom-nav" aria-label="Mobile navigation">
          {mobileLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
            >
              <item.icon size={21} />
              <span>
                {item.label === "My calendar"
                  ? "Calendar"
                  : item.label === "My profile"
                    ? "Profile"
                    : item.label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
