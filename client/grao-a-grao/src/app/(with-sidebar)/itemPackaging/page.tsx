// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, Skeleton, Container } from "@radix-ui/themes";
import Header from "@/components/Header";
import * as categories_api from "@/api/categories_api";
import * as units_api from "@/api/units_api";
import { useEffect, useState } from "react";
import * as items_api from "@/api/items_api";
import * as item_pack_api from "@/api/item_packaging_api";
import { ItemPackagingModel, ItemPackagingRequest, ItemPackagingResponse, toItemPackagingRequest, normalizeItemPackagingResponse } from "@/types/item_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import ModalFormItemPackaging from "@/components/Form/Modal/ModalFormItemPackaging";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { ItemPackagingToolbar } from "./(data-table)/toolbar";
import { normalizeUnitOfMeasureResponse, UnitOfMeasureModel, UnitOfMeasureResponse } from "@/types/unit_of_measure";
import { CategoryModel, CategoryResponse, normalizeCategoryResponse } from "@/types/category";

export default function ItemPackagingPage() {
    const storeId = getSelectedStore()?.id

    const [filterValue, setFilterValue] = useState("");
    const [selectedField, setSelectedField] = useState("description");

    const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);

    const [loading, setLoading] = useState(false);
    const [, setError] = useState<string | null>(null);

    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);

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
    const [, setIsModalCreate] = useState(true);

    // Handlers for open/close modal.
    const handleCloseModal = () => setIsModalOpen(false);
    const openEdit = (pack: ItemPackagingModel) => {
        setEditItemPackaging(pack);
        setIsModalEdit(true);
        setIsModalCreate(false);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setIsModalEdit(false);
        setIsModalCreate(true);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchItemPackagings();
        fetchItems();
        fetchUnitsOfMeasure();
        fetchCategories();
    }, [storeId]);

    const fetchItems = async () => {
        setLoading(true);

        try {
            const itemResponse: ItemResponse[] = await items_api.fetchItems();
            const itemModel: ItemModel[] = itemResponse.map(
                (it) => { return normalizeItemResponse(it) }
            );

            setItems(itemModel ?? []);
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }
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
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    const fetchUnitsOfMeasure = async () => {
        setLoading(true);

        try {
            const unitOfMeasureResponse: UnitOfMeasureResponse[] = await units_api.fetchUnits();
            const unitOfMeasureModel: UnitOfMeasureModel[] = unitOfMeasureResponse.map(
                (unit) => { return normalizeUnitOfMeasureResponse(unit) }
            );

            setUnitsOfMeasure(unitOfMeasureModel ?? []);

        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    const fetchCategories = async () => {
        setLoading(true);

        try {
            const categoryResponse: CategoryResponse[] = await categories_api.fetchCategories();
            const categoryModel: CategoryModel[] = categoryResponse.map(
                (cat) => { return normalizeCategoryResponse(cat) }
            );

            setCategories(categoryModel ?? []);

        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(String(err));
            }
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
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }
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
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }
        }
    }

    const handleDelete = async (id: number) => {

        try {
            await item_pack_api.deleteItemPackaging(id);
            setItemPackagings((prev) => prev.filter(pack => pack.id !== id));
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
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
                            data={itemPackagings}
                            handleCreate={openCreate}
                            title="Fracionamento"
                            createButtonToolTip="Criar novo fracionamento"
                            renderToolbar={(table) => (
                                <ItemPackagingToolbar
                                    table={table}
                                    categories={categories}
                                    units={unitsOfMeasure}
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
            {
                isModalOpen && (
                    <ModalFormItemPackaging
                        mode={isModalEdit ? "edit" : "create"}
                        editItemPackaging={isModalEdit ? editItemPackaging : undefined}
                        itemOptions={items.filter((it) => it.is_fractionable)}
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
