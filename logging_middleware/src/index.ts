import axios from "axios";

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
export type SharedPackage = "auth" | "config" | "middleware" | "utils";
export type PackageName = BackendPackage | FrontendPackage | SharedPackage;

const REMOTE_LOG_URL = "http://20.207.122.201/evaluation-service/logs";

function resolveLogUrl(): string {
  if (typeof window !== "undefined") {
    return "/evaluation-service/logs";
  }

  return REMOTE_LOG_URL;
}

let authToken: string | null = null;

export function setAuthToken(token: string): void {
  authToken = token.trim();
}

export function clearAuthToken(): void {
  authToken = null;
}

function buildHeaders(): Record<string, string> | null {
  if (!authToken) {
    return null;
  }

  return {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json"
  };
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: PackageName,
  message: string
): Promise<void> {
  const headers = buildHeaders();

  if (!headers) {
    return;
  }

  try {
    await axios.post(
      resolveLogUrl(),
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers,
        proxy: false
      }
    );
  } catch {
    // Logging should never interrupt the user flow.
  }
}

export default Log;
