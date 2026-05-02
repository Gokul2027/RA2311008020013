import "dotenv/config";
import axios from "axios";

interface RegistrationPayload {
  accessCode: string;
  email: string;
  githubUsername: string;
  mobileNo: string;
  name: string;
  rollNo: string;
}

interface RegistrationResponse extends RegistrationPayload {
  clientID: string;
  clientSecret: string;
}

const REGISTER_URL = "http://20.207.122.201/evaluation-service/register";

function readRegistrationPayload(): RegistrationPayload {
  const payload = {
    accessCode: process.env.EVAL_ACCESS_CODE?.trim() ?? "",
    email: process.env.EVAL_EMAIL?.trim() ?? "",
    githubUsername: process.env.EVAL_GITHUB_USERNAME?.trim() ?? "",
    mobileNo: process.env.EVAL_MOBILE_NO?.trim() ?? "",
    name: process.env.EVAL_NAME?.trim() ?? "",
    rollNo: process.env.EVAL_ROLL_NO?.trim() ?? ""
  };

  const missing = Object.entries(payload)
    .filter(([, value]) => value.length === 0)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required registration values: ${missing.join(", ")}. Update priority_inbox/.env before running npm run register.`
    );
  }

  return payload;
}

function formatResponse(response: RegistrationResponse): string {
  return [
    "",
    "Registration complete. Save these immediately:",
    `clientID=${response.clientID}`,
    `clientSecret=${response.clientSecret}`,
    "",
    "Next steps:",
    "1. Copy those values into priority_inbox/.env as EVAL_CLIENT_ID and EVAL_CLIENT_SECRET.",
    "2. Copy the same values into notification_app_fe/.env as VITE_EVAL_CLIENT_ID and VITE_EVAL_CLIENT_SECRET.",
    "3. Re-run npm run start in priority_inbox.",
    ""
  ].join("\n");
}

async function main(): Promise<void> {
  if (process.env.EVAL_CLIENT_ID?.trim() && process.env.EVAL_CLIENT_SECRET?.trim()) {
    process.stdout.write(
      "\nClient credentials already exist in priority_inbox/.env. Skipping registration to avoid wasting the one-time registration flow.\n"
    );
    return;
  }

  const payload = readRegistrationPayload();

  const response = await axios.post<RegistrationResponse>(REGISTER_URL, payload, {
    proxy: false
  });

  process.stdout.write(formatResponse(response.data));
}

main().catch((error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload =
      typeof error.response?.data === "string"
        ? error.response.data
        : JSON.stringify(error.response?.data ?? {});

    process.stderr.write(`\nRegistration failed${status ? ` (HTTP ${status})` : ""}: ${payload}\n`);
    process.exit(1);
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`\nRegistration failed: ${message}\n`);
  process.exit(1);
});
