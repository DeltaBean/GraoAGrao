"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/util/util";

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
                    logout();

                    // Redirect to the root page.
                    router.push("/login");
                }

                if (response.status === 403) {
                    try {
                        const data = await response.clone().json();
                        if (data?.error === "trial_expired") {
                            router.push("/trialExpired");
                        }
                    } catch (e) {
                        // fallback if response is not JSON
                        console.error("Failed to parse 403 error body:", e);
                    }
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