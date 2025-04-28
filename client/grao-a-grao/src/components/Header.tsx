"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, Link as RadixLink, IconButton, Avatar, Skeleton, Card } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { getUserAvatarUrl, getUserEmail, getUserName, isUserLoggedIn } from "@/util/util";

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
        <Box className="w-full border-b-1 px-4 py-3">
            <Flex align="center" justify="between">
                {/* Logo / App Name */}
                <Text size="5" weight="bold">
                    <Link href="/" passHref>
                        <RadixLink className="no-underline text-inherit">☕ Grão a Grão</RadixLink>
                    </Link>
                </Text>

                {/* Desktop nav links */}
                <Flex gap="4" align="center" display={{ initial: "none", sm: "flex" }}>
                    <NavLink href="/item" label="Items" />
                    <NavLink href="/category" label="Category" />
                    <NavLink href="/unit" label="Units" />
                    <NavLink href="/itemPackaging" label="Packaging" />
                    <NavLink href="/stockin" label="Stock In" />
                    <NavLink href="/stockout" label="Stock Out" />
                </Flex>

                {/* Mobile menu toggle */}
                <Box className="sm:hidden" display={{ initial: "block", sm: "none" }}>
                    <IconButton
                        size="2"
                        radius="full"
                        variant="ghost"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                    </IconButton>

                </Box>
                <Card>
                    <Flex gap="3" align="center">
                        <Avatar
                            fallback="U"
                            radius="full"
                            size={{ initial: "3", sm: "4" }}
                            src={getUserAvatarUrl() ?? "https://www.gravatar.com/avatar/?d=mp"}
                            alt="User"
                        />
                        <Box display={{initial: "none", sm: "block"}}>
                            <Text as="div" size="2" weight="bold">
                                {getUserName()}
                            </Text>
                            <Text as="div" size="2" color="gray">
                                {getUserEmail()}
                            </Text>
                        </Box>
                    </Flex>
                </Card>
            </Flex>

            {/* Mobile nav menu (shown only when open) */}
            {menuOpen && (
                <Flex direction="row" gap="4" className="sm:hidden mt-3 px-2">
                    <NavLink href="/item" label="Items" />
                    <NavLink href="/category" label="Category" />
                    <NavLink href="/unit" label="Units" />
                    <NavLink href="/itemPackaging" label="Packaging" />
                    <NavLink href="/stockin" label="Stock In" />
                    <NavLink href="/stockout" label="Stock Out" />
                </Flex>
            )}
        </Box>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
    return (
      <Link href={href} passHref>
        <RadixLink>
          <Text
            weight="medium"
            className={`
              py-1 px-4
              ${isActive
                ? "bg-[var(--accent-8)] text-[var(--gray-1)]"
                : "hover:bg-[var(--accent-3)]"}
            `}
            style={{ borderRadius: "var(--radius-6)" }}
          >
            {label}
          </Text>
        </RadixLink>
      </Link>
    );
  }
