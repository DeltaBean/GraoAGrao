"use client";

import { setIsUserLoggedIn } from "@/util/util";
import { Heading } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam) {
      router.push(`/login?google_auth_error=${encodeURIComponent(errorParam)}`);
    }

    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const avatar_url = searchParams.get("user_picture_url");
    const isTryOut = searchParams.get("isTryOut")
    const uuid = searchParams.get("uuid")

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", name || "");
      localStorage.setItem("userEmail", email || "");
      localStorage.setItem("userPictureUrl", avatar_url || "");
      setIsUserLoggedIn(true);

      if (isTryOut === "true" && window.opener) {
        // send data back to the opener window
        window.opener.postMessage(
          {
            token,
            uuid,
            name,
            email,
            avatar_url,
          },
          window.location.origin
        );
        window.close();
      } else {
        router.push("/");
      }
    }
  }, [router, searchParams]);

  return (
    <div>
      <Heading>Redirecionando...</Heading>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
