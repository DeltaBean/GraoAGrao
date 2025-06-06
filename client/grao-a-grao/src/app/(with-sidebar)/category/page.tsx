"use client";

import { Flex, Card, Heading, Button, Table, AlertDialog, Skeleton, IconButton, Tooltip } from "@radix-ui/themes";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

import * as categories_api from "@/api/categories_api";
import Header from "@/components/Header";
import ModalFormCategory from "@/components/Form/Modal/ModalFormCategory";
import { CategoryModel, CategoryRequest, CategoryResponse, normalizeCategoryResponse, toCategoryRequest } from "@/types/category";
import { ErrorCodes, ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/errors/api_error";
import { ItemModel } from "@/types/item";
import ModalGenericError from "@/components/Error/ModalGenericError";
import ModalDeleteReferencedErrorItem from "@/components/Error/Delete/Category/ModalDeleteReferencedErrorItem";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";

export default function CategoryPage() {

    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [loading, setLoading] = useState(false);
    const storeId = getSelectedStore()?.id

    const [, setError] = useState<string | null>(null);
    type ErrorModalState =
        | { type: "delete-referenced"; data: ForeignKeyDeleteReferencedErrorResponse<ItemModel>; category: CategoryModel }
        | { type: "generic-error"; data: GenericPostgreSQLErrorResponse }
        | { type: "none" };
    const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });


    // State for the category being edited.
    const defaultCategory: CategoryModel = {
        id: 0,
        description: "",
    };
    const [editCategory, setEditCategory] = useState<CategoryModel>(defaultCategory);

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
        fetchCategories();
    }, [storeId]);

    const fetchCategories = async () => {
        setLoading(true);

        try {

            const categoryResponse: CategoryResponse[] = await categories_api.fetchCategories()
            const categoryModel: CategoryModel[] = categoryResponse.map((cat) => normalizeCategoryResponse(cat));

            setCategories(categoryModel);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (newCategory: CategoryModel) => {
        try {

            const categoryRequest: CategoryRequest = toCategoryRequest(newCategory);
            const categoryResponse: CategoryResponse = await categories_api.createCategory(categoryRequest);
            const created = normalizeCategoryResponse(categoryResponse);

            setCategories((prev) => [...prev, created]);
            setIsModalOpen(false);

            toast.success('Categoria criada com sucesso!');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    };

    const handleEdit = async (toUpdateCategory: CategoryModel) => {
        try {
            const categoryRequest: CategoryRequest = toCategoryRequest(toUpdateCategory);
            const categoryResponse: CategoryResponse = await categories_api.updateCategory(categoryRequest);
            const updated: CategoryModel = normalizeCategoryResponse(categoryResponse);

            setCategories((prev) => prev.map(category => category.id === updated.id ? updated : category));
            setEditCategory(defaultCategory);
            setIsModalOpen(false);

            toast.success('Categoria editada com sucesso!');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    }

    const handleDeleteReferencedError = (err: ForeignKeyDeleteReferencedErrorResponse<ItemModel>, category: CategoryModel) => {
        setErrorModal({ type: "delete-referenced", category, data: err });
    };

    const handleDeleteGenericError = (err: GenericPostgreSQLErrorResponse) => {
        setErrorModal({ type: "generic-error", data: err });
    };

    const handleDelete = async (id: number) => {

        try {

            await categories_api.deleteCategory(id);
            setCategories((prev) => prev.filter(category => category.id !== id));

        } catch (err) {
            const errorWithData = err as { data?: { internal_code?: string } };

            if (errorWithData?.data?.internal_code === ErrorCodes.DELETE_REFERENCED_ENTITY) {

                const errorData: ForeignKeyDeleteReferencedErrorResponse<ItemModel> = errorWithData.data as ForeignKeyDeleteReferencedErrorResponse<ItemModel>;
                handleDeleteReferencedError(errorData, categories.find((cat) => cat.id == id) ?? defaultCategory);

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

                    <Heading size={{ sm: "8" }} weight={"bold"}>Categoria</Heading>
                    <Tooltip content="Criar nova categoria">
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
                                categories.map((category) => (
                                    <Table.Row key={category.id} align={"center"}>
                                        <Table.RowHeaderCell>{category.description}</Table.RowHeaderCell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                                                <Tooltip content="Editar categoria">
                                                    <IconButton
                                                        size={"1"}
                                                        about="Edit"
                                                        variant="soft"
                                                        onClick={
                                                            (ev) => {
                                                                ev.stopPropagation();
                                                                setEditCategory(category);
                                                                handleOpenModal("edit");
                                                            }
                                                        }>
                                                        <PencilSquareIcon height="16" width="16" />
                                                    </IconButton>
                                                </Tooltip>
                                                <AlertDialog.Root>
                                                    <Tooltip content="Excluir categoria">
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
                                                        <AlertDialog.Title>Deletar {category.description}</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Tem certeza? Esta categoria será deletada permanentemente
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
                                                                            if (category.id)
                                                                                handleDelete(category.id);
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
                <ModalFormCategory
                    mode={isModalCreate ? "create" : "edit"}
                    editCategory={isModalEdit ? editCategory : undefined}
                    onClose={handleCloseModal}
                    onSubmitCreate={handleCreate}
                    onSubmitEdit={handleEdit}
                >
                </ModalFormCategory>
            )}

            {errorModal.type === "delete-referenced" && (
                <ModalDeleteReferencedErrorItem
                    error={errorModal.data}
                    category={errorModal.category}
                    onClose={() => setErrorModal({ type: "none" })}
                />
            )}

            {errorModal.type === "generic-error" && (
                <ModalGenericError
                    title={"Não é possível deletar."}
                    details="Esta categoria é utilizada em outros itens de estoque."
                    onClose={() => setErrorModal({ type: "none" })}
                />
            )}
        </Flex>
    )
}