import { ItemPackagingModel } from "@/types/item_packaging";
import { highlightMatch } from "@/util/util_comp";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { AlertDialog, Badge, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { motion } from "framer-motion";

export const getColumns = (
    openEdit: (store: ItemPackagingModel) => void,
    handleDelete: (id: number) => Promise<void>,
    filterValue: string,
    selectedField: string
): ColumnDef<ItemPackagingModel>[] => [
        {
            accessorFn: (row) => row.description,
            id: "description",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Descrição
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const value = row.getValue("description") as string;
                const highlightedValue = selectedField === "description" ? highlightMatch(value, filterValue) : value;
                return (
                    <Text>
                        {highlightedValue}
                    </Text>
                )
            },
        },
        {
            accessorFn: (row) => row.item?.description,
            id: "item-description",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Item de Estoque
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const value = row.getValue("item-description") as string;
                const highlightedValue = selectedField === "item-description" ? highlightMatch(value, filterValue) : value;
                return (
                    <Text>
                        {highlightedValue}
                        <Badge className="ml-2" variant="surface" size="1">
                            {row.original.item?.category?.description}
                        </Badge>
                    </Text>
                )
            },
        },
        {
            accessorFn: (row) => row.quantity,
            id: "quantity",
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
                const quantity = row.getValue("quantity");
                return (
                    <Flex justify={"end"} align={"end"}>
                        <Text className="font-mono">
                            {String(quantity)}
                        </Text>
                        <Badge className="ml-2" variant="surface" size="1">
                            {row.original.item?.unit_of_measure?.description}
                        </Badge>
                    </Flex>
                );
            },
        },
        {
            // This column is used only for filtering by item category
            // Hidden by default
            accessorFn: (row) => row.item?.category?.description,
            id: "item-category",
            filterFn: (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
                const cellValue = row.getValue(columnId);
                return filterValue.includes(cellValue);
            },
            cell: undefined, // No cell rendering, data table component handles this
            header: undefined, // No header rendering, data table component handles this
            enableHiding: false,
        },
        {
            // This column is used only for filtering by item unit of measure
            // Hidden by default
            accessorFn: (row) => row.item?.unit_of_measure?.description,
            id: "item-unit-of-measure",
            filterFn: (row, columnId, filterValue) => {
                if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
                const cellValue = row.getValue(columnId);
                return filterValue.includes(cellValue);
            },
            cell: undefined, // No cell rendering, data table component handles this
            header: undefined, // No header rendering, data table component handles this
            enableHiding: false,
        },
        {
            id: "actions",
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => {
                const pack = row.original;
                return <ColumnActions itemPackaging={pack} openEdit={openEdit} handleDelete={handleDelete} />;
            },
        },
    ];

function ColumnActions({
    itemPackaging,
    openEdit,
    handleDelete,
}: {
    itemPackaging: ItemPackagingModel;
    openEdit: (store: ItemPackagingModel) => void;
    handleDelete: (id: number) => Promise<void>;
}) {
    return (
        <Flex gap="2" justify="center">
            <Tooltip content="Editar fracionamento">
                <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => openEdit(itemPackaging)}
                >
                    <PencilSquareIcon height={16} width={16} />
                </IconButton>
            </Tooltip>
            <AlertDialog.Root>
                <Tooltip content="Delete">
                    <AlertDialog.Trigger>
                        <IconButton size="1" color="red" variant="soft">
                            <TrashIcon height={16} width={16} />
                        </IconButton>
                    </AlertDialog.Trigger>
                </Tooltip>
                <AlertDialog.Content 
                                 style={{
                                 overflow: "hidden",
                                 maxHeight: "90vh", 
                                 width: "100%",
                                 maxWidth: "480px",
                               }}
                             >
                               <motion.div
                                 initial={{ opacity: 0, x: 100 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ duration: 0.4, ease: "easeOut" }}
                               >

                    <AlertDialog.Title>Deletar {itemPackaging.description}?</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Tem certeza? Este fracionamento será deletada permanentemente.
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                                Cancelar
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button
                                variant="solid"
                                color="red"
                                onClick={() => handleDelete(itemPackaging.id ? itemPackaging.id : 0)}
                            >
                                Deletar
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                    </motion.div>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Flex>
    );
}
