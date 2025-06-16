import { StockModel } from "@/types/stock";
import { highlightMatch } from "@/util/util_comp";
import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const getColumns = (
    filterValue: string,
    selectedField: string
): ColumnDef<StockModel>[] => [
        {
            accessorFn: (row) => row.item.description,
            id: "item-description",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Item
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const value = row.getValue("item-description") as string;
                return selectedField === "item-description"
                    ? highlightMatch(value, filterValue)
                    : value;
            },
        },
        {
            accessorFn: (row) => row.item.category?.description ?? "—",
            filterFn: (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
                const cellValue = row.getValue(columnId);
                return filterValue.includes(cellValue);
            },
            id: "item-category",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <Text className="text-foreground">Categoria</Text>
                    <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                </Button>
            ),
            cell: ({ row }) => {
                const category = row.getValue("item-category");
                return (
                    <Badge color="iris" size="1" variant="surface">
                        {String(category)}
                    </Badge>
                );
            },
        },
        {
            accessorFn: (row) => row.item.unit_of_measure?.description ?? "—",
            id: "item-unit-of-measure",
            filterFn: (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
                const cellValue = row.getValue(columnId);
                return filterValue.includes(cellValue);
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Unidade de Medida
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const unit = row.getValue("item-unit-of-measure") as string;
                return (
                    <Badge color="purple" size="1" variant="surface">
                        {unit}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "current_stock",
            sortingFn: "basic",
            filterFn: (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
                const cellValue = Number(row.getValue(columnId));
                return cellValue >= filterValue[0] && cellValue <= filterValue[1];
            },
            header: ({ column }) => {
                return (
                    <Flex justify={"end"} align={"end"}>
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            <Text className="text-foreground">
                                Quantidade
                            </Text>
                            <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                        </Button>
                    </Flex>
                )
            },
            cell: ({ row }) => {
                const current_stock = row.getValue("current_stock");
                return (
                    <Flex justify={"end"} align={"end"}>
                        <Text className="font-mono">
                            {String(current_stock)}
                        </Text>
                    </Flex>
                );
            },
        },
    ];