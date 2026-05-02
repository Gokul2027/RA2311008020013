import axios from "axios";
import { Log, setAuthToken } from "./logger";

const AUTH_URL = "/evaluation-service/auth";
const TOKEN_KEY = "eval_token";

const clientCredentials = {
  clientID: import.meta.env.VITE_EVAL_CLIENT_ID?.trim() ?? "",
  clientSecret: import.meta.env.VITE_EVAL_CLIENT_SECRET?.trim() ?? ""
};

const legacyCredentials = {
  email: import.meta.env.VITE_EVAL_EMAIL?.trim() ?? "",
  rollNo: import.meta.env.VITE_EVAL_ROLL_NO?.trim() ?? "",
  accessCode: import.meta.env.VITE_EVAL_ACCESS_CODE?.trim() ?? "",
  name: import.meta.env.VITE_EVAL_NAME?.trim() ?? ""
};

let isReady = false;

function missingCredentialNames(): string[] {
  return Object.entries(legacyCredentials)
    .filter(([, value]) => value.length === 0)
    .map(([name]) => name);
}

function getAuthPayload(): Record<string, string> {
  if (clientCredentials.clientID && clientCredentials.clientSecret) {
    return {
      ...legacyCredentials,
      ...clientCredentials
    };
  }

  return legacyCredentials;
}

export function getToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export async function initAuth(): Promise<void> {
  if (isReady) {
    return;
  }

  const cachedToken = getToken();
  if (cachedToken) {
    setAuthToken(cachedToken);
    isReady = true;
    return;
  }

  const usingClientCredentials = clientCredentials.clientID && clientCredentials.clientSecret;
  const missing = missingCredentialNames();

  if (!usingClientCredentials && missing.length > 0) {
    throw new Error(`Missing Vite environment values: ${missing.join(", ")}`);
  }

  try {
    const response = await axios.post(AUTH_URL, getAuthPayload(), {
      proxy: false
    });
    const token = response.data.access_token as string;
    sessionStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    isReady = true;
    await Log("frontend", "info", "auth", "Frontend authentication succeeded");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown authentication error";
    await Log("frontend", "error", "auth", `Authentication failed: ${message}`);
    if (message.includes("clientID") && message.includes("clientSecret")) {
      throw new Error(
        `${message}. Add VITE_EVAL_CLIENT_ID and VITE_EVAL_CLIENT_SECRET to notification_app_fe/.env if your registration flow provided them.`
      );
    }

    throw new Error(message);
  }
}
