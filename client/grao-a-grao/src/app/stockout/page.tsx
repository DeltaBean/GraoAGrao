// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, Text } from "@radix-ui/themes";
import Header from "@/components/Header";

export default function StockOutPage() {
  return (
    <Flex direction={"column"} className="min-h-screen">
      <Header></Header>
      <Flex
        id="main-flex"
        className="flex-1 w-full"
        direction={"column"}
        justify={"center"}
        align={"center"}
      >
        <Text size={"9"}>STOCK OUT</Text>
      </Flex>
    </Flex>
  );
}
