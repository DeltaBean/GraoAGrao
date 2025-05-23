"use client"

import { Button, Card, Flex, Heading, Link, Text, Tooltip } from "@radix-ui/themes"
import { Hourglass } from "lucide-react"

export default function TrialExpiredPage() {
    return (
        <Flex direction={"column"} className="min-h-screen w-full">
            <Flex
                id="main-flex"
                className="flex-1 w-full"
                direction={"column"}
                justify={"center"}
                align={"center"}
            >
                <Card className="w-14/16 sm:w-1/2">

                    <Flex p="5" gap="6" direction={"column"}>

                        <Flex align={"center"} justify={"center"} direction={"column"}>
                            <Hourglass className="stroke-accent-foreground" size="45" />
                            <Heading align={"center"} weight={"light"} className="text-[var(--gray-11)]" mt="4">
                                Seu Teste Gratuito Terminou
                            </Heading>
                        </Flex>

                        <Flex direction={"column"} gap="2">
                            <Text size="3" weight={"light"} align={"center"}>
                                Esperamos que você tenha gostado de experimentar o Projeto Grão a Grão!
                            </Text>
                            <Text size="3" weight={"light"} align={"center"}>
                                Seu acesso aos recursos do aplicativo foi pausado, mas não se preocupe! Todo seu trabalho está a salvo caso você queira continuar conosco!
                            </Text>
                        </Flex>

                        <Flex direction={"row"} justify={"between"}>
                            <Button size="3" color="ruby">
                                Deletar Ambiente
                            </Button>
                            <Tooltip content="Em breve...">
                                <Button disabled size="3">Inscrever-se</Button>
                            </Tooltip>
                        </Flex>

                        <Text align={"center"} size="1" className="text-[var(--gray-9)]">
                            Se você escolher por deletar seu ambiente, todos os seus dados serão permanentemente removidos.
                            Esta ação não pode ser desfeita. Se você tem qualquer pergunta por favor <Link href={"mailto:lucasbburle@gmail.com"} underline="always">entre em contato com o suporte</Link>.
                        </Text>

                    </Flex>
                </Card>
            </Flex>
        </Flex>
    )
}