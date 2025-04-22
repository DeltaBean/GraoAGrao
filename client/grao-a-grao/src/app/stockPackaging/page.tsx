// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton } from "@radix-ui/themes";
import Header from "@/components/Header";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { Item, Category, ItemOption } from "@/model/items_model";
import { StockPackaging, CreateStockPackaging, UpdateStockPackaging } from "@/model/stock_model";
import * as items_api from "@/api/items_api";
import * as categories_api from "@/api/categories_api";
import * as stock_api from "@/api/stock_packaging_api";
import ModalCreateEditStockPackaging from "@/components/ModalCreateEditStockPackaging";

export default function StockPackagingPage() {


    const [stockPackagings, setStockPackagings] = useState<StockPackaging[]>([]);
    const [stockItems, setStockItems] = useState<ItemOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [editStockPackaging, setEditStockPackaging] = useState({
        id: 0,
        description: '',
        quantity: 0,
        item: {
            item_id: 0,
            item_description: '',
            category: {
                id: 0,
                description: "",
            },
        },
    });

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
            const data: Item[] = await items_api.fetchItems();
            setStockItems(data.map(item => ({
                item_id: item.item_id,
                item_description: item.item_description,
            })) ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

    };

    const fetchStockPackaging = async () => {
        setLoading(true);

        try {
            const data: StockPackaging[] = await stock_api.fetchStockPackaging();
            setStockPackagings(data ?? []);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newPackaging: CreateStockPackaging) => {
        try {
            const created: StockPackaging = await stock_api.createStockPackaging(newPackaging);
            setStockPackagings((prev) => [...prev, created]);
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (toUpdatePackaging: UpdateStockPackaging) => {
        try {
            const updated: StockPackaging = await stock_api.updateStockPackaging(toUpdatePackaging);
            setStockPackagings((prev) => prev.map(pack => pack.id === updated.id ? updated : pack));
            setEditStockPackaging({
                id: 0,
                description: '',
                quantity: 0,
                item: {
                    item_id: 0,
                    item_description: '',
                    category: {
                        id: 0,
                        description: "",
                    },
                },
            });
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
                                        <Table.Cell>{pack.item.item_description}</Table.Cell>
                                        <Table.Cell>{pack.quantity}</Table.Cell>
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
                                                                            handleDelete(pack.id);
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
                <ModalCreateEditStockPackaging isModalEdit={isModalEdit}
                    isModalCreate={isModalCreate}
                    editPackage={isModalEdit ? editStockPackaging : undefined}
                    handleCloseModal={handleCloseModal}
                    handleCreate={handleCreate}
                    handleEdit={handleEdit}
                    items={stockItems}>
                </ModalCreateEditStockPackaging>
            )}
        </Flex>
    );
}
