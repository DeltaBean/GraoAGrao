"use client";

import { Box, Flex, Text, Link as RadixLink, Avatar } from "@radix-ui/themes";
import { getUserAvatarUrl, getUserName } from "@/util/util";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Header() {

    useAuthGuard();

    return (
        <Box className="w-full border-b-1 px-4 py-2">
            <Flex align="center" justify="between">

                <SidebarTrigger />

                {/* Logo / App Name */}
                <Text size="6" weight="bold">
                    <RadixLink href="/" className="no-underline">
                        ☕ Grão a Grão
                    </RadixLink>
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
