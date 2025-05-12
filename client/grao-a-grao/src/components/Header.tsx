"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, Link as RadixLink, IconButton, Avatar, Skeleton, Card } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { getUserAvatarUrl, getUserEmail, getUserName, isUserLoggedIn } from "@/util/util";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const logged = isUserLoggedIn();
        setUserLoggedIn(logged);
        if (!logged) {
            router.push("/login");
        }
    }, [router]);

    return (
        <Box className="w-full border-b-1 px-4 py-2">
            <Flex align="center" justify="between">

                <SidebarTrigger />

                {/* Logo / App Name */}
                <Text size="6" weight="bold">
                    <Link href="/" passHref>
                        <RadixLink className="no-underline text-inherit">☕ Grão a Grão</RadixLink>
                    </Link>
                </Text>


                    <Flex gap="3" align="center">
                        <Avatar
                            fallback={getUserName()?.charAt(0) ?? "U"}
                            radius="full"
                            size={{ initial: "3", sm: "4" }}
                            src={getUserAvatarUrl() ?? "https://www.gravatar.com/avatar/?d=mp"}
                            alt="User"
                        />

                    </Flex>
            </Flex>
        </Box>
    );
}
