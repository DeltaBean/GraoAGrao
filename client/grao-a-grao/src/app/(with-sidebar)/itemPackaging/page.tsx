// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton, Badge, Tooltip } from "@radix-ui/themes";
import Header from "@/components/Header";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as items_api from "@/api/items_api";
import * as item_pack_api from "@/api/item_packaging_api";
import { ItemPackagingModel, ItemPackagingRequest, ItemPackagingResponse, toItemPackagingRequest, normalizeItemPackagingResponse } from "@/types/item_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import ModalFormItemPackaging from "@/components/Form/Modal/ModalFormItemPackaging";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";

export default function ItemPackagingPage() {
    const storeId = getSelectedStore()?.id

    const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const defaultItemPackaging = {
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
            is_fractionable: false,
        },
    }
    const [editItemPackaging, setEditItemPackaging] = useState<ItemPackagingModel>(defaultItemPackaging);

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
        fetchItemPackagings();
        fetchItems();
    }, [storeId]);

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

    const fetchItemPackagings = async () => {
        setLoading(true);

        try {
            const itemPackagingResponse: ItemPackagingResponse[] = await item_pack_api.fetchItemPackaging();
            const itemPackagingModel: ItemPackagingModel[] = itemPackagingResponse.map(
                (sp) => { return normalizeItemPackagingResponse(sp) }
            );

            setItemPackagings(itemPackagingModel ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newPackaging: ItemPackagingModel) => {
        try {

            const itemPackagingRequest: ItemPackagingRequest = toItemPackagingRequest(newPackaging);
            const itemPackagingResponse: ItemPackagingResponse = await item_pack_api.createItemPackaging(itemPackagingRequest);
            const created: ItemPackagingModel = normalizeItemPackagingResponse(itemPackagingResponse);

            setItemPackagings((prev) => [...prev, created]);
            setIsModalOpen(false);

            toast.success('Fracionamento criado com sucesso!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (toUpdatePackaging: ItemPackagingModel) => {
        try {
            const itemPackagingRequest: ItemPackagingRequest = toItemPackagingRequest(toUpdatePackaging);
            const itemPackagingResponse: ItemPackagingResponse = await item_pack_api.createItemPackaging(itemPackagingRequest);
            const updated: ItemPackagingModel = normalizeItemPackagingResponse(itemPackagingResponse);

            setItemPackagings((prev) => prev.map(pack => pack.id === updated.id ? updated : pack));

            setEditItemPackaging(defaultItemPackaging);
            setIsModalOpen(false);

            toast.success('Fracionamento editado com sucesso!');
        } catch (err: any) {
            setError(err.message);
        }
    }

    const handleDelete = async (id: number) => {

        try {
            await item_pack_api.deleteItemPackaging(id);
            setItemPackagings((prev) => prev.filter(pack => pack.id !== id));
        } catch (err: any) {
            setError(err.message);
        }

    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen w-full">
            <Header />
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

                    <Heading size={{ sm: "8" }} weight={"bold"}>Fracionamento</Heading>
                    <Tooltip content="Criar novo fracionamento de item de estoque">
                        <Button size="3" onClick={() => handleOpenModal("create")}>Criar</Button>
                    </Tooltip>
                </Flex>
                <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
                    <Table.Root>

                        <Table.Header>
                            <Table.Row align={"center"}>
                                <Table.ColumnHeaderCell>Descrição</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Item de Estoque</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Quantidade</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>

                            {loading ? (null) : (
                                itemPackagings.map((pack) => (
                                    <Table.Row key={pack.id} align={"center"}>
                                        <Table.RowHeaderCell>{pack.description}</Table.RowHeaderCell>
                                        <Table.Cell>{pack.item?.description} <Badge color="iris" className="ml-1" size="1" variant="surface">{pack.item?.category?.description}</Badge> </Table.Cell>
                                        <Table.Cell>{pack.quantity} <Badge color="purple" className="ml-1" size="1" variant="surface">{pack.item?.unit_of_measure?.description}</Badge> </Table.Cell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                                                <Tooltip content="Editar fracionamento de item de estoque">
                                                    <IconButton
                                                        size={"1"}
                                                        about="Edit"
                                                        variant="soft"
                                                        onClick={
                                                            (ev) => {
                                                                ev.stopPropagation();
                                                                setEditItemPackaging(pack);
                                                                handleOpenModal("edit");
                                                            }
                                                        }>
                                                        <PencilSquareIcon height="16" width="16" />
                                                    </IconButton>
                                                </Tooltip>
                                                <AlertDialog.Root>
                                                    <Tooltip content="Excluir fracionamento de item de estoque">
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
                                                        <AlertDialog.Title>Deletar {pack.description}</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Tem certeza? Este fracionamento será deletado permanentemente.
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
                                                                            handleDelete(pack.id ?? 0);
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
            {
                isModalOpen && (
                    <ModalFormItemPackaging
                        mode={isModalEdit ? "edit" : "create"}
                        editItemPackaging={isModalEdit ? editItemPackaging : undefined}
                        itemOptions={items}
                        onClose={handleCloseModal}
                        onSubmitCreate={handleCreate}
                        onSubmitEdit={handleEdit}
                    >
                    </ModalFormItemPackaging>
                )
            }
        </Flex >
    );
}
