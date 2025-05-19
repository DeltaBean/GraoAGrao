// components/CreateTenantEnvironment.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Button, Text, Card, Flex, Box, DataList, Badge } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoogleOAuthTryOutLogin } from "@/api/auth_api";
import { setIsUserLoggedIn } from "@/util/util";
import { GetTryOutJobStatus } from "@/api/tryout_api";

export default function CreateTryOutEnvironment() {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "creating" | "success" | "error">("idle");
    const [tryOutUuid, setTryOutUuid] = useState<string | null>(null);

    const handleGoogleSignUp = async () => {
        setStatus("creating");

        try {
            // Call your authService function
            const googleUrl = await GoogleOAuthTryOutLogin();
            window.open(googleUrl, "TryOutWindow", "width=600,height=600");

        } catch (err) {
            console.error(err);
            setStatus("error");
            toast.error("Erro inesperado.");
        }
    };

    const onMessage = useCallback(
        (e: MessageEvent) => {
            // only accept messages from our own origin
            if (e.origin !== window.location.origin) return;
            const { token, uuid, name, email, avatar_url } = e.data || {};

            if (token && uuid) {
                // persist session
                localStorage.setItem("authToken", token);
                localStorage.setItem("userName", name || "");
                localStorage.setItem("userEmail", email || "");
                localStorage.setItem("userPictureUrl", avatar_url || "");
                setIsUserLoggedIn(true);

                setTryOutUuid(uuid);
            }
        },
        [router]
    );

    // polling try-out job status
    useEffect(() => {
        if (!tryOutUuid) return;       // wait until we have a UUID
        setStatus("creating");         // start with “creating” state

        let intervalId: NodeJS.Timeout;
        const timeoutId = setTimeout(() => {
            const poll = async () => {
                try {
                    const newStatus = await GetTryOutJobStatus(tryOutUuid);
                    setStatus(newStatus);

                    if (newStatus === "success") {
                        clearInterval(intervalId);
                        setStatus("success");
                        toast.success("Ambiente criado com sucesso!");
                    }
                } catch (err) {
                    console.error(err);
                    clearInterval(intervalId);
                    setStatus("error");
                    toast.error("Erro ao checar status");
                }
            };

            // first call after 2s
            poll();
            // then every 3s
            intervalId = setInterval(poll, 3000);
        }, 2000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [tryOutUuid, router]);

    // message listener
    useEffect(() => {
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [onMessage]);

    return (
        <>
            <Flex justify={"between"} direction={"column-reverse"} gap="2">
                <AnimatePresence mode="wait">
                    {status === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box mt="2">
                                <Button onClick={handleGoogleSignUp}>
                                    <Flex className="w-full" align="center" justify="start" gap="3">
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                        </svg>
                                        <Text>Entrar com o Google</Text>
                                    </Flex>
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                    {(status === "success") && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box mt="2">
                                <Button onClick={() => router.push("/")}>Entrar!</Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Flex>
                    <Card>
                        <DataList.Root>
                            <DataList.Item>
                                <DataList.Label>Ambiente</DataList.Label>
                                <DataList.Value>
                                    {
                                        status === "idle" ?
                                            <Badge color="gold" variant="soft">
                                                Aguardando início
                                            </Badge>
                                            :
                                            status === "creating" ?
                                                <Badge color="yellow" variant="soft">
                                                    Configurando ambiente...
                                                </Badge>
                                                : status === "success" ?
                                                    <Badge color="green" variant="soft">
                                                        Ambiente pronto!
                                                    </Badge>
                                                    : status === "error" ?
                                                        <Badge color="red" variant="soft">
                                                            Falha na criação
                                                        </Badge> : <></>
                                    }
                                </DataList.Value>
                            </DataList.Item>
                        </DataList.Root>
                    </Card>
                </Flex>
            </Flex >
        </>
    );
}
