import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Log } from "../config/logger";

interface NotificationContextValue {
  readIds: Set<string>;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
}

const STORAGE_KEY = "read_notification_ids";

const NotificationContext = createContext<NotificationContextValue | null>(null);

function readStoredIds(): string[] {
  const saved = sessionStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [readIdList, setReadIdList] = useState<string[]>(readStoredIds);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(readIdList));
  }, [readIdList]);

  function markRead(id: string): void {
    setReadIdList((current) => {
      if (current.includes(id)) {
        return current;
      }

      void Log("frontend", "info", "state", `Marked notification ${id} as read`);
      return [...current, id];
    });
  }

  function isRead(id: string): boolean {
    return readIdList.includes(id);
  }

  return (
    <NotificationContext.Provider
      value={{
        readIds: new Set(readIdList),
        isRead,
        markRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationContext must be used inside NotificationProvider");
  }

  return context;
}
