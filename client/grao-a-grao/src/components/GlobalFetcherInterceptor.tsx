"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalFetchInterceptor({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const response = await originalFetch(...args);
                if (response.status === 401) {

                    // Clear specific keys from localStorage.
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userPictureUrl");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userEmail");
                    
                    // Redirect to the root page.
                    router.push("/");
                }
                return response;
            };

            // Restore original fetch on cleanup.
            return () => {
                window.fetch = originalFetch;
            };
        }
    }, [router]);

    return <>{children}</>;
}