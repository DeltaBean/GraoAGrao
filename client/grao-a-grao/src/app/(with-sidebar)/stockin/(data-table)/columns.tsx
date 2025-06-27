import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/util/util";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { Badge, Button, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { CheckCircleIcon, EyeIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import { StockInModel } from "@/types/stock_in";

/*
    Columns are where you define the core of what your table will look like. 
    They define the data that will be displayed, how it will be formatted, sorted and filtered.
*/
export const getColumns = (
    handleDelete: (id: number) => Promise<void>,
    handleEdit: (id: number) => void,
    handleFinalize: (id: number) => Promise<void>,
    handleView: (id: number) => void,
): ColumnDef<StockInModel>[] => [
        {
            accessorKey: "created_at",
            filterFn: (row, columnId, filterValue) => {
                const date = new Date(row.getValue(columnId))
                const from = filterValue?.from ? new Date(filterValue.from) : null
                const to = filterValue?.to ? new Date(filterValue.to) : null

                if (from && date < from) return false
                if (to && date > to) return false

                return true
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Criada Em
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                return formatDateTime(row.getValue("created_at"));
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Text className="text-foreground">
                            Status
                        </Text>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.getValue("status") as string;

                if (status === "draft") {

                    return (
                        <Tooltip content="Ainda não finalizada, permite edição">
                            <Badge color="amber" variant="surface">Rascunho</Badge>
                        </Tooltip>
                    )

                } else if (status === "finalized") {

                    return (
                        <Tooltip
                            content={
                                <>
                                    Confirmada e integrada ao estoque, não permite edição.
                                    <br />
                                    Finalizada em: {formatDateTime(row.original.finalized_at)}
                                </>
                            }
                        >
                            <Badge variant="surface">Finalizada</Badge>
                        </Tooltip>
                    )

                }
            }
        },
        {
            id: "actions",
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => {
                const stockIn = row.original;
                return <ColumnActions
                    stockIn={stockIn}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    handleFinalize={handleFinalize}
                    handleView={handleView} />;
            },
        },
    ];

function ColumnActions({
    stockIn,
    handleDelete,
    handleEdit,
    handleFinalize,
    handleView,
}: {
    stockIn: StockInModel;
    handleDelete: (id: number) => Promise<void>;
    handleEdit: (id: number) => void;
    handleFinalize: (id: number) => Promise<void>;
    handleView: (id: number) => void;
}) {
    return (
        <Flex direction={"row"} justify={"center"} align={"center"} gap={"2"}>
            <Tooltip content={stockIn.status == "draft" ? "Editar entrada de estoque" : "Finalizada, edição não permitida."}>
                <IconButton
                    disabled={stockIn.status === "finalized"}
                    size={"1"}
                    about="Edit"
                    variant="soft"
                    onClick={
                        (ev) => {
                            ev.stopPropagation();
                            handleEdit(stockIn.id ?? 0);
                        }
                    }>
                    <PencilSquareIcon height="16" width="16" />
                </IconButton>
            </Tooltip>
            <Tooltip content={stockIn.status == "draft" ? "Finalizar entrada de estoque. Após finalizada será integrada ao estoque e não poderá mais ser editada." : "Já finalizada."}>
                <IconButton
                    disabled={stockIn.status === "finalized"}
                    size={"1"}
                    about="Finalize"
                    variant="soft"
                    onClick={() => { handleFinalize(stockIn.id ?? 0); }}>
                    <CheckCircleIcon height="16" width="16" />
                </IconButton>
            </Tooltip>
            <Tooltip content={stockIn.status == "draft" ? "Deletar entrada de estoque." : "Finalizada, deleção não permitida."}>
                <IconButton
                    disabled={stockIn.status === "finalized"}
                    color="red"
                    size={"1"}
                    about="Finalize"
                    variant="soft"
                    onClick={() => { handleDelete(stockIn.id ?? 0); }}>
                    <TrashIcon height="16" width="16" />
                </IconButton>
            </Tooltip>
            {stockIn.status == "finalized" ?
                (
                    <Tooltip content="Visualizar entrada de estoque.">
                        <IconButton
                            size={"1"}
                            about="Visualize"
                            variant="soft"
                            onClick={
                                (ev) => {
                                    ev.stopPropagation();
                                    handleView(stockIn.id ?? 0);
                                }
                            }>
                            <EyeIcon height="16" width="16" />
                        </IconButton>
                    </Tooltip>
                )
                : ""
            }
        </Flex>
    );
}
