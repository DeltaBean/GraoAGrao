// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton, Badge } from "@radix-ui/themes";
import Header from "@/components/Header";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as items_api from "@/api/items_api";
import * as stock_api from "@/api/stock_packaging_api";
import { StockPackagingModel, StockPackagingRequest, StockPackagingResponse, toStockPackagingRequest, normalizeStockPackagingResponse } from "@/model/stock_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/model/item";
import ModalFormStockPackaging from "@/components/Form/Modal/ModalFormStockPackaging";

export default function StockPackagingPage() {


    const [stockPackagings, setStockPackagings] = useState<StockPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const defaultStockPackaging = {
        id: 0,
        description: '',
        quantity: 0,
        item: {
            id: 0,
            description: '',
            category: {
                id: 0,
                description: "",
            },
        },
    }
    const [editStockPackaging, setEditStockPackaging] = useState<StockPackagingModel>(defaultStockPackaging);

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

    useEffect(() => {
        fetchStockPackaging();
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);

        try {
            const itemResponse: ItemResponse[] = await items_api.fetchItems();
            const itemModel: ItemModel[] = itemResponse.map(
                (it) => { return normalizeItemResponse(it) }
            );

            setItems(itemModel ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

    };

    const fetchStockPackaging = async () => {
        setLoading(true);

        try {
            const stockPackagingResponse: StockPackagingResponse[] = await stock_api.fetchStockPackaging();
            const stockPackagingModel: StockPackagingModel[] = stockPackagingResponse.map(
                (sp) => { return normalizeStockPackagingResponse(sp) }
            );

            setStockPackagings(stockPackagingModel ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newPackaging: StockPackagingModel) => {
        try {

            const stockPackagingRequest: StockPackagingRequest = toStockPackagingRequest(newPackaging);
            const stockPackagingResponse: StockPackagingResponse = await stock_api.createStockPackaging(stockPackagingRequest);
            const created: StockPackagingModel = normalizeStockPackagingResponse(stockPackagingResponse);

            setStockPackagings((prev) => [...prev, created]);
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (toUpdatePackaging: StockPackagingModel) => {
        try {
            const stockPackagingRequest: StockPackagingRequest = toStockPackagingRequest(toUpdatePackaging);
            const stockPackagingResponse: StockPackagingResponse = await stock_api.createStockPackaging(stockPackagingRequest);
            const updated: StockPackagingModel = normalizeStockPackagingResponse(stockPackagingResponse);

            setStockPackagings((prev) => prev.map(pack => pack.id === updated.id ? updated : pack));

            setEditStockPackaging(defaultStockPackaging);
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    }

    const handleDelete = async (id: number) => {

        try {
            await stock_api.deleteStockPackaging(id);
            setStockPackagings((prev) => prev.filter(pack => pack.id !== id));
        } catch (err: any) {
            setError(err.message);
        }

    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen">

            <Header></Header>

            <Card
                id="main-flex"
                className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col"
                style={{ display: "flex" }}
            >
                <Flex
                    className="w-full bg-[var(--accent-4)]" p={"3"}
                    style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
                    justify={"between"}
                    align={"center"}
                >

                    <Heading size={{ sm: "8" }} weight={"bold"}>Stock Packaging</Heading>

                    <Button size="3" onClick={() => handleOpenModal("create")}>Create</Button>
                </Flex>
                <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
                    <Table.Root>

                        <Table.Header>
                            <Table.Row align={"center"}>
                                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>

                            {loading ? (null) : (
                                stockPackagings.map((pack) => (
                                    <Table.Row key={pack.id} align={"center"}>
                                        <Table.RowHeaderCell>{pack.description}</Table.RowHeaderCell>
                                        <Table.Cell>{pack.item?.description} <Badge color="iris" className="ml-1" size="1" variant="surface">{pack.item?.category?.description}</Badge> </Table.Cell>
                                        <Table.Cell>{pack.quantity} <Badge color="purple" className="ml-1" size="1" variant="surface">{pack.item?.unit_of_measure?.description}</Badge> </Table.Cell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                                                <IconButton
                                                    size={"1"}
                                                    about="Edit"
                                                    variant="soft"
                                                    onClick={
                                                        (ev) => {
                                                            ev.stopPropagation();
                                                            setEditStockPackaging(pack);
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
                                                        <AlertDialog.Title>Delete {pack.description}</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Are you sure? This packaging will no longer exist.
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
                                                                            handleDelete(pack.id ?? 0);
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
                <ModalFormStockPackaging
                    mode={isModalEdit ? "edit" : "create"}
                    editStockPackaging={isModalEdit ? editStockPackaging : undefined}
                    itemOptions={items}
                    onClose={handleCloseModal}
                    onSubmitCreate={handleCreate}
                    onSubmitEdit={handleEdit}
                >
                </ModalFormStockPackaging>
            )}
        </Flex>
    );
}
