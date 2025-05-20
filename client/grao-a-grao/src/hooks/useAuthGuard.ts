"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isUserLoggedIn } from "@/util/util";

export function useAuthGuard() {
    const router = useRouter();
    
    useEffect(() => {
        console.log("authguard")
        if (!isUserLoggedIn()) {
            router.replace("/login");
        }
    }, [router]);         // ← keep router in the dep-array
}