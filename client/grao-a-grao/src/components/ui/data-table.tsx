"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button, Flex, Heading, Tooltip } from "@radix-ui/themes"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title: string
    createButtonToolTip: string
    handleCreate: () => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    createButtonToolTip,
    handleCreate,
}: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        }
    })

    return (
        <div>
            <div className="rounded-xl border bg-card">
                <Flex
                    justify="between"
                    align="center"
                    p="3"
                    className="bg-[var(--accent-4)] rounded-t-lg"
                >
                    <Heading size={{ sm: "8" }} weight="bold">
                        {title}
                    </Heading>
                    <Tooltip content={createButtonToolTip}>
                        <Button size="3" onClick={handleCreate}>
                            Criar
                        </Button>
                    </Tooltip>
                </Flex>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Sem resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Flex justify={"between"} align="center" mt="4">
                <Button
                    variant="outline"
                    size="2"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="2"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Próximo
                </Button>
            </Flex>
        </div>
    )
}