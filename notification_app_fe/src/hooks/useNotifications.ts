import { useEffect, useState } from "react";
import { fetchNotifications, Notification, NotificationQuery } from "../api/notifications";

interface UseNotificationsResult {
  data: Notification[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useNotifications(query: NotificationQuery): UseNotificationsResult {
  const [data, setData] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setError(null);

    fetchNotifications(query)
      .then((notifications) => {
        if (!isActive) {
          return;
        }

        const sorted = [...notifications].sort((left, right) => {
          const leftTime = new Date(left.Timestamp.replace(" ", "T")).getTime();
          const rightTime = new Date(right.Timestamp.replace(" ", "T")).getTime();
          return rightTime - leftTime;
        });

        setData(sorted);
      })
      .catch((fetchError: unknown) => {
        if (!isActive) {
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : "Unable to fetch notifications";
        setError(message);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query.limit, query.notificationType, query.page, reloadKey]);

  return {
    data,
    error,
    loading,
    refetch: () => setReloadKey((current) => current + 1)
  };
}

