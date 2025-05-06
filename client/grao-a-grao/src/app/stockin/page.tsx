// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Button, Card, Flex, Heading, IconButton, Skeleton, Table, Text } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockInResponse, StockInModel, StockInResponse } from "@/types/stock_in";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import * as stock_in_api from "@/api/stock_in_api";
import { formatDateTime } from "@/util/util";

export default function StockInPage() {
  const router = useRouter();

  const [stockIn, setStockIn] = useState<StockInModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock_in when the component mounts.
  useEffect(() => {
    fetchStockIn();
  }, []);

  const fetchStockIn = async () => {
    setLoading(true);

    try {

      const stockInResponse: StockInResponse[] = await stock_in_api.fetchStockIns();
      const stockInModel: StockInModel[] = stockInResponse.map((si) => normalizeStockInResponse(si));

      setStockIn(stockInModel ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
        <Card
          id="main-flex"
          className="flex-1 w-8/10 sm:w-9/10 sm:my-12 flex-col"
          style={{ display: "flex" }}
        >

          <Flex
            className="w-full bg-[var(--accent-4)]" p={"3"}
            style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
            justify={"between"}
            align={"center"}
          >

            <Heading size={{ sm: "8" }} weight={"bold"}>Entrada de Estoque</Heading>

            <Button size="3"> <Link href="/stockin/create">Novo</Link></Button>
          </Flex>

          <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
            <Table.Root>

              <Table.Header>

                <Table.Row align={"center"}>
                  <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>

                {loading ? (null) : (
                  stockIn.map((si) => (
                    <Table.Row key={si.id} align={"center"}>
                      <Table.RowHeaderCell>{formatDateTime(si.created_at)}</Table.RowHeaderCell>
                      <Table.Cell>
                        <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                          <IconButton
                            size={"1"}
                            about="Edit"
                            variant="soft"
                            onClick={
                              (ev) => {
                                ev.stopPropagation();
                                router.push(`/stockin/edit?id=${si.id}`)
                              }
                            }>
                            <PencilSquareIcon height="16" width="16" />
                          </IconButton>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}

              </Table.Body>
            </Table.Root>
          </Skeleton>
        </Card>
      </Flex>
    </Flex>
  );
}
