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
import { toast } from "sonner";

const mainLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Conversations", href: "/discuss", icon: MessageCircle },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "People", href: "/people", icon: Users },
  { label: "Activities", href: "/book-activities", icon: Compass },
  { label: "Care", href: "/psychologists", icon: HeartHandshake },
];
const accountLinks = [
  { label: "My calendar", href: "/my-sessions", icon: CalendarDays },
  { label: "My profile", href: "/profile", icon: UserRound },
  { label: "Verification", href: "/verify", icon: ShieldCheck },
  { label: "Account & security", href: "/account", icon: Settings },
  { label: "Provider workspace", href: "/provider", icon: Stethoscope },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
                <SheetTitle>Make room for you.</SheetTitle>
                <SheetDescription>
                  Your circles, plans and care, in one place.
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Expanded navigation">
                {[...mainLinks, ...accountLinks].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active(item.href) ? "page" : undefined}
                    onClick={() => setMenu(false)}
                  >
                    <item.icon size={19} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                className="hub-drawer-signout"
                disabled={busy}
                onClick={signOut}
              >
                <LogOut size={18} />
                {busy ? "Signing out…" : "Sign out"}
              </button>
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
              <Link className="wellness-button" href="/signin">
                Member sign in
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
                    {accountLinks.map((item) => (
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
