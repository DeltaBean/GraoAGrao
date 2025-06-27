"use client";

import { Flex, Skeleton, Container } from "@radix-ui/themes";
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
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { CategoryToolbar } from "./(data-table)/toolbar";

export default function CategoryPage() {

    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [loading, setLoading] = useState(false);
    const storeId = getSelectedStore()?.id
    const [filterValue, setFilterValue] = useState("");
    const [selectedField, setSelectedField] = useState("description");

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

    // openEdit now takes the category you clicked on,
    // stores it in state, then opens in "edit" mode.
    const openEdit = (category: CategoryModel) => {
        setEditCategory(category);      
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
            <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
                <Skeleton loading={loading} className="h-2/5">
                    <Container>
                        <DataTable
                            columns={getColumns(openEdit, handleDelete, filterValue, selectedField)}
                            data={categories}
                            handleCreate={openCreate}
                            title="Categoria"
                            createButtonToolTip="Criar nova categoria"
                            renderToolbar={(table) => (
                                <CategoryToolbar
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