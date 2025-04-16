export function isUserLoggedIn(): boolean {
  // Check if localStorage is available (in environments like SSR, window might be undefined)
  if (typeof window === "undefined") {
    return false;
  }

  const value = localStorage.getItem("IsUserLoggedIn");
  // If value is "true", return true, otherwise false
  return value === "true";
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