"use client"

import CreateTryOutEnvironment from "@/components/CreateTryOutEnvironment"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Box, Card, Container, Flex, Heading, IconButton, Section, Separator, Strong, Text } from "@radix-ui/themes"
import { ArrowLeft, ArrowUpLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TryOutPage() {
    const router = useRouter();
    return (
        <Flex direction={"column"} className="min-h-screen w-full">
            <Flex
                id="main-flex"
                className="flex-1 w-full"
                direction={"column"}
                justify={"center"}
                align={"center"}
            >
                <Card className="w-3/4 sm:w-1/2">

                <IconButton variant="ghost" color="gray" onClick={() => router.push("/login")}>
                    <ArrowLeft></ArrowLeft>
                </IconButton>

                    <Flex px="5" pb="5" gap="8" direction={"column"}>

                        <Flex align={"center"} justify={"center"} direction={"column"} pt="2">
                            <Heading size="7" as={"h1"} weight={"bold"}>Projeto Grão a Grão</Heading>
                            <Heading weight={"light"} className="text-[var(--gray-11)]">Gestão de Estoque</Heading>
                        </Flex>

                        <Flex direction={"column"} gap="1">
                            <Text size="3" weight={"light"}>
                                Uma ferramenta de controle de estoque para pequenos negócios.
                            </Text>
                            <Text size="3" weight={"light"}>
                                Organize entradas e saídas, acompanhe seu estoque em tempo real e visualize tudo em dashboards simples e intuitivos.
                            </Text>
                        </Flex>

                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Como funciona o modo de demonstração?</AccordionTrigger>
                                <AccordionContent>
                                    <Flex direction={"column"} gap="3">
                                        <Text size="3" weight={"light"}>
                                            O ambiente de demonstração será criado automaticamente atrelado a sua conta Google.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            Cada ambiente de demonstração tem validade de <Strong>24 horas</Strong>. Por motivos de segurança e desempenho, há um <Strong>limite de 5 novos acessos por dia</Strong>.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            Seus dados ficam salvos só durante a demonstração. Depois de 24 horas, tudo é apagado automaticamente, seguindo as regras da <Strong>LGPD</Strong>.
                                        </Text>
                                    </Flex>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Curioso sobre a arquitetura?</AccordionTrigger>
                                <AccordionContent>
                                    <Flex direction={"column"} gap="3">
                                        <Text size="3" weight={"light"}>
                                            <Strong>Microsserviços</Strong> com multi-tenancy por schema: dados isolados, mais segurança, mais escalabilidade.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            <Strong>Go</Strong> + <Strong>Gin</Strong> no back-end. <Strong>Goose</Strong> para migrações. Escolhi Go pela eficiência e economia no deploy em cloud.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            Orquestração de filas para processamento assíncrono com <Strong>RabbitMQ</Strong>, persistência e integridade com <Strong>PostgreSQL</Strong>
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            <Strong>Keycloak</Strong> gerencia usuários e permissões, com login via Google <Strong>OAuth</Strong>. Sessões protegidas com <Strong>JWT</Strong> e reforçadas com <Strong>rate limiting e logs de auditoria</Strong>.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            Front-end em <Strong>React Next.js</Strong>, usando <Strong>Radix UI e shadcn/ui</Strong> para construir interfaces acessíveis, modernas e performáticas.
                                        </Text>
                                        <Separator size={"4"}></Separator>
                                        <Text size="3" weight={"light"}>
                                            Microsserviços no <Strong>Railway</Strong>, front-end no <Strong>Cloudflare Pages</Strong> e arquivos no <Strong>R2</Strong>. Simples, rápido e global.
                                        </Text>
                                    </Flex>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <CreateTryOutEnvironment />

                    </Flex>
                </Card>
            </Flex>
        </Flex>
    )
}