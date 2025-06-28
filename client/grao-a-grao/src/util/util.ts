import { StoreModel } from "@/types/store";

export function isUserLoggedIn(): boolean {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return false;
  }

  const value = localStorage.getItem("IsUserLoggedIn");
  // If value is "true", return true, otherwise false
  return value === "true";
}

export function setIsUserLoggedIn(value: boolean) {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return false;
  }

  localStorage.setItem("IsUserLoggedIn", value.toString());
}
export function getAPIUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL as string;

  if (!apiUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL is not defined.");
  }

  return apiUrl;
}

export function getAuthToken() {
  return localStorage.getItem("authToken")
}

export function getUserAvatarUrl() {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("userPictureUrl")
}

export function getUserEmail() {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("userEmail")
}

export function getUserName() {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("userName")
}

export function formatDateTime(
  dateStr: string | undefined,
  locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string {
  try {
    const date = new Date(dateStr ?? new Date());

    return date.toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Invalid date string:", dateStr);
    console.error(error);
    return dateStr ?? ""; // fallback
  }
}

export function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Logs the user out by clearing all auth-related data
 * and redirecting to the login page.
 */
export function logout(): void {
  // Don't run on the server
  if (typeof window === "undefined") {
    return;
  }

  // Clear our custom flags and tokens
  setIsUserLoggedIn(false);
  localStorage.removeItem("authToken");
  localStorage.removeItem("userPictureUrl");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
}

export function getSelectedStore(): StoreModel | undefined {
  if (typeof window === "undefined") return undefined;

  const store = sessionStorage.getItem("selectedStore");

  if (!store) return undefined;

  try {
    return JSON.parse(store);
  } catch (error) {
    console.error("Error parsing selectedStore:", error);
    return undefined;
  }
}

export function clearSelectedStore(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("selectedStore");
}

export function isValidTwoDecimalNumber(value: string): boolean {
  const sanitized = value.replace(/\./g, "").replace(",", ".");
  return /^(\d+)?(\.\d{0,2})?$/.test(sanitized);
}
