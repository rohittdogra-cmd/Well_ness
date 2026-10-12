import type { Principal } from "@dfinity/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    id: bigint;
    title: string;
    creator: Principal;
    participants: Array<Principal>;
    /**
     * Participant totals resolved by the database. List reads receive these
     * without shipping every member id to the browser; `participants` is only
     * populated for single-session reads where the roster is actually shown.
     */
    participantCount?: bigint;
    joined?: boolean;
    createdAt: Time;
    description: string;
    spaceName?: string;
    maxParticipants: bigint;
    programType: ProgramType;
    dateTime: bigint;
    location?: string;
}
export type Time = bigint;
export interface AdminStats {
    totalTasks: bigint;
    completedTasks: bigint;
    sessionsByType: Array<[string, bigint]>;
    totalBookings: bigint;
    rejectedProviders: bigint;
    approvedProviders: bigint;
    totalProviders: bigint;
    totalUsers: bigint;
    totalSessions: bigint;
    pendingProviders: bigint;
    /** Appointments an administrator or the provider has confirmed. */
    confirmedBookings: bigint;
    totalGroups: bigint;
    totalPosts: bigint;
    /** Appointments per provider, keyed by provider id as a string. */
    bookingsByProvider: Array<[string, bigint]>;
}
export interface ActivityLog {
    id: bigint;
    activityTime: Time;
    activityType: ActivityLogType;
    createdAt: Time;
    user: Principal;
    relatedId: bigint;
}
export interface UserProfileEntry {
    sessionsCreated: bigint;
    principal: Principal;
    name: string;
    sessionsJoined: bigint;
}
export interface Task {
    id: bigint;
    title: string;
    assignedTo?: Principal;
    createdAt: Time;
    completed: boolean;
    description: string;
    sessionId: bigint;
}
export interface ProviderBooking {
    id: bigint;
    createdAt: Time;
    user: Principal;
    bookingTime: Time;
    isConfirmed: boolean;
    providerId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface ProviderApplication {
    id: bigint;
    isApproved: boolean;
    isRejected: boolean;
    name: string;
    submittedAt: Time;
    description: string;
    providerType: ProviderType;
}
export enum ActivityLogType {
    providerBooked = "providerBooked",
    sessionCreated = "sessionCreated",
    sessionLeft = "sessionLeft",
    sessionJoined = "sessionJoined",
    taskCompleted = "taskCompleted",
    taskCreated = "taskCreated"
}
export enum ProgramType {
    boxCricket = "boxCricket",
    socialGathering = "socialGathering",
    exercise = "exercise",
    pickleball = "pickleball",
    taskAllocation = "taskAllocation",
    tennis = "tennis",
    badminton = "badminton",
    meetup = "meetup"
}
export enum ProviderType {
    sportsCompany = "sportsCompany",
    psychologist = "psychologist"
}
export interface SessionListOptions {
    /** Restrict to one wellness program. */
    type?: ProgramType | null;
    /** Only sessions that have not started yet. */
    upcoming?: boolean;
    /** Upper bound on returned rows. */
    limit?: number;
    /** Resume after this `(date_time, id)` pair; omit for the first page. */
    before?: { dateTime: bigint; id: bigint };
}
export interface backendInterface {
    listSessions(options?: SessionListOptions): Promise<Array<Session>>;
    approveProvider(providerId: bigint): Promise<void>;
    bookProvider(providerId: bigint, bookingTime: Time): Promise<bigint>;
    cancelBooking(bookingId: bigint): Promise<void>;
    createSession(title: string, description: string, programType: ProgramType, dateTime: bigint, maxParticipants: bigint, spaceName: string | null, location: string | null): Promise<bigint>;
    createTask(sessionId: bigint, title: string, description: string, assignedTo: Principal | null): Promise<bigint>;
    deleteSession(sessionId: bigint): Promise<void>;
    getActivityLogsForUser(user: Principal): Promise<Array<ActivityLog>>;
    getAdminStats(): Promise<AdminStats>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllBookings(): Promise<Array<ProviderBooking>>;
    getAllProviders(): Promise<Array<ProviderApplication>>;
    getAllSessions(): Promise<Array<Session>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUserProfiles(): Promise<Array<UserProfileEntry>>;
    getApprovedProviders(): Promise<Array<ProviderApplication>>;
    getBooking(bookingId: bigint): Promise<ProviderBooking>;
    getBookingsForProvider(providerId: bigint): Promise<Array<ProviderBooking>>;
    getBookingsForUser(user: Principal): Promise<Array<ProviderBooking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getMySessions(): Promise<[Array<Session>, Array<Session>]>;
    getPendingProviders(): Promise<Array<ProviderApplication>>;
    getProvider(providerId: bigint): Promise<ProviderApplication>;
    getSession(sessionId: bigint): Promise<Session>;
    getSessionsByProgramType(programType: ProgramType): Promise<Array<Session>>;
    getTask(taskId: bigint): Promise<Task>;
    getTasksBySession(sessionId: bigint): Promise<Array<Task>>;
    getTasksForUser(user: Principal): Promise<Array<Task>>;
    /**
     * The next page of the administrator activity feed, older than `before`.
     * Keyset paging on the primary key, so rows written during the read cannot
     * duplicate or skip.
     */
    getMoreActivityLogs(before: bigint): Promise<Array<ActivityLog>>;
    /** The next page of every booking, older than the `before` id. */
    getMoreBookings(before: bigint): Promise<Array<ProviderBooking>>;
    /** The next page of provider applications, older than the `before` id. */
    getMoreProviders(before: bigint): Promise<Array<ProviderApplication>>;
    /** The next page of a session's tasks, older than the `before` id. */
    getMoreTasks(sessionId: bigint, before: bigint): Promise<Array<Task>>;
    isCallerAdmin(): Promise<boolean>;
    joinSession(sessionId: bigint): Promise<void>;
    leaveSession(sessionId: bigint): Promise<void>;
    markTaskComplete(taskId: bigint): Promise<void>;
    rejectProvider(providerId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitProviderApplication(providerType: ProviderType, name: string, description: string): Promise<bigint>;
    updateSession(sessionId: bigint, title: string | null, description: string | null, dateTime: bigint | null, maxParticipants: bigint | null, spaceName: string | null, location: string | null): Promise<void>;
}
