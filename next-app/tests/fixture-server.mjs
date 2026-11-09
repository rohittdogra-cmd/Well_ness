/** UI-only fixture server. Never imported by the application or deployed. */
import { maskContent } from "../src/lib/moderation.mjs";
import { createServer } from "node:http";
const localDemo = process.env.LOCAL_DEMO === "true";
let verification = {
  verified: !localDemo,
  status: localDemo ? "unverified" : "approved",
};
let verificationEmail = "";
let verificationSentAt = 0;
const protectedActions = new Set([
  "create_group",
  "toggle_group",
  "react_post",
  "publish_post",
  "send_direct_message",
  "request_connection",
  "respond_connection",
  "create_session",
  "join_session",
]);
const id = "11111111-1111-4111-8111-111111111111";
const user = {
  id,
  aud: "authenticated",
  role: "authenticated",
  email: "alex@example.test",
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: new Date().toISOString(),
};
const groups = [
  {
    id: 1,
    slug: "cricket",
    category: "sports",
    name: "Cricket",
    description: "Find a team. Plan your next match.",
    group_members: [{ user_id: id }],
  },
  {
    id: 2,
    slug: "music",
    category: "arts",
    name: "Music",
    description: "Share playlists and discover new sounds.",
    group_members: [],
  },
  {
    id: 3,
    slug: "health-wellness",
    category: "wellbeing",
    name: "Health & wellness",
    description: "Build better habits together.",
    group_members: [],
  },
];
let posts = [
  {
    id: 1,
    body: "Anyone up for a lunchtime walk this week?",
    created_at: new Date().toISOString(),
    alias: "Maya",
    mine: false,
    anonymous: false,
    likes: 2,
    liked: false,
    replies: [],
  },
];
const member = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Maya",
  avatar: 1,
  bio: "Lunch walks and books.",
  interests: ["Books"],
};
let connections = [];
let messages = [];
const defaultProfile = {
  name: "Smash Scorer",
  avatar: 0,
  bio: "Active member aiming to de-stress and stay healthy.",
  interests: ["Sports", "Badminton"],
  availability: ["After work"],
  goal: "Meet my people",
};
let profile = { ...defaultProfile };
function authSession() {
  const enc = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token:
      enc({ alg: "HS256", typ: "JWT" }) +
      "." +
      enc({ sub: id, exp, aud: "authenticated", role: "authenticated" }) +
      ".dGVzdA",
    refresh_token: "test",
    expires_in: 3600,
    expires_at: exp,
    token_type: "bearer",
    user,
  };
}
let seedProviders = () => [
  {
    id: 1,
    applicant: id,
    name: "Dr. Asha Sen",
    description:
      "Clinical psychologist supporting adults with workplace stress and life transitions.",
    provider_type: "psychologist",
    status: "approved",
    created_at: new Date().toISOString(),
  },
];
const baseProviders = seedProviders;
if (localDemo) {
  seedProviders = () => [
    ...baseProviders(),
    {
      id: 2,
      applicant: "demo-care-2",
      name: "Dr. Rhea Kapoor",
      description:
        "Local preview sample: a professional introduction about managing everyday stress, building resilience and finding balance.",
      provider_type: "psychologist",
      status: "approved",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      applicant: "demo-care-3",
      name: "Dr. Arjun Mehta",
      description:
        "Local preview sample: a professional introduction about navigating life changes, self-confidence and emotional wellbeing.",
      provider_type: "psychologist",
      status: "approved",
      created_at: new Date().toISOString(),
    },
  ];
}
let careProviders = seedProviders();
let careBookings = localDemo
  ? [
      {
        id: 1,
        user_id: id,
        provider_id: 1,
        booking_time: new Date(Date.now() + 3 * 86400000).toISOString(),
        confirmed: true,
        created_at: new Date().toISOString(),
      },
    ]
  : [];
