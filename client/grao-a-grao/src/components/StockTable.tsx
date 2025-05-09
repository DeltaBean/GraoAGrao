"use client";

import React from "react";

import { Badge, Flex, Heading } from "@radix-ui/themes";
import { StockModel } from "@/types/stock";
import { TableRoot } from "./ui/Table/TableRoot";
import { TableHeader } from "./ui/Table/TableHeader";
import { TableColumnHeaderCell } from "./ui/Table/TableColumnHeaderCell";
import { TableRow } from "./ui/Table/TableRow";
import { TableBody } from "./ui/Table/TableBody";
import { TableCell } from "./ui/Table/TableCell";

export interface StockTableProps {
  /**
   * List of stock entries to display
   */
  stock: StockModel[];
}

export default function StockTable({ stock }: StockTableProps) {
  return (
    <>
      <Flex
        className="w-full bg-[var(--accent-4)]" p={"3"}
        style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
        justify={"between"}
        align={"center"}
      >

        <Heading size={{ sm: "8" }} weight={"bold"}>Estoque</Heading>
      </Flex>

      <TableRoot>
        <TableHeader>
          <TableRow align="center" isHighlightOnHover={false}>
            <TableColumnHeaderCell>Item</TableColumnHeaderCell>
            <TableColumnHeaderCell>Categoria</TableColumnHeaderCell>
            <TableColumnHeaderCell>Unidade</TableColumnHeaderCell>
            <TableColumnHeaderCell>Quantidade</TableColumnHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.map((st) => (
            <TableRow key={st.id} align="center" isHighlightOnHover={true}>
              <TableCell>{st.item.description}</TableCell>
              <TableCell>
                <Badge color="iris" size="1" variant="surface">
                  {st.item.category?.description || "-"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge color="purple" size="1" variant="surface">
                  {st.item.unit_of_measure?.description || "-"}
                </Badge>
              </TableCell>
              <TableCell>{st.current_stock}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </>
  );
}
