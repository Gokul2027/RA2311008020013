import "dotenv/config";
import axios from "axios";
import { Log, setAuthToken } from "logging-middleware";

type NotificationType = "Placement" | "Result" | "Event";

interface LegacyCredentials {
  email: string;
  rollNo: string;
  accessCode: string;
  name: string;
}

interface ClientCredentials {
  clientID: string;
  clientSecret: string;
}

type AuthPayload = LegacyCredentials & Partial<ClientCredentials>;

interface RawNotification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

interface RankedNotification extends RawNotification {
  ageInHours: number;
  recencyScore: number;
  score: number;
}

const AUTH_URL = "http://20.207.122.201/evaluation-service/auth";
const NOTIFICATIONS_URL = "http://20.207.122.201/evaluation-service/notifications";

const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 30,
  Result: 20,
  Event: 10
};

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload =
      typeof error.response?.data === "string"
        ? error.response.data
        : JSON.stringify(error.response?.data ?? {});

    return status ? `HTTP ${status}: ${payload}` : error.message;
  }

  return error instanceof Error ? error.message : "Unknown error";
}

function readCredentials(): AuthPayload {
  const clientCredentials = {
    clientID: process.env.EVAL_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.EVAL_CLIENT_SECRET?.trim() ?? ""
  };

  const creds = {
    email: process.env.EVAL_EMAIL?.trim() ?? "",
    rollNo: process.env.EVAL_ROLL_NO?.trim() ?? "",
    accessCode: process.env.EVAL_ACCESS_CODE?.trim() ?? "",
    name: process.env.EVAL_NAME?.trim() ?? ""
  };

  const missing = Object.entries(creds)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment values: ${missing.join(", ")}. Create priority_inbox/.env first.`
    );
  }

  if (clientCredentials.clientID && clientCredentials.clientSecret) {
    return {
      ...creds,
      ...clientCredentials
    };
  }

  return creds;
}

function readTopN(): number {
  const parsed = Number(process.env.TOP_N ?? "10");
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 10;
  }

  return parsed;
}

function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp.replace(" ", "T"));
}

function getHoursSince(timestamp: string): number {
  const notificationDate = parseTimestamp(timestamp);
  const diffInMs = Date.now() - notificationDate.getTime();
  const hoursSince = diffInMs / (1000 * 60 * 60);

  return Number.isFinite(hoursSince) && hoursSince >= 0 ? hoursSince : 0;
}

function calculateRecencyScore(timestamp: string): number {
  return 10 / (getHoursSince(timestamp) + 1);
}

function rankNotification(notification: RawNotification): RankedNotification {
  const ageInHours = getHoursSince(notification.Timestamp);
  const recencyScore = calculateRecencyScore(notification.Timestamp);
  const score = TYPE_WEIGHTS[notification.Type] + recencyScore;

  return {
    ...notification,
    ageInHours,
    recencyScore,
    score
  };
}

async function authenticate(credentials: AuthPayload): Promise<string> {
  await Log("frontend", "info", "auth", "Attempting evaluation server authentication");
  try {
    const response = await axios.post(AUTH_URL, credentials, {
      proxy: false
    });
    const token = response.data.access_token as string;

    setAuthToken(token);
    await Log("frontend", "info", "auth", "Authentication complete and logger armed");

    return token;
  } catch (error: unknown) {
    const message = describeError(error);
    await Log("frontend", "error", "auth", `Authentication rejected: ${message}`);
    if (message.includes("clientID") && message.includes("clientSecret")) {
      throw new Error(
        `${message}. Add EVAL_CLIENT_ID and EVAL_CLIENT_SECRET to priority_inbox/.env if your registration flow provided them.`
      );
    }

    throw new Error(message);
  }
}

async function fetchNotifications(token: string): Promise<RawNotification[]> {
  await Log("frontend", "info", "api", "Fetching notification feed for priority ranking");

  const response = await axios.get(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    proxy: false
  });

  const notifications = (response.data.notifications ?? []) as RawNotification[];

  await Log(
    "frontend",
    "info",
    "api",
    `Received ${notifications.length} notifications from the evaluation API`
  );

  return notifications;
}

function buildPriorityInbox(notifications: RawNotification[], topN: number): RankedNotification[] {
  return notifications
    .map(rankNotification)
    .sort((left, right) => right.score - left.score)
    .slice(0, topN);
}

function formatOutput(rows: RankedNotification[], topN: number): string {
  const header = `Priority Inbox | Top ${topN}`;
  const divider = "-".repeat(header.length);

  const body = rows.map((notification, index) => {
    const rank = String(index + 1).padStart(2, " ");
    const score = notification.score.toFixed(2).padStart(5, " ");
    const age = `${notification.ageInHours.toFixed(1)}h`.padStart(6, " ");

    return `${rank}. ${notification.Type.padEnd(9, " ")} | score ${score} | age ${age} | ${notification.Message} (${notification.Timestamp})`;
  });

  return ["", header, divider, ...body, ""].join("\n");
}

async function main(): Promise<void> {
  const credentials = readCredentials();
  const topN = readTopN();

  const token = await authenticate(credentials);
  const notifications = await fetchNotifications(token);

  await Log("frontend", "debug", "utils", "Ranking notifications by weight and recency");
  const rankedNotifications = buildPriorityInbox(notifications, topN);

  process.stdout.write(formatOutput(rankedNotifications, topN));
  await Log("frontend", "info", "page", `Priority inbox prepared with ${rankedNotifications.length} items`);
}

main().catch(async (error: unknown) => {
  const message = describeError(error);
  await Log("frontend", "fatal", "utils", `Priority inbox execution failed: ${message}`);
  process.stderr.write(`\nError: ${message}\n`);
  process.exit(1);
});
