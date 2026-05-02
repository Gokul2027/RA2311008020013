import axios from "axios";
import { getToken } from "../config/auth";
import { Log } from "../config/logger";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface NotificationQuery {
  limit?: number;
  page?: number;
  notificationType?: NotificationType;
}

const NOTIFICATION_URL = "/evaluation-service/notifications";

export async function fetchNotifications(query: NotificationQuery = {}): Promise<Notification[]> {
  await Log(
    "frontend",
    "info",
    "api",
    `Fetching notifications with query ${JSON.stringify(query)}`
  );

  try {
    // The live evaluation API currently returns HTTP 400 for most limit values and
    // behaves inconsistently for server-side paging/filtering, so we fetch the feed once
    // and apply filtering/pagination client-side for a stable reviewer experience.
    const response = await axios.get(NOTIFICATION_URL, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      proxy: false
    });

    const notifications = (response.data.notifications ?? []) as Notification[];

    await Log(
      "frontend",
      "debug",
      "api",
      `Fetched ${notifications.length} notifications from the API`
    );

    return notifications;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown notification error";
    await Log("frontend", "error", "api", `Notification fetch failed: ${message}`);
    throw new Error(message);
  }
}
