// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useState } from "react";
import { StockInModel } from "@/types/stock_in";
import { useRouter } from "next/router";
import Link from "next/link";

export default function StockInPage() {

  const [stockIn, SetStockIn] = useState<StockInModel[]>();
  
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
        <Text size={"9"}>STOCK IN</Text>
        <Button size="4"> <Link href="/stockin/create">CREATE</Link>  </Button>
      </Flex>
    </Flex>
  );
}
