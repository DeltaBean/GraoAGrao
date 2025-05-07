// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton, Badge, Tooltip } from "@radix-ui/themes";
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
import { ErrorCodes, ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/types/api_error";
import { ItemPackagingResponse } from "@/types/item_packaging";
import ModalDeleteReferencedErrorItemPackage from "@/components/Error/Delete/Item/ModalDeleteReferencedErrorItemPackage";
import ModalGenericError from "@/components/Error/ModalGenericError";

export default function ItemPage() {

  // Items list and loading state.
  const [items, setItems] = useState<ItemModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);

  const [loading, setLoading] = useState(false);

  type ErrorModalState =
    | { type: "delete-referenced"; data: ForeignKeyDeleteReferencedErrorResponse<any>; item: ItemModel }
    | { type: "generic-error"; data: GenericPostgreSQLErrorResponse }
    | { type: "none" };
  const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });

  // State for the item being edited.
  const defaultItem = {
    id: 0,
    description: '',
    ean13: '',
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
  const [_, setIsModalCreate] = useState(true);

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
    fetchItems();
    fetchCategories();
    fetchUnitsOfMeasure();
  }, []);

  const fetchUnitsOfMeasure = async () => {
    setLoading(true);

    try {
      const unitOfMeasureResponse: UnitOfMeasureResponse[] = await units_api.fetchUnits();
      const unitOfMeasureModel: UnitOfMeasureModel[] = unitOfMeasureResponse.map(
        (unit) => { return normalizeUnitOfMeasureResponse(unit) }
      );

      setUnitsOfMeasure(unitOfMeasureModel ?? []);

    } catch (err: any) {
      console.error(err.message);
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

    } catch (err: any) {
      console.error(err.message);
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
    } catch (err: any) {
      console.error(err.message);
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
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleEdit = async (toUpdateItem: ItemModel) => {
    try {

      const itemRequest: ItemRequest = toItemRequest(toUpdateItem);
      const itemResponse: ItemResponse = await items_api.createItem(itemRequest);
      const updated: ItemModel = normalizeItemResponse(itemResponse);

      setItems((prev) => prev.map(item => item.id === updated.id ? updated : item));
      setEditItem(defaultItem);

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err.message);
    }
  }

  const handleDeleteReferencedError = (err: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingResponse>, item: ItemModel) => {
    setErrorModal({ type: "delete-referenced", item, data: err });
  };

  const handleDeleteGenericError = (err: GenericPostgreSQLErrorResponse) => {
    setErrorModal({ type: "generic-error", data: err });
  };

  const handleDelete = async (id: number) => {
    try {

      await items_api.deleteItem(id);
      setItems((prev) => prev.filter(item => item.id !== id));

    } catch (err: any) {

      if (err?.data?.internal_code === ErrorCodes.DELETE_REFERENCED_ENTITY) {

        const errorData: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingResponse> = err.data;
        handleDeleteReferencedError(errorData, items.find((it) => it.id == id) ?? defaultItem);

      } else if (err?.data?.internal_code === ErrorCodes.GENERIC_DATABASE_ERROR) {

        const genericError: GenericPostgreSQLErrorResponse = err.data;
        handleDeleteGenericError(genericError);

      } else {
        alert("Unexpected error occurred while deleting the item.");
      }
    }
  };

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

          <Heading size={{ sm: "8" }} weight={"bold"}>Item de Estoque</Heading>
          <Tooltip content="Criar novo item de estoque">
            <Button size="3" onClick={() => handleOpenModal("create")}>Criar</Button>
          </Tooltip>
        </Flex>
        <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
          <Table.Root>

            <Table.Header>
              <Table.Row align={"center"}>
                <Table.ColumnHeaderCell>Descrição</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Categoria</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Unidade de Medida</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>EAN-13</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {loading ? (null) : (
                items.map((item) => (
                  <Table.Row key={item.id} align={"center"}>
                    <Table.RowHeaderCell>{item.description}</Table.RowHeaderCell>
                    <Table.Cell>{item.category ? <Badge color="iris" size="1" variant="surface">{item.category.description}</Badge> : undefined}</Table.Cell>
                    <Table.Cell>{item.unit_of_measure ? <Badge color="purple" size="1" variant="surface">{item.unit_of_measure.description}</Badge> : undefined}</Table.Cell>
                    <Table.Cell>{item.ean13}</Table.Cell>
                    <Table.Cell>
                      <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                        <Tooltip content="Editar item de estoque">
                          <IconButton
                            size={"1"}
                            about="Edit"
                            variant="soft"
                            onClick={
                              (ev) => {
                                ev.stopPropagation();
                                setEditItem(item);
                                handleOpenModal("edit");
                              }
                            }>
                            <PencilSquareIcon height="16" width="16" />
                          </IconButton>
                        </Tooltip>

                        <AlertDialog.Root>
                          <Tooltip content="Excluir item de estoque">
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
                            <AlertDialog.Title>Deletar {item.description}</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              Tem certeza? Este item será deletado permanentemente.
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
                                      handleDelete(item.id ? item.id : 0);
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
          error={errorModal.data}
          onClose={() => setErrorModal({ type: "none" })}
        />
      )}
    </Flex>
  );
}
