"use client";

import Link from "next/link";
import { AppointmentList } from "../components/AppointmentList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, LogIn, Plus } from "lucide-react";
import { motion } from "motion/react";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { SessionCard, SessionCardSkeleton } from "../components/SessionCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMySessions } from "../hooks/useQueries";

export function MySessionsPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data, isLoading, error, refetch } = useMySessions();

  const [created, joined] = data ?? [[], []];

  if (!isAuthenticated && !isInitializing) {
    return (
      <main className="pt-24 pb-20">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-24 bg-card rounded-3xl border border-border shadow-glow"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center mx-auto mb-5 text-3xl">
              🔐
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Sign in to see your sessions
            </h2>
            <p className="text-muted-foreground mb-7 max-w-sm mx-auto">
              Create and manage your wellness sessions after signing in.
            </p>
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
              className="rounded-full px-8"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoggingIn ? "Connecting…" : "Sign in"}
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Sessions
            </h1>
            <p className="text-muted-foreground">
              Sessions you’ve created and joined.
            </p>
          </div>
          {isAuthenticated && <CreateSessionModal />}
        </motion.div>

        {error && <div className="error-box" role="alert">{error.message}<button onClick={() => refetch()}>Retry</button></div>}<Tabs defaultValue="joined">
          <TabsList className="mb-6 rounded-xl bg-muted/60 p-1">
            <TabsTrigger
              value="created"
              data-ocid="my_sessions.created_tab"
              className="rounded-lg px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Created
              {!isLoading && created.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                  {created.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="joined"
              data-ocid="my_sessions.joined_tab"
              className="rounded-lg px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              Joined
              {!isLoading && joined.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                  {joined.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SessionCardSkeleton key="csk1" />
                <SessionCardSkeleton key="csk2" />
                <SessionCardSkeleton key="csk3" />
              </div>
            ) : created.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-card rounded-2xl border border-border"
                data-ocid="session.empty_state"
              >
                <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  No sessions created yet
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Start a new session and invite others to join.
                </p>
                <CreateSessionModal />
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {created.map((session, i) => (
                  <SessionCard
                    key={session.id.toString()}
                    session={session}
                    index={i}
                    showJoinLeave={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SessionCardSkeleton key="jsk1" />
                <SessionCardSkeleton key="jsk2" />
                <SessionCardSkeleton key="jsk3" />
              </div>
            ) : joined.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-card rounded-2xl border border-border"
                data-ocid="session.empty_state"
              >
                <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  No sessions joined yet
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Browse programs and join sessions that interest you.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/programs/meetup">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Programs
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {joined.map((session, i) => (
                  <SessionCard
                    key={session.id.toString()}
                    session={session}
                    index={i}
                    showJoinLeave
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs><AppointmentList />
      </div>
    </main>
  );
}

