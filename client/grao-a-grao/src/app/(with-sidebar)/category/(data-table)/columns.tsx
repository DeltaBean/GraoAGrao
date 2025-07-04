import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { AlertDialog, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { highlightMatch } from "@/util/util_comp";
import { CategoryModel } from "@/types/category";

/*
    Columns are where you define the core of what your table will look like. 
    They define the data that will be displayed, how it will be formatted, sorted and filtered.
*/
export const getColumns = (
    openEdit: (category: CategoryModel) => void,
    handleDelete: (id: number) => Promise<void>,
    filterValue: string,
    selectedField: string
): ColumnDef<CategoryModel>[] => [
        {
            accessorKey: "description",
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
                return selectedField === "description"
                    ? highlightMatch(value, filterValue)
                    : value;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => {
                const category = row.original;
                return <ColumnActions category={category} openEdit={openEdit} handleDelete={handleDelete} />;
            },
        },
    ];

function ColumnActions({
    category,
    openEdit,
    handleDelete,
}: {
    category: CategoryModel;
    openEdit: (category: CategoryModel) => void;
    handleDelete: (id: number) => Promise<void>;
}) {
    return (
        <Flex gap="2" justify="center">
            <Tooltip content="Editar categoria">
                <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => openEdit(category)}
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
                    <AlertDialog.Title>Deletar {category.description}?</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Tem certeza? Esta categoria será deletada permanentemente.
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
                                onClick={() => handleDelete(category.id ? category.id : 0)}
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
