import { StockModel } from "@/types/stock";
import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const getColumns = (): ColumnDef<StockModel>[] => [
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
    },
    {
        accessorFn: (row) => row.item.category?.description ?? "—",
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