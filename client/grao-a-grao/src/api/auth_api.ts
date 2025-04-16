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
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
    }

    const { googleUrl } = await response.json();
    return googleUrl;
}