import { getAuthToken } from "@/util/util";

const apiUrl = process.env.NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL as string;

if (!apiUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL is not defined.");
}

// Frontend–facing statuses
export type TryOutStatus = "idle" | "creating" | "success" | "error";

/**
 * Fetches the current status of a Try-Out environment and
 * maps backend status values to frontend-friendly ones.
 *
 * Backend statuses:
 *  - "pending"      → "idle"
 *  - "in_progress"  → "creating"
 *  - "created"    → "success"
 *  - "failed"       → "error"
 *
 * @param uuid - the Try-Out job UUID
 * @returns a Promise resolving to the mapped TryOutStatus
 * @throws if the network request fails or the response is malformed
 */
export async function GetTryOutJobStatus(uuid: string): Promise<TryOutStatus> {
  const response = await fetch(
    `${apiUrl}/tryOut/status?uuid=${encodeURIComponent(uuid)}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to fetch status (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (typeof data.status !== "string") {
    throw new Error("Invalid response: missing `status` field");
  }

  // Map backend → frontend statuses
  switch (data.status) {
    case "pending":
      return "creating";
    case "in_progress":
      return "creating";
    case "created":
      return "success";
    case "failed":
      return "error";
    default:
      throw new Error(`Unknown backend status: ${data.status}`);
  }
}

export async function DestroyTryOutEnv(): Promise<void> {
  const token = getAuthToken();

  const res = await fetch(`${apiUrl}/tryOut/destroyEnv`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();

      // throw structured error with type attached
      throw {
        status: res.status,
        data,
      };
    }

    throw new Error('Unknown server error while deleting try out env.');
  }
}