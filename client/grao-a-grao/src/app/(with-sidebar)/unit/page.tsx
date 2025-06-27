"use client";

import Header from "@/components/Header";
import { Flex, Skeleton, Container } from "@radix-ui/themes";
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
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { UnitOfMeasureToolbar } from "./(data-table)/toolbar";


export default function UnitPage() {
    const storeId = getSelectedStore()?.id

    const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const [selectedField, setSelectedField] = useState("description");

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
    const openEdit = (unit: UnitOfMeasureModel) => {
        setEditUnitOfMeasure(unit);
        setIsModalEdit(true);
        setIsModalCreate(false);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setIsModalEdit(false);
        setIsModalCreate(true);
        setIsModalOpen(true);
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

            <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
                <Skeleton loading={loading} className="h-2/5">
                    <Container>
                        <DataTable
                            columns={getColumns(openEdit, handleDelete, filterValue, selectedField)}
                            data={unitsOfMeasure}
                            handleCreate={openCreate}
                            title="Unidade de Medida"
                            createButtonToolTip="Criar nova unidade de medida"
                            renderToolbar={(table) => (
                                <UnitOfMeasureToolbar
                                    table={table}
                                    selectedField={selectedField}
                                    onSelectedFieldChange={setSelectedField}
                                    filterValue={filterValue}
                                    onFilterValueChange={setFilterValue}
                                />
                            )}
                        />
                    </Container>
                </Skeleton>
            </Flex>
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