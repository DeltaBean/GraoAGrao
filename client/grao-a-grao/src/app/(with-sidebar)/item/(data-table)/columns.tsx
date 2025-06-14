import { ItemModel } from "@/types/item";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { AlertDialog, Badge, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrashIcon } from "lucide-react";

export const getColumns = (
    openEdit: (store: ItemModel) => void,
    handleDelete: (id: number) => Promise<void>,
): ColumnDef<ItemModel>[] => [
        {
            accessorFn: (row) => row.description,
            id: "item-description",
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
        },
        {
            accessorFn: (row) => row.category?.description ?? "—",
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
            accessorFn: (row) => row.unit_of_measure?.description ?? "—",
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
            accessorFn: (row) => row.ean13 ?? "—",
            id: "item-ean",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            EAN-13
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => {
                const store = row.original;
                return <ColumnActions item={store} openEdit={openEdit} handleDelete={handleDelete} />;
            },
        },
    ];

function ColumnActions({
    item,
    openEdit,
    handleDelete,
}: {
    item: ItemModel;
    openEdit: (store: ItemModel) => void;
    handleDelete: (id: number) => Promise<void>;
}) {
    return (
        <Flex gap="2" justify="center">
            <Tooltip content="Editar loja">
                <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => openEdit(item)}
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
                <AlertDialog.Content maxWidth="350px">
                    <AlertDialog.Title>Deletar {item.description}?</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Tem certeza? Este item será deletada permanentemente.
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
                                onClick={() => handleDelete(item.id ? item.id : 0)}
                            >
                                Deletar
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Flex>
    );
}
