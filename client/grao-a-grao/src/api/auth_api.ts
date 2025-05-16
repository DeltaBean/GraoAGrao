const apiUrl = process.env.NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL as string;

if (!apiUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_GOPHIC_PROCESSOR_API_URL is not defined.");
}

export async function GoogleOAuthLogin() {
    const response = await fetch(`${apiUrl}/auth/google`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Sending cookies
    });

    if (!response.ok) {
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
            const data = await response.json();

            // throw structured error with type attached
            throw {
                status: response.status,
                data,
            };
        }

        throw new Error('Unknown server error while deleting item.');
    }

    const { googleUrl } = await response.json();
    return googleUrl;
}

export async function GoogleOAuthTryOutLogin() {
  const response = await fetch(`${apiUrl}/auth/google?isTryOut=true`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to initiate demo OAuth");
  const { googleUrl } = await response.json();
  return googleUrl;
}