"use client";

import { EditSession } from "../components/EditSession";
import { downloadCalendar } from "../lib/calendar";
import { isFull, isJoined, participantCount } from "../lib/session";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@dfinity/principal";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckSquare,
  Loader2,
  LogIn,
  MapPin,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateTask,
  useDeleteSession,
  useJoinSession,
  useLeaveSession,
  useMarkTaskComplete,
  useSession,
  useTasksBySession,
} from "../hooks/useQueries";
import { ProgramType } from "../hooks/useQueries";
import { formatDateTime, getProgramConfig } from "../lib/programConfig";

export function SessionDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const sessionId = /^[0-9]{1,15}$/.test(id) ? BigInt(id) : 0n;

  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const {
    tasks,
    isLoading: tasksLoading,
    hasNextPage: hasMoreTasks,
    isFetchingNextPage,
    fetchNextPage,
  } = useTasksBySession(sessionId);
  const { identity, login, isLoggingIn } = useInternetIdentity();

  const joinMutation = useJoinSession();
  const leaveMutation = useLeaveSession();
  const deleteMutation = useDeleteSession();
  const createTaskMutation = useCreateTask();
  const markCompleteMutation = useMarkTaskComplete();

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");

  const principalStr = identity?.getPrincipal().toString();
  const isAuthenticated = !!identity;

  const isParticipant = session ? isJoined(session, principalStr) : false;
  const isCreator =
    session && principalStr
      ? session.creator.toString() === principalStr
      : false;
  const full = session ? isFull(session) : false;
  const isTaskSession = session?.programType === ProgramType.taskAllocation;

  const cfg = session ? getProgramConfig(session.programType) : null;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    try {
      await joinMutation.mutateAsync(sessionId);
      toast.success("Joined session!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to join session");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync(sessionId);
      toast.success("Left session");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to leave session");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(sessionId);
      toast.success("Session deleted");
      void router.push("/");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete session");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await createTaskMutation.mutateAsync({
        sessionId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedTo: taskAssignedTo.trim()
          ? (taskAssignedTo.trim() as unknown as Principal)
          : null,
      });
      toast.success("Task added!");
      setTaskTitle("");
      setTaskDescription("");
      setTaskAssignedTo("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to add task");
    }
  };

  const handleMarkComplete = async (taskId: bigint, _i: number) => {
    try {
      await markCompleteMutation.mutateAsync({ taskId, sessionId });
      toast.success("Task marked complete!");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update task");
    }
  };

  if (sessionLoading) {
    return (
      <main className="pt-24 pb-20">
        <div
          className="container max-w-3xl mx-auto px-4"
          data-ocid="session.loading_state"
        >
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-8 w-2/3 mb-3" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-8" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="pt-24 pb-20">
        <div
          className="container max-w-3xl mx-auto px-4 text-center py-20"
          data-ocid="session.error_state"
        >
          <p className="text-muted-foreground">Session not found.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link href="/programs/meetup">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to {cfg?.label}
            </Button>
          </Link>
        </motion.div>

        {/* Session Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border shadow-glow overflow-hidden mb-6"
        >
          <div className={`h-1.5 ${cfg?.bgClass}`} />
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {cfg && (
                  <Badge variant="outline" className={`mb-3 ${cfg.badgeClass}`}>
                    {cfg.emoji} {cfg.label}
                  </Badge>
                )}
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {session.title}
                </h1><button type="button" className="text-action my-3" onClick={() => downloadCalendar(session)}>Add to calendar ↗</button>{isCreator && <EditSession session={session} />}
              </div>

              {isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      data-ocid="session.delete_button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All participants will be
                        removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="session.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        data-ocid="session.confirm_button"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Delete Session"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {session.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Date & Time
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatDateTime(session.dateTime)}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Participants
                </div>
                <div className="text-sm font-medium text-foreground">
                  {participantCount(session)} /{" "}
                  {session.maxParticipants.toString()}
                  {full && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Full
                    </Badge>
                  )}
                </div>
              </div>
              {session.spaceName && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Space
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {session.spaceName}
                  </div>
                </div>
              )}
              {session.location && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {session.location}
                  </div>
                </div>
              )}
            </div>

            {/* Join / Leave */}
            {isAuthenticated && !isCreator && (
              <div>
                {isParticipant ? (
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={leaveMutation.isPending}
                    data-ocid="session.leave_button"
                    className="w-full sm:w-auto"
                  >
                    {leaveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserMinus className="w-4 h-4 mr-2" />
                    )}
                    Leave Session
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoin}
                    disabled={joinMutation.isPending || full}
                    data-ocid="session.join_button"
                    className="w-full sm:w-auto"
                  >
                    {joinMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {full ? "Session Full" : "Join Session"}
                  </Button>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to join
              </Button>
            )}
          </div>
        </motion.div>

        {/* Task Section (taskAllocation only) */}
        <AnimatePresence>
          {isTaskSession && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Tasks
                </h2>
                {tasks && (
                  <Badge variant="secondary" className="text-xs">
                    {tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
                    done
                  </Badge>
                )}
              </div>

              {/* Task list */}
              {tasksLoading ? (
                <div className="space-y-2" data-ocid="session.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <div
                  className="text-center py-10 text-muted-foreground bg-muted/30 rounded-2xl"
                  data-ocid="session.empty_state"
                >
                  No tasks yet. Add the first one below.
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task, i) => (
                    <motion.div
                      key={task.id.toString()}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        task.completed
                          ? "bg-muted/30 border-border/50 opacity-60"
                          : "bg-card border-border shadow-glow"
                      }`}
                      data-ocid={`task.item.${i + 1}`}
                    >
                      <Checkbox
                        checked={task.completed}
                        disabled={
                          task.completed || markCompleteMutation.isPending
                        }
                        onCheckedChange={() =>
                          !task.completed && handleMarkComplete(task.id, i)
                        }
                        data-ocid={`task.checkbox.${i + 1}`}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm ${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.description}
                          </p>
                        )}
                        {task.assignedTo && (
                          <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono truncate">
                            → {task.assignedTo.toString().slice(0, 20)}…
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {hasMoreTasks && (
                    <div className="flex justify-center pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isFetchingNextPage}
                        onClick={() => void fetchNextPage()}
                      >
                        {isFetchingNextPage
                          ? "Loading…"
                          : "Load more tasks"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Add task form */}
              {(isParticipant || isCreator) && isAuthenticated && (
                <>
                  <Separator />
                  <div className="bg-card rounded-2xl border border-border shadow-glow p-5">
                    <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      Add a Task
                    </h3>
                    <form onSubmit={handleAddTask} className="space-y-3">
                      <div>
                        <Label
                          htmlFor="task-title"
                          className="text-xs mb-1 block"
                        >
                          Task Title *
                        </Label>
                        <Input
                          id="task-title"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="e.g. Book the venue"
                          required
                          data-ocid="task.title_input"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="task-desc"
                          className="text-xs mb-1 block"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="task-desc"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          placeholder="Optional details…"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="task-assign"
                          className="text-xs mb-1 block"
                        >
                          Assign to a participant (optional)
                        </Label>
                        <select id="task-assign" value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} className="w-full border rounded-lg p-3 text-sm"><option value="">Unassigned</option>{session.participants.map((p, i) => <option key={p.toString()} value={p.toString()}>{p.toString() === principalStr ? "Me" : `Participant ${i + 1} · ${p.toString().slice(0, 8)}`}</option>)}</select>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          createTaskMutation.isPending || !taskTitle.trim()
                        }
                        data-ocid="task.add_button"
                      >
                        {createTaskMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Add Task
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}



