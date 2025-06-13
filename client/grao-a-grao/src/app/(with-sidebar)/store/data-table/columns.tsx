import { ColumnDef } from "@tanstack/react-table";
import { StoreModel } from "@/types/store";
import { formatDateTime } from "@/util/util";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { AlertDialog, Button, Flex, IconButton, Tooltip } from "@radix-ui/themes";
import { PencilSquareIcon } from "@heroicons/react/16/solid";

/*
    Columns are where you define the core of what your table will look like. 
    They define the data that will be displayed, how it will be formatted, sorted and filtered.
*/
export const getColumns = (openEdit: (store: StoreModel) => void, handleDelete: (id: number) => Promise<void>): ColumnDef<StoreModel>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Criada Em
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return formatDateTime(row.getValue("created_at"));
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => {
            const store = row.original;
            return <ColumnActions store={store} openEdit={openEdit} handleDelete={handleDelete} />;
        },
    },
];

function ColumnActions({
    store,
    openEdit,
    handleDelete,
}: {
    store: StoreModel;
    openEdit: (store: StoreModel) => void;
    handleDelete: (id: number) => Promise<void>;
}) {
    return (
        <Flex gap="2" justify="center">
            <Tooltip content="Editar loja">
                <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => openEdit(store)}
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
                    <AlertDialog.Title>Deletar {store.name}?</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Tem certeza? Esta loja será deletada permanentemente.
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
                                onClick={() => handleDelete(store.id)}
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
