// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, Heading, Card, Box, TextField, Text, Button, Skeleton, Tooltip, Link } from "@radix-ui/themes";
import { UserIcon, LockClosedIcon } from "@heroicons/react/16/solid";
import { GoogleOAuthLogin } from "@/api/auth_api";
import { GoogleUserNotFoundResponse } from "@/errors/api_error";
import { useEffect, useState } from "react";
import ModalGenericError from "@/components/Error/ModalGenericError";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {

    const router = useRouter();

    type ErrorModalState =
        | {
            type: "google-user-notfound";
            data: GoogleUserNotFoundResponse;
            title: string;
            details: string;
        }
        | { type: "none" };
    const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });


    const handleGoogleUserNotFoundError = (
        err: GoogleUserNotFoundResponse,
        title: string = "Conta Google não vinculada",
        details: string = "Não encontramos nenhum usuário vinculado a essa conta Google. Você poderá, em breve, adquirir uma assinatura para usar a ferramenta. Enquanto isso, você pode testar a plataforma usando a opção 'Experimentar' disponível na tela de login."
    ) => {
        setErrorModal({ type: "google-user-notfound", data: err, title, details });
    };

    const searchParams = useSearchParams();

    useEffect(() => {
        const errorEncoded = searchParams.get("google_auth_error");
        if (errorEncoded) {
            try {
                const parsedError: GoogleUserNotFoundResponse = JSON.parse(decodeURIComponent(errorEncoded));
                handleGoogleUserNotFoundError(parsedError);
            } catch (err) {
                console.error("Erro ao interpretar erro de OAuthCallback", err);
                alert("Ocorreu um erro inesperado.")
            }
        }
    }, []);

    async function handleGoogleLogin() {
        try {
            // Call your authService function
            const googleUrl = await GoogleOAuthLogin();

            // Redirect to Google login page
            window.location.href = googleUrl;
        } catch (error) {
            console.error("Google OAUTH error:", error);
        }
    }

    return (
        <Flex direction={"column"} className="min-h-screen w-full">
            <Flex
                id="main-flex"
                className="flex-1 w-full"
                direction={"column"}
                justify={"center"}
                align={"center"}
            >
                <Card className="w-3/4 sm:w-1/4">
                    <Box mb={{ initial: "4", sm: "7" }}>
                        <Heading size={{ initial: "4", sm: "7" }} as={"h1"} weight={"bold"} className="sm:pl-6 sm:pr-6 sm:pt-2">Login</Heading>
                        <Heading color="gray" size={{ initial: "2", sm: "3" }} as={"h2"} weight={"light"} className="sm:pl-6 sm:pr-6 sm:pt-2 text-[var(--gray)]">Preencha com suas credenciais</Heading>
                    </Box>

                    <Box className="sm:pl-6 sm:pr-6 sm:pt-2">
                        <Flex direction={"column"} gap="4">
                            <Text as="label" size={"3"}>
                                <Skeleton>
                                    <div className="mb-2">Username</div>
                                </Skeleton>
                                <Skeleton>
                                    <TextField.Root size="3" placeholder="Enter your username...">
                                        <TextField.Slot>
                                            <UserIcon height="16" width="16" />
                                        </TextField.Slot>
                                    </TextField.Root>
                                </Skeleton>
                            </Text>

                            <Text as="label" size={"3"}>
                                <Skeleton>
                                    <div className="mb-2">Password</div>
                                </Skeleton>
                                <Skeleton>
                                    <TextField.Root size="3" placeholder="Enter your password...">
                                        <TextField.Slot>
                                            <LockClosedIcon height="16" width="16" />
                                        </TextField.Slot>
                                    </TextField.Root>
                                </Skeleton>
                            </Text>
                        </Flex>
                    </Box>

                    <Box className="sm:pl-6 sm:pr-6 sm:pt-2 mt-5 sm:mb-2">
                        <Flex direction={"column"} justify={"between"} gap="3">
                            <Skeleton>
                                <Button>Log In</Button>
                            </Skeleton>
                            <Button style={{ cursor: "pointer" }} onClick={handleGoogleLogin}>
                                <Flex className="w-full" align={"center"} justify={"start"} gap="3" >
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    </svg>
                                    <Text>Entrar com o Google</Text>
                                </Flex>
                            </Button>
                            <Flex direction="column" mt="6" gap="3">
                                <Text size="1">
                                    Recrutador? Explore agora esta ferramenta — desenvolvida 100% por <Link underline="always" href={"https://www.linkedin.com/in/lucas-burle-121551165/"}>Lucas Burle</Link>
                                </Text>
                                <Tooltip content="Clique e saiba mais!">
                                    <Button 
                                        color="gray"
                                        style={{ cursor: "pointer" }}
                                        variant="ghost"
                                        size={"1"}
                                        onClick={() => router.push("/tryOut")}
                                        >Experimentar
                                    </Button>
                                </Tooltip>
                            </Flex>
                        </Flex>
                    </Box>
                </Card>
                {errorModal.type === "google-user-notfound" && (
                    <ModalGenericError
                        title={errorModal.title}    
                        details={errorModal.details}
                        onClose={() => setErrorModal({ type: "none" })}
                    />
                )}
            </Flex>
        </Flex>
    );
}
