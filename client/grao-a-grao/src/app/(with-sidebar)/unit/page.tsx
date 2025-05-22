"use client";

import Header from "@/components/Header";
import { Flex, Card, Heading, Button, Table, AlertDialog, Skeleton, IconButton, Tooltip } from "@radix-ui/themes";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as units_api from "@/api/units_api";
import { UnitOfMeasureModel, UnitOfMeasureRequest, UnitOfMeasureResponse, toUnitOfMeasureRequest, normalizeUnitOfMeasureResponse } from "@/types/unit_of_measure";
import ModalFormUnitOfMeasure from "@/components/Form/Modal/ModalFormUnitOfMeasure";
import ModalDeleteReferencedErrorItem from "@/components/Error/Delete/UnitOfMeasure/ModalDeleteReferencedErrorItem";
import ModalGenericError from "@/components/Error/ModalGenericError";
import { ErrorCodes, ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/errors/api_error";
import { ItemModel } from "@/types/item";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";


export default function UnitPage() {
    const storeId = getSelectedStore()?.id
    
    const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);
    const [loading, setLoading] = useState(false);

    type ErrorModalState =
        | { type: "delete-referenced"; data: ForeignKeyDeleteReferencedErrorResponse<ItemModel>; unit: UnitOfMeasureModel }
        | { type: "generic-error"; data: GenericPostgreSQLErrorResponse }
        | { type: "none" };
    const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });


    // State for the unit of measure being edited.
    const defaultUnitOfMeasure = {
        id: 0,
        description: "",
    };
    const [editUnitOfMeasure, setEditUnitOfMeasure] = useState<UnitOfMeasureModel>(defaultUnitOfMeasure);

    // State for editing modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEdit, setIsModalEdit] = useState(false);
    const [, setIsModalCreate] = useState(true);

    // Handlers for open/close modal.
    const handleCloseModal = () => setIsModalOpen(false);
    const handleOpenModal = (type: "edit" | "create") => {

        if (type === "edit") {
            setIsModalEdit(true);
            setIsModalCreate(false);
        }
        else if (type === "create") {
            setIsModalEdit(false);
            setIsModalCreate(true);
        }

        setIsModalOpen(true)
    };

    // Fetch items when the component mounts.
    useEffect(() => {
        fetchUnits();
    }, [storeId]);

    const fetchUnits = async () => {
        setLoading(true);

        try {
            const unitOfMeasureResponse: UnitOfMeasureResponse[] = await units_api.fetchUnits();
            const unitOfMeasureModel: UnitOfMeasureModel[] = unitOfMeasureResponse.map(
                (unit) => { return normalizeUnitOfMeasureResponse(unit) }
            );

            setUnitsOfMeasure(unitOfMeasureModel ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newUnit: UnitOfMeasureModel) => {
        try {
            const unitOfMeasureRequest: UnitOfMeasureRequest = toUnitOfMeasureRequest(newUnit);
            const unitOfMeasureResponse: UnitOfMeasureResponse = await units_api.createUnit(unitOfMeasureRequest);
            const created: UnitOfMeasureModel = normalizeUnitOfMeasureResponse(unitOfMeasureResponse);

            setUnitsOfMeasure((prev) => [...prev, created]);
            setIsModalOpen(false);

            toast.success('Unidade de Medida criada com sucesso!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (toUpdateUnit: UnitOfMeasureModel) => {
        try {

            const unitOfMeasureRequest: UnitOfMeasureRequest = toUnitOfMeasureRequest(toUpdateUnit);
            const unitOfMeasureResponse: UnitOfMeasureResponse = await units_api.createUnit(unitOfMeasureRequest);
            const updated: UnitOfMeasureModel = normalizeUnitOfMeasureResponse(unitOfMeasureResponse);

            setUnitsOfMeasure((prev) => prev.map(unit => unit.id === updated.id ? updated : unit));
            setEditUnitOfMeasure(defaultUnitOfMeasure);
            setIsModalOpen(false);

            toast.success('Unidade de Medida editada com sucesso!');
        } catch (err) {
            console.error(err);
        }
    }

    const handleDeleteReferencedError = (err: ForeignKeyDeleteReferencedErrorResponse<ItemModel>, unit: UnitOfMeasureModel) => {
        setErrorModal({ type: "delete-referenced", unit, data: err });
    };

    const handleDeleteGenericError = (err: GenericPostgreSQLErrorResponse) => {
        setErrorModal({ type: "generic-error", data: err });
    };

    const handleDelete = async (id: number) => {

        try {

            await units_api.deleteUnit(id);
            setUnitsOfMeasure((prev) => prev.filter(unit => unit.id !== id));
            toast.success('Unidade de Medida deletada com sucesso!');
        } catch (err) {

            const errorWithData = err as { data?: { internal_code?: string } };

            if (errorWithData?.data?.internal_code === ErrorCodes.DELETE_REFERENCED_ENTITY) {

                const errorData: ForeignKeyDeleteReferencedErrorResponse<ItemModel> = errorWithData.data as ForeignKeyDeleteReferencedErrorResponse<ItemModel>;
                handleDeleteReferencedError(errorData, unitsOfMeasure.find((un) => un.id == id) ?? defaultUnitOfMeasure);

            } else if (errorWithData?.data?.internal_code === ErrorCodes.GENERIC_DATABASE_ERROR) {

                const genericError: GenericPostgreSQLErrorResponse = errorWithData.data as GenericPostgreSQLErrorResponse;
                handleDeleteGenericError(genericError);

            } else {
                alert("Unexpected error occurred while deleting the item.");
            }
        }

    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen w-full">
            <Header />

            <Card
                id="main-flex"
                className="flex-1 my-3 w-14/16 sm:w-9/10 sm:my-12 flex-col"
                style={{ display: "flex" }}
            >

                <Flex
                    className="w-full bg-[var(--accent-4)]" p={"3"}
                    style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
                    justify={"between"}
                    align={"center"}
                >

                    <Heading size={{ sm: "8" }} weight={"bold"}>Unidade de Medida</Heading>
                    <Tooltip content="Criar nova unidade de medida">
                        <Button size="3" onClick={() => handleOpenModal("create")}>Criar</Button>
                    </Tooltip>
                </Flex>

                <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
                    <Table.Root>

                        <Table.Header>
                            <Table.Row align={"center"}>
                                <Table.ColumnHeaderCell>Descrição</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>

                            {loading ? (null) : (
                                unitsOfMeasure.map((unit) => (
                                    <Table.Row key={unit.id} align={"center"}>
                                        <Table.RowHeaderCell>{unit.description}</Table.RowHeaderCell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                                                <Tooltip content="Editar unidade de medida">
                                                    <IconButton
                                                        size={"1"}
                                                        about="Edit"
                                                        variant="soft"
                                                        onClick={
                                                            (ev) => {
                                                                ev.stopPropagation();
                                                                setEditUnitOfMeasure(unit);
                                                                handleOpenModal("edit");
                                                            }
                                                        }>
                                                        <PencilSquareIcon height="16" width="16" />
                                                    </IconButton>
                                                </Tooltip>
                                                <AlertDialog.Root>
                                                    <Tooltip content="Excluir unidade de medida">
                                                        <AlertDialog.Trigger>
                                                            <IconButton
                                                                size={"1"}
                                                                about="Delete"
                                                                variant="soft"
                                                                color="red">
                                                                <TrashIcon height="16" width="16" />
                                                            </IconButton>
                                                        </AlertDialog.Trigger>
                                                    </Tooltip>
                                                    <AlertDialog.Content maxWidth="450px">
                                                        <AlertDialog.Title>Deletar {unit.description}</AlertDialog.Title>
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
                                                                    onClick={
                                                                        (ev) => {
                                                                            ev.stopPropagation();
                                                                            handleDelete(unit.id ?? 0);
                                                                        }
                                                                    }>
                                                                    Deletar
                                                                </Button>
                                                            </AlertDialog.Action>
                                                        </Flex>
                                                    </AlertDialog.Content>
                                                </AlertDialog.Root>

                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}

                        </Table.Body>
                    </Table.Root>
                </Skeleton>
            </Card>

            {isModalOpen && (
                <ModalFormUnitOfMeasure
                    mode={isModalEdit ? "edit" : "create"}
                    editUnitOfMeasure={isModalEdit ? editUnitOfMeasure : undefined}
                    onClose={handleCloseModal}
                    onSubmitCreate={handleCreate}
                    onSubmitEdit={handleEdit}
                >
                </ModalFormUnitOfMeasure>
            )}

            {errorModal.type === "delete-referenced" && (
                <ModalDeleteReferencedErrorItem
                    error={errorModal.data}
                    unit={errorModal.unit}
                    onClose={() => setErrorModal({ type: "none" })}
                />
            )}

            {errorModal.type === "generic-error" && (
                <ModalGenericError
                    title="Não é possível deletar."
                    details=" Esta unidade de medida é utilizada por outro item."
                    onClose={() => setErrorModal({ type: "none" })}
                />
            )}
        </Flex>
    )
}