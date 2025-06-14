"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    PaginationState,
    ColumnFiltersState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Box, Button, Card, DropdownMenu, Flex, Heading, IconButton, Slider, Text, Tooltip } from "@radix-ui/themes"
import RowResize from "../Icons/RowResize"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title: string
    createButtonToolTip?: string
    handleCreate?: () => void
    renderToolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    createButtonToolTip,
    handleCreate,
    renderToolbar,
}: DataTableProps<TData, TValue>) {

    const [rowHeightScale, setRowHeightScale] = React.useState(1.0);

    const [sorting, setSorting] = React.useState<SortingState>([])

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )

    // Pagination state
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10, // default, will be overwritten
    });

    const tableRef = React.useRef<HTMLTableElement>(null);
    const rowRef = React.useRef<HTMLTableRowElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const footerRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        const measure = () => {
            if (!rowRef.current || !wrapperRef.current) return;

            const rowHeight = rowRef.current.offsetHeight;
            const top = wrapperRef.current.getBoundingClientRect().top;

            const availableHeight = window.innerHeight - top - 250; // 250px buffer for footer/buttons

            if (rowHeight > 0) {
                const rowsThatFit = Math.floor(availableHeight / rowHeight);
                setPagination((prev) => ({
                    ...prev,
                    pageSize: rowsThatFit > 0 ? rowsThatFit : 1,
                }));
            }
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(document.body);
        window.addEventListener("resize", measure);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [data.length, rowHeightScale]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            pagination,
            columnFilters
        }
    })

    return (
        <Card variant="ghost" className="border">
            <Flex direction="column" gap="2">
                <Box className="bg-card overflow-hidden" ref={wrapperRef}>
                    <Flex
                        justify="between"
                        align="center"
                        px="3"
                        py="3"
                        pb="0"
                        className="bg-[var(--accent-4)] rounded-t-(--radius-3)"
                    >
                        <Heading size={{ sm: "7" }} weight="bold">
                            {title}
                        </Heading>
                        {handleCreate && createButtonToolTip &&
                            (
                                <Tooltip content={createButtonToolTip}>
                                    <Button size="3" onClick={handleCreate}>
                                        Criar
                                    </Button>
                                </Tooltip>
                            )
                        }
                    </Flex>
                    <Flex direction={"row"} gap="3" justify="start" align="center" p="3" className="bg-gradient-to-b from-[var(--accent-4)] to-[var(--accent-3)] border-b border-[var(--accent-4)]">
                        {renderToolbar?.(table)}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <IconButton
                                    size="2"
                                    variant="ghost"
                                >
                                    <RowResize className="w-5 h-5 text-foreground cursor-pointer" />
                                </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content size="1" variant="soft" className="w-40">
                                <DropdownMenu.RadioGroup
                                    value={
                                        rowHeightScale === 0.8
                                            ? "compact"
                                            : rowHeightScale === 1.0
                                                ? "default"
                                                : rowHeightScale === 1.2
                                                    ? "spacious"
                                                    : undefined
                                    }
                                >
                                    <DropdownMenu.RadioItem
                                        value="compact"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setRowHeightScale(0.8);
                                        }}
                                    >
                                        <Text size="1">Compacto</Text>
                                    </DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem
                                        value="default"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setRowHeightScale(1.0);
                                        }}
                                    >
                                        <Text size="1">Padrão</Text>
                                    </DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem
                                        value="spacious"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setRowHeightScale(1.2);
                                        }}
                                    >
                                        <Text size="1">Espaçoso</Text>
                                    </DropdownMenu.RadioItem>
                                </DropdownMenu.RadioGroup>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item className="hover:bg-inherit! focus:bg-inherit!">
                                    <Flex direction="column" gap="2" className="w-full mt-3">
                                        <Slider
                                            value={[rowHeightScale * 100]}
                                            min={80}
                                            max={150}
                                            step={5}
                                            onValueChange={([value]) => setRowHeightScale(value / 100)}
                                        />
                                    </Flex>
                                </DropdownMenu.Item>
                                <DropdownMenu.Label>
                                    <Flex justify={"center"}>
                                        <Text weight="light" size="1" align="center">{rowHeightScale.toFixed(2)}x</Text>
                                    </Flex>
                                </DropdownMenu.Label>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </Flex>
                    <Table ref={tableRef}>
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
                                table.getRowModel().rows.map((row, i) => (
                                    <TableRow
                                        key={`${row.id}-${rowHeightScale}`}
                                        ref={i === 0 ? rowRef : null} // only first row for measuring
                                        data-state={row.getIsSelected() && "selected"}
                                        style={{
                                            height: `${rowHeightScale * 3}rem`,
                                        }}
                                    >
                                        {
                                            row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))
                                        }
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
                </Box>
                <Flex justify={"between"} align="center" mt="4" ref={footerRef}>
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
            </Flex>
        </Card >
    )
}