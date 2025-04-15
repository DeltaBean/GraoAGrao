export function isUserLoggedIn(): boolean {
    // Check if localStorage is available (in environments like SSR, window might be undefined)
    if (typeof window === "undefined") {
      return false;
    }
    
    const value = localStorage.getItem("IsUserLoggedIn");
    // If value is "true", return true, otherwise false
    return value === "true";
}