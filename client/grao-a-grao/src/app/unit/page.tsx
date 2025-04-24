"use client";

import Header from "@/components/Header";
import { Flex, Card, Heading, Button, Table, AlertDialog, Skeleton, IconButton } from "@radix-ui/themes";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as units_api from "@/api/units_api";
import { UnitOfMeasureModel, UnitOfMeasureRequest, UnitOfMeasureResponse, toUnitOfMeasureRequest, normalizeUnitOfMeasureResponse } from "@/model/unit_of_measure";
import ModalFormUnitOfMeasure from "@/components/Form/Modal/ModalFormUnitOfMeasure";


export default function UnitPage() {

    const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for the unit of measure being edited.
    const defaultUnitOfMeasure = {
        id: 0,
        description: "",
    };
    const [editUnitOfMeasure, setEditUnitOfMeasure] = useState<UnitOfMeasureModel>(defaultUnitOfMeasure);

    // State for editing modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEdit, setIsModalEdit] = useState(false);
    const [isModalCreate, setIsModalCreate] = useState(true);

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
    }, []);

    const fetchUnits = async () => {
        setLoading(true);

        try {
            const unitOfMeasureResponse: UnitOfMeasureResponse[] = await units_api.fetchUnits();
            const unitOfMeasureModel: UnitOfMeasureModel[] = unitOfMeasureResponse.map(
                (unit) => { return normalizeUnitOfMeasureResponse(unit) }
            );

            setUnitsOfMeasure(unitOfMeasureModel ?? []);
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
        }
    }

    const handleDelete = async (id: number) => {

        try {
            await units_api.deleteUnit(id);
            setUnitsOfMeasure((prev) => prev.filter(unit => unit.id !== id));
        } catch (err: any) {
            setError(err.message);
        }

    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen">

            <Header></Header>

            <Card
                id="main-flex"
                className="flex-1 w-8/10 sm:w-9/10 sm:my-12 flex-col"
                style={{ display: "flex" }}
            >

                <Flex
                    className="w-full bg-[var(--accent-4)]" p={"3"}
                    style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
                    justify={"between"}
                    align={"center"}
                >

                    <Heading size={{ sm: "8" }} weight={"bold"}>Units of Measure</Heading>

                    <Button size="3" onClick={() => handleOpenModal("create")}>Create</Button>
                </Flex>

                <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
                    <Table.Root>

                        <Table.Header>
                            <Table.Row align={"center"}>
                                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>

                            {loading ? (null) : (
                                unitsOfMeasure.map((unit) => (
                                    <Table.Row key={unit.id} align={"center"}>
                                        <Table.RowHeaderCell>{unit.description}</Table.RowHeaderCell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
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

                                                <AlertDialog.Root>
                                                    <AlertDialog.Trigger>

                                                        <IconButton
                                                            size={"1"}
                                                            about="Delete"
                                                            variant="soft"
                                                            color="red">
                                                            <TrashIcon height="16" width="16" />
                                                        </IconButton>

                                                    </AlertDialog.Trigger>
                                                    <AlertDialog.Content maxWidth="450px">
                                                        <AlertDialog.Title>Delete {unit.description}</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Are you sure? This unit of measure will no longer exist.
                                                        </AlertDialog.Description>

                                                        <Flex gap="3" mt="4" justify="end">
                                                            <AlertDialog.Cancel>
                                                                <Button variant="soft" color="gray">
                                                                    Cancel
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
                                                                    Delete
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

        </Flex>
    )
}