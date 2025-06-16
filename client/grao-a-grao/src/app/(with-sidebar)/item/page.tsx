// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton, Badge, Tooltip, Container } from "@radix-ui/themes";
import Header from "@/components/Header";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as items_api from "@/api/items_api";
import * as categories_api from "@/api/categories_api";
import * as units_api from "@/api/units_api";
import ModalFormItem from "@/components/Form/Modal/ModalFormItem";
import { ItemModel, ItemRequest, ItemResponse, normalizeItemResponse, toItemRequest } from "@/types/item";
import { CategoryModel, CategoryResponse, normalizeCategoryResponse } from "@/types/category";
import { normalizeUnitOfMeasureResponse, UnitOfMeasureModel, UnitOfMeasureResponse } from "@/types/unit_of_measure";
import { ErrorCodes, ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/errors/api_error";
import { ItemPackagingModel } from "@/types/item_packaging";
import ModalDeleteReferencedErrorItemPackage from "@/components/Error/Delete/Item/ModalDeleteReferencedErrorItemPackage";
import ModalGenericError from "@/components/Error/ModalGenericError";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { ItemToolbar } from "./(data-table)/toolbar";

export default function ItemPage() {
  const storeId = getSelectedStore()?.id

  const [filterValue, setFilterValue] = useState("");
  const [selectedField, setSelectedField] = useState("item-description");


  // Items list and loading state.
  const [items, setItems] = useState<ItemModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);

  const [loading, setLoading] = useState(false);

  type ErrorModalState =
    | { type: "delete-referenced"; data: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingModel>; item: ItemModel }
    | { type: "generic-error"; data: GenericPostgreSQLErrorResponse }
    | { type: "none" };
  const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });

  // State for the item being edited.
  const defaultItem = {
    id: 0,
    description: '',
    ean13: '',
    is_fractionable: false,
    category: {
      id: 0,
      description: "",
    },
    unit_of_measure: {
      id: 0,
      description: "",
    }
  };
  const [editItem, setEditItem] = useState<ItemModel>(defaultItem);

  // State for editing modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [, setIsModalCreate] = useState(true);

  // Handlers for open/close modal.
  const handleCloseModal = () => setIsModalOpen(false);
  const openEdit = (item: ItemModel) => {
    setEditItem(item);
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
    fetchItems();
    fetchCategories();
    fetchUnitsOfMeasure();
  }, [storeId]);

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
      } else {
        console.error(String(err));
      }
    } finally {
      setLoading(false);
    }

  };

  // Create a new item.
  const handleCreate = async (newItem: ItemModel) => {
    try {
      console.log(newItem);
      const itemRequest: ItemRequest = toItemRequest(newItem);
      const itemResponse: ItemResponse = await items_api.createItem(itemRequest);
      const created: ItemModel = normalizeItemResponse(itemResponse);

      setItems((prev) => [...prev, created]);
      setIsModalOpen(false);

      toast.success('Item criado com sucesso!');

    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    }
  };

  const handleEdit = async (toUpdateItem: ItemModel) => {
    try {

      const itemRequest: ItemRequest = toItemRequest(toUpdateItem);
      const itemResponse: ItemResponse = await items_api.updateItem(itemRequest);
      const updated: ItemModel = normalizeItemResponse(itemResponse);

      setItems((prev) => prev.map(item => item.id === updated.id ? updated : item));
      setEditItem(defaultItem);

      setIsModalOpen(false);

      toast.success('Item editado com sucesso!');
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    }
  }

  const handleDeleteReferencedError = (err: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingModel>, item: ItemModel) => {
    setErrorModal({ type: "delete-referenced", item, data: err });
  };

  const handleDeleteGenericError = (err: GenericPostgreSQLErrorResponse) => {
    setErrorModal({ type: "generic-error", data: err });
  };

  const handleDelete = async (id: number) => {
    try {

      await items_api.deleteItem(id);
      setItems((prev) => prev.filter(item => item.id !== id));

      toast.success('Item deletado com sucesso!');
    } catch (err) {

      const errorWithData = err as { data?: { internal_code?: string } };

      if (errorWithData?.data?.internal_code === ErrorCodes.DELETE_REFERENCED_ENTITY) {
        const errorData: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingModel> = errorWithData.data as ForeignKeyDeleteReferencedErrorResponse<ItemPackagingModel>;
        handleDeleteReferencedError(errorData, items.find((it) => it.id == id) ?? defaultItem);

      } else if (errorWithData?.data?.internal_code === ErrorCodes.GENERIC_DATABASE_ERROR) {
        const genericError: GenericPostgreSQLErrorResponse = errorWithData.data as GenericPostgreSQLErrorResponse;
        handleDeleteGenericError(genericError);

      } else {
        alert("Unexpected error occurred while deleting the item.");
      }
    }
  };

  return (
    <Flex direction="column" align="center" className="min-h-screen w-full">
      <Header />
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={loading} className="h-2/5">
          <Container>
            <DataTable
              columns={getColumns(openEdit, handleDelete, filterValue, selectedField)}
              data={items}
              handleCreate={openCreate}
              title="Item de Estoque"
              createButtonToolTip="Criar novo item"
              renderToolbar={(table) => (
                <ItemToolbar
                  table={table}
                  categories={categories}
                  units={unitsOfMeasure}
                  selectedField={selectedField}
                  onSelectedFieldChange={setSelectedField}
                  filterValue={filterValue}
                  onFilterValueChange={setFilterValue}
                />
              )
              }
            />
          </Container>
        </Skeleton>
      </Flex>

      {isModalOpen && (
        <ModalFormItem
          mode={isModalEdit ? "edit" : "create"}
          editItem={isModalEdit ? editItem : undefined}
          categoryOptions={categories}
          unitOfMeasureOptions={unitsOfMeasure}
          onClose={handleCloseModal}
          onSubmitCreate={handleCreate}
          onSubmitEdit={handleEdit}
        >
        </ModalFormItem>
      )}

      {errorModal.type === "delete-referenced" && (
        <ModalDeleteReferencedErrorItemPackage
          error={errorModal.data}
          item={errorModal.item}
          onClose={() => setErrorModal({ type: "none" })}
        />
      )}

      {errorModal.type === "generic-error" && (
        <ModalGenericError
          title={"Não é possível deletar."}
          details="Este item é utilizado em outras entradas/saidas de estoque."
          onClose={() => setErrorModal({ type: "none" })}
        />
      )}
    </Flex>
  );
}
