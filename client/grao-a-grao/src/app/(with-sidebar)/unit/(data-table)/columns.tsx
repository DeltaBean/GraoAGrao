import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { AlertDialog, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { highlightMatch } from "@/util/util_comp";
import { UnitOfMeasureModel } from "@/types/unit_of_measure";

/*
    Columns are where you define the core of what your table will look like. 
    They define the data that will be displayed, how it will be formatted, sorted and filtered.
*/
export const getColumns = (
    openEdit: (unit: UnitOfMeasureModel) => void,
    handleDelete: (id: number) => Promise<void>,
    filterValue: string,
    selectedField: string
): ColumnDef<UnitOfMeasureModel>[] => [
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
                const unit = row.original;
                return <ColumnActions unit={unit} openEdit={openEdit} handleDelete={handleDelete} />;
            },
        },
    ];

function ColumnActions({
    unit,
    openEdit,
    handleDelete,
}: {
    unit: UnitOfMeasureModel;
    openEdit: (unit: UnitOfMeasureModel) => void;
    handleDelete: (id: number) => Promise<void>;
}) {
    return (
        <Flex gap="2" justify="center">
            <Tooltip content="Editar unidade de medida">
                <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => openEdit(unit)}
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
                    <AlertDialog.Title>Deletar {unit.description}?</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                        Tem certeza? Esta unidade de medida será deletada permanentemente.
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
                                onClick={() => handleDelete(unit.id ? unit.id : 0)}
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
