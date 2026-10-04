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
      toast.error("Please sign in to join sessions");
      return;
    }
    try {
      await joinMutation.mutateAsync(session.id);
      toast.success("Joined session!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to join session");
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await leaveMutation.mutateAsync(session.id);
      toast.success("Left session");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to leave session");
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

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${cfg.badgeClass}`}
                  >
                    {cfg.emoji} {cfg.shortLabel}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground text-base leading-tight truncate group-hover:text-primary transition-colors">
                  {session.title}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {session.description}
            </p>

            {session.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{session.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDateTimeShort(session.dateTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {participantCount(session)}/
                  {session.maxParticipants.toString()}
                </span>
              </div>

              {showJoinLeave && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
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
                      className="text-xs h-7 px-2.5"
                    >
                      Sign in to Book
                    </Button>
                  ) : (
                    !isCreator &&
                    (isParticipant ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLeave}
                        disabled={leaveMutation.isPending}
                        data-ocid="session.leave_button"
                        className="text-xs h-7 px-2.5"
                      >
                        {leaveMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <UserMinus className="w-3 h-3 mr-1" />
                            Leave
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleJoin}
                        disabled={joinMutation.isPending || full}
                        data-ocid="session.join_button"
                        className="text-xs h-7 px-2.5"
                      >
                        {joinMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : full ? (
                          "Full"
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Join
                          </>
                        )}
                      </Button>
                    ))
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