let guestAppointments = [];
let notifications = [];
let adminMode = false;
let suspendedAccounts = new Map();
const adminRegisteredAt = new Date().toISOString();
const adminMembers = Array.from({ length: 24 }, (_, index) => ({
  id: `99999999-9999-4999-8999-${String(index).padStart(12, "0")}`,
  name: `Member ${String(index + 1).padStart(2, "0")}`,
  created_at: index < 3 ? adminRegisteredAt : "2025-01-01T00:00:00Z",
}));
const adminLogs = Array.from({ length: 502 }, (_, index) => ({
  id: index + 1,
  user_id: index < 500 ? id : member.id,
  created_at: adminRegisteredAt,
}));
let approvedDomains = localDemo
  ? [
      { domain: "company.example", member_type: "corporate" },
      { domain: "college.example", member_type: "student" },
    ]
  : [];
function bookingRow(b) {
  return {
    ...b,
    providers: {
      name:
        careProviders.find((p) => p.id === b.provider_id)?.name ||
        "Care provider",
    },
  };
}
const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = maskContent(raw ? JSON.parse(raw) : {});
  const path = new URL(req.url, "http://localhost").pathname;
  const action = path.split("/").pop();
  const url = new URL(req.url, "http://localhost");
  const fail = (message, status = 400) => {
    res.statusCode = status;
    res.end(JSON.stringify({ message }));
  };
  // Dashboard fixtures exercise exact counts and pagination without live data.
  if (
    req.method === "HEAD" ||
    (adminMode &&
      path === "/rest/v1/profiles" &&
      url.searchParams.get("select") === "id,name,created_at") ||
    (adminMode &&
      path === "/rest/v1/activity_logs" &&
      url.searchParams.get("select") === "user_id")
  ) {
    if (!adminMode) {
      fail("Administrator access required", 403);
      return;
    }
    const table = path.split("/").pop();
    let rows =
      {
        profiles: adminMembers,
        activity_logs: adminLogs,
        groups,
        sessions: [
          { id: 1, date_time: new Date(Date.now() + 86400000).toISOString() },
        ],
        verification_requests: [{ id: 1, status: "pending" }],
        providers: careProviders,
        provider_bookings: careBookings,
        reports: [],
        contact_requests: [],
      }[table] ?? [];
    for (const [key, filter] of url.searchParams) {
      if (filter.startsWith("gte."))
        rows = rows.filter((row) => row[key] >= filter.slice(4));
      if (filter.startsWith("lte."))
        rows = rows.filter((row) => row[key] <= filter.slice(4));
      if (filter.startsWith("eq."))
        rows = rows.filter((row) => String(row[key]) === filter.slice(3));
      if (filter.startsWith("ilike."))
        rows = rows.filter((row) =>
          String(row[key])
            .toLowerCase()
            .includes(filter.slice(7, -1).toLowerCase()),
        );
    }
    const total = rows.length;
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 500);
    rows = rows.slice(offset, offset + limit);
    res.setHeader(
      "Content-Range",
      `${offset}-${offset + rows.length - 1}/${total}`,
    );
    res.end(req.method === "HEAD" ? undefined : JSON.stringify(rows));
    return;
  }
  if (path === "/test/verification") {
    verification = body;
    res.end("null");
    return;
  }
  if (action === "account_access") {
    res.end(
      JSON.stringify({
        active: !suspendedAccounts.has(id),
        profile_complete:
          !!profile?.name &&
          !!profile?.interests?.length &&
          !!profile?.availability?.length &&
          !!profile?.goal,
      }),
    );
    return;
  }
  if (action === "admin_set_suspension") {
    if (!adminMode) {
      fail("Administrator access required", 403);
      return;
    }
    if (body.p_user === id) {
      fail("Administrator accounts cannot be suspended here");
      return;
    }
    if (body.p_suspend)
      suspendedAccounts.set(body.p_user, {
        reason: body.p_reason,
        suspended_at: new Date().toISOString(),
      });
    else suspendedAccounts.delete(body.p_user);
    res.end("null");
    return;
  }
  if (action === "delete_own_account") {
    if (adminMode) {
      fail("Administrator accounts require an access transfer");
      return;
    }
    if (body.p_confirmation !== "DELETE MY ACCOUNT") {
      fail("Type DELETE MY ACCOUNT to confirm");
      return;
    }
    profile = null;
    res.end("null");
    return;
  }
  if (path === "/rest/v1/account_suspensions") {
    res.end(
      JSON.stringify(
        suspendedAccounts.get(url.searchParams.get("user_id")?.slice(3)) ??
          null,
      ),
    );
    return;
  }
  if (path === "/rest/v1/group_members") {
    res.end(
      JSON.stringify([
        { group_id: 1, groups: { name: "Cricket", slug: "cricket" } },
      ]),
    );
    return;
  }
  if (path === "/rest/v1/session_members") {
    res.end("[]");
    return;
  }
  if (path === "/test/admin") {
    adminMode = !!body.enabled;
    res.end("null");
    return;
  }
  if (path === "/rest/v1/providers") {
    let rows = careProviders;
    for (const field of ["applicant", "status", "provider_type"]) {
      const filter = url.searchParams.get(field);
      if (filter?.startsWith("eq."))
        rows = rows.filter((p) => p[field] === filter.slice(3));
    }
    res.end(JSON.stringify(rows));
    return;
  }
  if (path === "/rest/v1/provider_bookings") {
    res.end(JSON.stringify(careBookings.map(bookingRow)));
    return;
  }
  if (path === "/rest/v1/notifications") {
    if (req.method === "PATCH") {
      const target = Number(url.searchParams.get("id")?.slice(3));
      notifications = notifications.map((n) =>
        n.id === target ? { ...n, read: true } : n,
      );
      res.end("null");
      return;
    }
    res.end(JSON.stringify(notifications));
    return;
  }
  if (path === "/rest/v1/organisation_domains") {
    res.end(JSON.stringify(approvedDomains));
    return;
  }
  if (action === "set_organisation_domain") {
    if (!adminMode) {
      fail("Administrator access required", 403);
      return;
    }
    approvedDomains = approvedDomains.filter((d) => d.domain !== body.p_domain);
    if (!body.p_remove)
      approvedDomains.push({ domain: body.p_domain, member_type: body.p_type });
    res.end("null");
    return;
  }
  if (action === "request_guest_appointment") {
    if (
      !careProviders.some(
        (p) => p.id === body.p_provider && p.status === "approved",
      )
    ) {
      fail("Provider unavailable");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.p_email)) {
      fail("Enter a valid contact email");
      return;
    }
    if (new Date(body.p_time).getTime() <= Date.now()) {
      fail("Choose a future time");
      return;
    }
    const receipt = crypto.randomUUID() + crypto.randomUUID();
    const row = {
      id: crypto.randomUUID(),
      provider_id: body.p_provider,
      email: body.p_email,
      receipt,
      booking_time: body.p_time,
      status: "pending",
    };
    guestAppointments.push(row);
    notifications.unshift({
      id: Date.now(),
      message: "New private appointment request.",
      href: "/provider",
      read: false,
    });
    res.end(JSON.stringify({ id: row.id, receipt }));
    return;
  }
  if (
    action === "guest_appointment_status" ||
    action === "cancel_guest_appointment"
  ) {
    const row = guestAppointments.find((a) => a.receipt === body.p_receipt);
    if (!row) {
      fail("Appointment link not found");
      return;
    }
    if (action === "cancel_guest_appointment") {
      row.status = "cancelled";
      res.end("null");
      return;
    }
    res.end(
      JSON.stringify({
        id: row.id,
        provider: careProviders.find((p) => p.id === row.provider_id)?.name,
        booking_time: row.booking_time,
        status: row.status,
      }),
    );
    return;
  }
  if (action === "provider_appointments") {
    res.end(
      JSON.stringify([
        ...careBookings.map((b) => ({
          ...b,
          id: String(b.id),
          kind: "member",
          provider: careProviders.find((p) => p.id === b.provider_id)?.name,
          client: b.contact_name || "Private member",
          email: null,
          status: b.confirmed ? "confirmed" : "pending",
        })),
        ...guestAppointments.map((b) => ({
          id: b.id,
          kind: "guest",
          provider_id: b.provider_id,
          provider: careProviders.find((p) => p.id === b.provider_id)?.name,
          client: "Guest client",
          email: b.email,
          booking_time: b.booking_time,
          status: b.status,
        })),
      ]),
    );
    return;
  }
  if (action === "confirm_guest_appointment") {
    const row = guestAppointments.find((b) => b.id === body.p_booking);
    if (!row) {
      fail("Request not found");
      return;
    }
    row.status = "confirmed";
    res.end("null");
    return;
  }
  if (action === "apply_provider") {
    const provider = {
      id: careProviders.length + 1,
      applicant: id,
      name: body.p_name,
      description: body.p_description,
      provider_type: body.p_type,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    careProviders.push(provider);
    notifications.unshift({
      id: Date.now(),
      message: "Your provider application is awaiting review.",
      href: "/provider",
      read: false,
    });
    res.end(JSON.stringify(provider.id));
    return;
  }
  if (action === "review_provider") {
    if (!adminMode) {
      fail("Administrator access required", 403);
      return;
    }
    const provider = careProviders.find(
      (p) => p.id === Number(body.p_provider),
    );
    if (!provider) {
      fail("Provider unavailable");
      return;
    }
    provider.status = body.p_approve ? "approved" : "rejected";
    notifications.unshift({
      id: Date.now(),
      message: "Your provider application is " + provider.status + ".",
      href: "/provider",
      read: false,
    });
    res.end("null");
    return;
  }
  if (action === "confirm_booking") {
    const row = careBookings.find((b) => b.id === Number(body.p_booking));
    if (!row) {
      fail("Request not found");
      return;
    }
    row.confirmed = true;
    notifications.unshift({
      id: Date.now(),
      message: "Your appointment is confirmed.",
      href: "/my-sessions#appointments",
      read: false,
    });
    res.end("null");
    return;
  }
  if (action === "cancel_booking") {
    careBookings = careBookings.filter((b) => b.id !== Number(body.p_booking));
    notifications.unshift({
      id: Date.now(),
      message: "Your appointment was cancelled.",
      href: "/my-sessions#appointments",
      read: false,
    });
    res.end("null");
    return;
  }

  if (
    localDemo &&
    protectedActions.has(action) &&
    !(
      ["join_session", "toggle_group"].includes(action) && body.p_join === false
    ) &&
    !verification.verified
  ) {
    res.statusCode = 403;
    res.end(
      JSON.stringify({
        message: "Verify your profile to chat, message or book",
      }),
    );
    return;
  }
  if (action === "book_provider" || action === "book_care") {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      fail("Please sign in", 401);
      return;
    }
    if (action === "book_care" && String(body.p_name || "").trim().length < 2) {
      fail("Enter your name");
      return;
    }
    const row = {
      id: careBookings.length + 1,
      user_id: id,
      contact_name: body.p_name,
      contact_email: user.email,
      provider_id: Number(body.p_provider),
      booking_time: body.p_time,
      confirmed: false,
      created_at: new Date().toISOString(),
    };
    careBookings.push(row);
    notifications.unshift({
      id: Date.now(),
      message: "Your appointment request is awaiting confirmation.",
      href: "/my-sessions#appointments",
      read: false,
    });
    res.end(JSON.stringify(row.id));
    return;
  }
  if (action === "get_public_feed") {
    res.end(
      JSON.stringify(
        body.p_before
          ? []
          : [
              {
                id: 9001,
                body: "Some days, a ten-minute walk is the reset I need. What helps you switch off after work?",
                created_at: new Date().toISOString(),
                alias: "Quiet Willow",
                anonymous: true,
                mine: false,
                likes: 4,
                liked: false,
                replies: [
                  {
                    id: 9002,
                    body: "Putting my phone away and making a cup of tea.",
                    created_at: new Date().toISOString(),
                    alias: "Quiet Cedar",
                    mine: false,
                  },
                ],
              },
            ],
      ),
    );
    return;
  }
  if (action === "find_public_members") {
    res.end(
      JSON.stringify(
        body.p_offset ||
          (body.p_search &&
            !member.name.toLowerCase().includes(body.p_search.toLowerCase()))
          ? []
          : [{ ...member, id: "public-maya" }],
      ),
    );
    return;
  }
  if (action === "list_public_activities") {
    res.end(
      JSON.stringify([
        {
          id: 1,
          title: "A little lunchtime reset",
          description: "Walk, talk, and get some fresh air.",
          program_type: "meetup",
          date_time: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          max_participants: 8,
          space_name: "Garden",
          location: "Courtyard",
          participant_count: 1,
        },
      ]),
    );
    return;
  }
  if (action === "list_public_groups") {
    res.end(
      JSON.stringify(
        groups.map((g) => ({
          id: g.id,
          slug: g.slug,
          name: g.name,
          description: g.description,
          category: g.category,
          member_count: g.group_members.length,
        })),
      ),
    );
    return;
  }
  if (action === "verification_status") {
    res.end(JSON.stringify(verification));
    return;
  }
  if (localDemo && action === "send_work_email") {
    const email = String(body.p_email || "")
      .trim()
      .toLowerCase();
    if (
      !/^[^@]+@[^@]+\.[^@]+$/.test(email) ||
      /@(gmail|googlemail|yahoo|outlook|hotmail|live|icloud|aol|proton|protonmail|mail|yandex)\./.test(
        email,
      )
    ) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({ message: "Use an organisation email address." }),
      );
      return;
    }
    verificationEmail = email;
    verificationSentAt = Date.now();
    res.end("null");
    return;
  }
  if (localDemo && action === "verify_work_email") {
    if (
      body.p_code !== "123456" ||
      String(body.p_email).trim().toLowerCase() !== verificationEmail ||
      !verificationSentAt ||
      Date.now() - verificationSentAt > 600000
    ) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message:
            "Invalid or expired demo code. Use 123456 after requesting a code.",
        }),
      );
      return;
    }
    const approved = approvedDomains.some(
      (d) => d.domain === verificationEmail.split("@")[1],
    );
    verification = {
      verified: approved,
      status: approved ? "approved" : "unverified",
      method: approved ? "organisation_email" : undefined,
    };
    verificationSentAt = 0;
    res.end("null");
    return;
  }
  if (localDemo && action === "submit_verification") {
    if (
      !["linkedin", "employee_id", "student_id", "professional_id"].includes(
        body.p_method,
      ) ||
      !body.p_evidence ||
      verification.status === "pending" ||
      verification.verified
    ) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Choose a method and submit valid proof once.",
        }),
      );
      return;
    }
    // Preview stores the request state only, never the ID photo.
    verification = {
      verified: false,
      status: "pending",
      method: body.p_method,
    };
    res.end("null");
    return;
  }
  if (action === "is_admin") {
    res.end(JSON.stringify(adminMode));
    return;
  }
  let data = [];
  if (path === "/auth/v1/settings")
    data = { external: { linkedin_oidc: false } };
  else if (path === "/auth/v1/signup") data = { user, session: null };
  else if (path === "/auth/v1/logout") data = {};
  else if (path === "/auth/v1/user") data = user;
  else if (path === "/auth/v1/otp") data = {};
  else if (path === "/auth/v1/verify") {
    if (body.token !== "123456" && body.token_hash !== "valid-test-hash") {
      res.statusCode = 403;
      data = { code: "otp_expired", msg: "Token has expired or is invalid" };
    } else {
      if (body.email) user.email = body.email;
      data = authSession();
    }
  } else if (path === "/auth/v1/token") {
    const grantType = new URL(req.url, "http://localhost").searchParams.get(
      "grant_type",
    );
    if (grantType === "refresh_token") {
      // Local sessions expire just like real sessions; let the SDK renew them.
      if (body.refresh_token === "test") {
        data = authSession();
      } else {
        res.statusCode = 400;
        data = {
          code: "refresh_token_not_found",
          msg: "Invalid refresh token",
        };
      }
    } else if (grantType === "password") {
      if (body.password === "Correct-password1") {
        if (body.email) user.email = body.email;
        data = authSession();
      } else {
        res.statusCode = 400;
        data = {
          code: "invalid_credentials",
          msg: "Invalid login credentials. Password must be at least 6 characters.",
        };
      }
    } else {
      res.statusCode = 400;
      data = { code: "bad_code_verifier", msg: "Invalid verifier" };
    }
  } else if (path === "/rest/v1/rpc/find_members")
    data = body.p_offset ? [] : [member];
  else if (path === "/rest/v1/rpc/list_connections") data = connections;
  else if (path === "/rest/v1/rpc/request_connection") {
    connections = [
      {
        id: 1,
        requester: id,
        recipient: member.id,
        status: "pending",
        member_id: member.id,
        name: member.name,
        avatar: member.avatar,
      },
    ];
    data = 1;
  } else if (path === "/test/accept-connection") {
    connections[0].status = "accepted";
    data = null;
  } else if (path === "/test/reset") {
    verification = {
      verified: !localDemo,
      status: localDemo ? "unverified" : "approved",
    };
    verificationEmail = "";
    verificationSentAt = 0;
    connections = [];
    messages = [];
    profile = { ...defaultProfile };
    careProviders = seedProviders();
    careBookings = [];
    guestAppointments = [];
    notifications = [];
    adminMode = false;
    suspendedAccounts.clear();
    approvedDomains = [];
    data = null;
  } else if (path === "/test/missing-profile") {
    profile = null;
    data = null;
  } else if (path === "/rest/v1/direct_messages")
    data = [...messages].reverse();
  else if (path === "/rest/v1/rpc/send_direct_message") {
    const m = {
      id: messages.length + 1,
      sender: id,
      body: body.p_body,
      created_at: new Date().toISOString(),
    };
    messages.push(m);
    data = m.id;
  } else if (path === "/rest/v1/profiles") {
    if (
      url.searchParams.get("select")?.includes("availability") &&
      url.searchParams.get("select")?.includes("created_at") &&
      url.searchParams.get("id")
    ) {
      res.end(
        JSON.stringify({
          ...defaultProfile,
          id: url.searchParams.get("id").slice(3),
          name: "Member 01",
          created_at: adminRegisteredAt,
        }),
      );
      return;
    }
    if (req.method === "POST" || req.method === "PATCH")
      profile = { ...profile, ...body };
    data =
      ["id,name", "id"].includes(url.searchParams.get("select")) &&
      !url.searchParams.get("id")
        ? profile
          ? [{ ...profile, id }]
          : []
        : profile;
  } else if (
    path === "/rest/v1/rpc/create_group" ||
    path === "/rest/v1/rpc/admin_create_group"
  ) {
    if (action === "admin_create_group" && !adminMode) {
      fail("Administrator access required", 403);
      return;
    }
    const group = {
      id: groups.length + 1,
      slug: "new-subgroup",
      name: body.p_name,
      description: body.p_description,
      category: body.p_category,
      group_members: [{ user_id: id }],
    };
    groups.push(group);
    data = group.id;
  } else if (path === "/rest/v1/groups") data = groups;
  else if (path === "/rest/v1/rpc/get_feed") data = posts;
  else if (path === "/rest/v1/rpc/publish_post") {
    const p = {
      id: Date.now(),
      body: body.p_body,
      created_at: new Date().toISOString(),
      alias: body.p_anonymous ? "Quiet a1b2c3" : "Smash Scorer",
      mine: true,
      anonymous: body.p_anonymous,
      likes: 0,
      liked: false,
      replies: [],
    };
    posts = [p, ...posts];
    data = p.id;
  } else if (path === "/rest/v1/rpc/toggle_group") {
    const g = groups.find((g) => g.id === body.p_group);
    g.group_members = body.p_join ? [{ user_id: id }] : [];
    data = null;
  } else if (path === "/rest/v1/rpc/is_admin") data = false;
  else if (path === "/rest/v1/check_ins") data = null;
  else if (path === "/rest/v1/rpc/get_reports") data = [];
  else if (path === "/rest/v1/sessions")
    data = [
      {
        id: 1,
        creator: id,
        title: "A little lunchtime reset",
        description: "Walk, talk, and get some fresh air.",
        program_type: "meetup",
        date_time: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        max_participants: 8,
        space_name: "Garden",
        location: "Courtyard",
        session_members: [{ user_id: id }],
      },
    ];
  if (
    path.startsWith("/rest/v1/rpc/") &&
    Array.isArray(data) &&
    data.length === 0 &&
    !["get_feed", "find_members", "list_connections", "get_reports"].includes(
      action,
    )
  ) {
    fail("Local preview does not implement this action", 404);
    return;
  }
  res.end(JSON.stringify(maskContent(data)));
}).listen(Number(process.env.FIXTURE_PORT || 54329), "127.0.0.1", () =>
  console.log(`UI fixture server ready on ${server.address().port}`),
);
