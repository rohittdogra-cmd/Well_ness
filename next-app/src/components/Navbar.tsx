import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  ChevronDown,
  Gauge,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  Stethoscope,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "../hooks/useQueries";
import { PROGRAM_CONFIGS, PROGRAM_ORDER } from "../lib/programConfig";

export function Navbar() {
  const pathname = usePathname() || "/";
  const { identity, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-border/50 shadow-glow">
        <div className="container max-w-6xl mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              data-ocid="nav.home_link"
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
                Stress Relief Hub
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                data-ocid="nav.home_link"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Home
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav.programs_link"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/programs")
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    Programs <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {PROGRAM_ORDER.map((type) => {
                    const cfg = PROGRAM_CONFIGS[type];
                    return (
                      <DropdownMenuItem key={type} asChild>
                        <Link
                          href={`/programs/${type}`}

                          className="flex items-center gap-2"
                        >
                          <span className="text-base">{cfg.emoji}</span>
                          <span>{cfg.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/book-activities"
                data-ocid="nav.link"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/book-activities")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Book Activities
              </Link>

              <Link
                href="/about"
                data-ocid="nav.about_link"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/about")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                data-ocid="nav.contact_link"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/contact")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Contact
              </Link>
              <Link
                href="/membership"
                data-ocid="nav.membership_link"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/membership")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Membership
              </Link>
              <Link
                href="/psychologists"
                data-ocid="nav.psychologists_link"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/psychologists")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Psychologists
              </Link>
              <Link
                href="/groups"
                data-ocid="nav.groups_link"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/groups")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Groups
              </Link>
              <Link
                href="/coming-soon"
                data-ocid="nav.coming_soon_link"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/coming-soon")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Co-Work Spaces
              </Link>

              {isAuthenticated && (
                <Link
                  href="/my-sessions"
                  data-ocid="nav.my_sessions_link"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/my-sessions")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  My Sessions
                </Link>
              )}
            </div>

            {/* Auth + Mobile toggle */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
                      data-ocid="nav.toggle"
                    >
                      <div className="relative">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                            {initials ?? <User className="w-3.5 h-3.5" />}
                          </AvatarFallback>
                        </Avatar>
                        {isAdmin && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Shield className="w-2 h-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground max-w-[80px] truncate">
                          {profile?.name ?? "Account"}
                        </span>
                        {isAdmin && (
                          <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2"
                        data-ocid="nav.profile_link"
                      >
                        <User className="w-4 h-4 text-primary" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2"
                            data-ocid="nav.dashboard_link"
                          >
                            {isAdmin ? (
                              <Shield className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Gauge className="w-4 h-4" />
                            )}
                            Admin panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/my-sessions"
                        className="flex items-center gap-2"
                        data-ocid="nav.my_sessions_link"
                      >
                        <Sparkles className="w-4 h-4" />
                        My Sessions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clear}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                      data-ocid="nav.logout_button"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/signin"
                  className="hidden md:block"
                  data-ocid="nav.signin_link"
                >
                  <Button
                    size="sm"
                    disabled={isLoggingIn || isInitializing}
                    data-ocid="nav.login_button"
                    className="rounded-full"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    {isLoggingIn ? "Connecting…" : "Sign in"}
                  </Button>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50"
            >
              <div className="container px-4 py-4 space-y-1">
                <Link
                  href="/"
                  data-ocid="nav.home_link"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  Programs
                </div>
                {PROGRAM_ORDER.map((type) => {
                  const cfg = PROGRAM_CONFIGS[type];
                  return (
                    <Link
                      key={type}
                      href={`/programs/${type}`}

                      data-ocid="nav.programs_link"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{cfg.emoji}</span>
                      {cfg.label}
                    </Link>
                  );
                })}
                <Link
                  href="/book-activities"
                  data-ocid="nav.link"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  Book Activities
                </Link>
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  Company
                </div>
                <Link
                  href="/about"
                  data-ocid="nav.about_link"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  data-ocid="nav.contact_link"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/careers"
                  data-ocid="nav.careers_link"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Careers
                </Link>
                <Link
                  href="/membership"
                  data-ocid="nav.membership_link"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Membership
                </Link>
                <Link
                  href="/psychologists"
                  data-ocid="nav.psychologists_link"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Stethoscope className="w-4 h-4" />
                  Psychologists
                </Link>
                <Link
                  href="/groups"
                  data-ocid="nav.groups_link"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  Groups
                </Link>
                <Link
                  href="/coming-soon"
                  data-ocid="nav.coming_soon_link"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Co-Work Spaces
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/profile"
                      data-ocid="nav.profile_mobile_link"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="w-4 h-4 text-primary" />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          data-ocid="nav.dashboard_link"
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {isAdmin ? (
                            <Shield className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Gauge className="w-4 h-4" />
                          )}
                          Admin panel
                          {isAdmin && (
                            <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 ml-auto">
                              Admin
                            </Badge>
                          )}
                        </Link>
                      </>
                    )}
                    <Link
                      href="/my-sessions"
                      data-ocid="nav.my_sessions_link"
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Sessions
                    </Link>
                  </>
                )}
                <div className="pt-2 border-t border-border/50">
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        clear();
                        setMobileOpen(false);
                      }}
                      data-ocid="nav.logout_button"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  ) : (
                    <Link
                      href="/signin"
                      onClick={() => setMobileOpen(false)}
                      data-ocid="nav.signin_link"
                    >
                      <Button
                        className="w-full"
                        disabled={isLoggingIn || isInitializing}
                        data-ocid="nav.login_button"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {isLoggingIn ? "Connecting…" : "Sign in"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
