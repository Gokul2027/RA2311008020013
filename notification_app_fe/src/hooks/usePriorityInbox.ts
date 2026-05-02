import { Notification } from "../api/notifications";

export interface RankedNotification extends Notification {
  score: number;
  recencyScore: number;
  typeWeight: number;
}

const TYPE_WEIGHTS = {
  Placement: 30,
  Result: 20,
  Event: 10
} as const;

function hoursSince(timestamp: string): number {
  const date = new Date(timestamp.replace(" ", "T"));
  const difference = Date.now() - date.getTime();
  return Math.max(0, difference / 3_600_000);
}

function recencyScore(timestamp: string): number {
  return 10 / (hoursSince(timestamp) + 1);
}

export function usePriorityInbox(
  notifications: Notification[],
  topN: number,
  readIds: ReadonlySet<string>
): RankedNotification[] {
  return notifications
    .filter((notification) => !readIds.has(notification.ID))
    .map((notification) => {
      const typeWeight = TYPE_WEIGHTS[notification.Type];
      const freshness = recencyScore(notification.Timestamp);

      return {
        ...notification,
        recencyScore: freshness,
        score: typeWeight + freshness,
        typeWeight
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, topN);
}

