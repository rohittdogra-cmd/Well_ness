"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  MapPin,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Session } from "../backend.types";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useJoinSession, useLeaveSession } from "../hooks/useQueries";
import { formatDateTimeShort, getProgramConfig } from "../lib/programConfig";
import { isFull, isJoined, participantCount } from "../lib/session";

interface SessionCardProps {
  session: Session;
  index?: number;
  showJoinLeave?: boolean;
}

export function SessionCard({
  session,
  index = 0,
  showJoinLeave = true,
}: SessionCardProps) {
  const { identity, login } = useInternetIdentity();
  const cfg = getProgramConfig(session.programType);
  const joinMutation = useJoinSession();
  const leaveMutation = useLeaveSession();

  const principalStr = identity?.getPrincipal().toString();
  const isParticipant = isJoined(session, principalStr);
  const isCreator = principalStr
    ? session.creator.toString() === principalStr
    : false;
  const full = isFull(session);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please sign in to enroll");
      return;
    }
    try {
      await joinMutation.mutateAsync(session.id);
      toast.success("Enrolled in event!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll");
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await leaveMutation.mutateAsync(session.id);
      toast.success("Enrollment removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove enrollment");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      data-ocid={`session.item.${index + 1}`}
    >
      <Link href={`/sessions/${session.id.toString()}`}>
        <div className="group relative bg-card rounded-2xl border border-border hover:border-border/80 shadow-glow hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Top accent line */}
          <div className={`h-1 ${cfg.bgClass} opacity-80`} />

          <div className="p-4 sm:p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${cfg.badgeClass}`}
                  >
                    {cfg.emoji} {cfg.shortLabel}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {session.title}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {session.description}
            </p>

            {session.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/70" />
                <span className="truncate">{session.location}</span>
              </div>
            )}

            <div className="pt-3 mt-1 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[11px] sm:text-xs text-foreground/80">
                  <CalendarDays className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  {formatDateTimeShort(session.dateTime)}
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[11px] sm:text-xs">
                  <Users className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  {participantCount(session)}/
                  {session.maxParticipants.toString()}
                </span>
              </div>

              {showJoinLeave && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                  className="shrink-0 ml-auto"
                >
                  {!identity ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        login();
                      }}
                      data-ocid="session.signin_button"
                      className="text-xs h-7 px-2.5 whitespace-nowrap font-semibold"
                    >
                      Sign in to Enroll
                    </Button>
                  ) : isParticipant ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLeave}
                      disabled={leaveMutation.isPending}
                      data-ocid="session.leave_button"
                      className="text-xs h-7 px-2.5 whitespace-nowrap font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <UserMinus className="w-3.5 h-3.5 mr-1 shrink-0" />
                      )}
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleJoin}
                      disabled={joinMutation.isPending || full}
                      data-ocid="session.join_button"
                      className="text-xs h-7 px-3 whitespace-nowrap font-semibold shine-btn"
                    >
                      {joinMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : full ? (
                        "Full"
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1 shrink-0" />
                          Enroll
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div
      className="bg-card rounded-2xl border border-border shadow-glow overflow-hidden"
      data-ocid="session.loading_state"
    >
      <div className="h-1 bg-muted" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

