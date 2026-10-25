/** UI-only fixture server. Never imported by the application or deployed. */
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
  "book_provider",
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
createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
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
  const body = raw ? JSON.parse(raw) : {};
  const path = new URL(req.url, "http://localhost").pathname;
  const action = path.split("/").pop();
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
    verification = { verified: true, status: "approved", method: "work_email" };
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
  if (localDemo && action === "is_admin") {
    res.end("false");
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
    if (
      new URL(req.url, "http://localhost").searchParams.get("grant_type") ===
      "password"
    ) {
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
    if (req.method === "POST" || req.method === "PATCH")
      profile = { ...profile, ...body };
    data = profile;
  } else if (path === "/rest/v1/rpc/create_group") {
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
  res.end(JSON.stringify(data));
}).listen(Number(process.env.FIXTURE_PORT || 54329), "127.0.0.1", () =>
  console.log("UI fixture server ready"),
);
