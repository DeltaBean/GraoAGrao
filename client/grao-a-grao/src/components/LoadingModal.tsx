"use client";

import React from "react";
import { Card, Flex, Box, Text, Spinner, Heading } from "@radix-ui/themes";

export type LoadingModalProps = {
    isOpen: boolean;
    message: string;
};

export default function LoadingModal({ isOpen, message }: LoadingModalProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-[var(--color-overlay)] z-50">
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        className="w-full h-full"
                    >
                        <Card className="p-6 flex flex-col items-center justify-center">
                            <Flex direction="column" justify="center" align="center" gap="3">
                                {/* Spinner */}
                                <Box
                                    as="div"
                                    className="
                                w-12 
                                h-12 
                                border-4 
                                border-[var(--accent-indicator)] 
                                border-t-transparent 
                                rounded-full 
                                animate-spin
                                my-4"
                                    aria-label="Loading spinner"
                                />
                                {/* Message */}
                                <Heading size="3">{message}</Heading>
                            </Flex>
                        </Card>
                    </Flex>
                </div>
            )}
        </>
    );
}
