// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { isUserLoggedIn } from "@/util/util";
import { Flex, Card } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const logged = isUserLoggedIn();
    setUserLoggedIn(logged);
    if (!logged) {
      //router.push("/login");
    }
  }, [router]);


  return (
      <Flex
        id="main-flex"
        className="w-full h-screen" direction={"column"} justify={"center"} align={"center"}

        /* needed inline style to override radix-ui */
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Card>Ola</Card>
        <Card>Ola</Card>
      </Flex>
  );
}
