// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, AlertDialog, Table, Skeleton, Card, Heading, Button, IconButton } from "@radix-ui/themes";
import Header from "@/components/Header";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { Category, Item, CreateItemInput, UpdateItemInput } from "@/model/items_model";
import * as items_api from "@/api/items_api";
import * as categories_api from "@/api/categories_api";
import ModalCreateEditItem from "@/components/ModalCreateEditItem";

export default function ItemPage() {

  // Items list and loading state.
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the item being edited.
  const [editItem, setEditItem] = useState({
    item_id: 0,
    item_description: '',
    ean13: '',
    category: {
      id: 0,
      description: "",
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

  // Fetch items when the component mounts.
  useEffect(() => {
    fetchItems();
    fetchItemsCategories();
  }, []);

  const fetchItemsCategories = async () => {
    setLoading(true);

    try {
      const data = await categories_api.fetchCategories()
      setCategories(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchItems = async () => {
    setLoading(true);

    try {
      const data = await items_api.fetchItems();
      setItems(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

  };

  // Create a new item.
  const handleCreate = async (newItem: CreateItemInput) => {
    try {
      const created: Item = await items_api.createItem(newItem);
      setItems((prev) => [...prev, created]);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = async (toUpdateItem: UpdateItemInput) => {
    try {
      const updated: Item = await items_api.updateItem(toUpdateItem);
      setItems((prev) => prev.map(item => item.item_id === updated.item_id ? updated : item));
      setEditItem({ item_id: 0, item_description: '', ean13: '', category: { id: 0, description: "" } });
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const handleDelete = async (id: number) => {

    try {
      await items_api.deleteItem(id);
      setItems((prev) => prev.filter(item => item.item_id !== id));
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

          <Heading size={{ sm: "8" }} weight={"bold"}>Stock Item</Heading>

          <Button size="3" onClick={() => handleOpenModal("create")}>Create</Button>
        </Flex>
        <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
          <Table.Root>

            <Table.Header>
              <Table.Row align={"center"}>
                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>EAN-13</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {loading ? (null) : (
                items.map((item) => (
                  <Table.Row key={item.item_id} align={"center"}>
                    <Table.RowHeaderCell>{item.item_description}</Table.RowHeaderCell>
                    <Table.Cell>{item.category.description}</Table.Cell>
                    <Table.Cell>{item.ean13}</Table.Cell>
                    <Table.Cell>
                      <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
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
                            <AlertDialog.Title>Delete {item.item_description}</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              Are you sure? This item will no longer exist.
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
                                      handleDelete(item.item_id);
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
        <ModalCreateEditItem isModalEdit={isModalEdit}
          isModalCreate={isModalCreate}
          categories={categories}
          editItem={isModalEdit ? editItem : undefined}
          handleCloseModal={handleCloseModal}
          handleCreate={handleCreate}
          handleEdit={handleEdit}
        >
        </ModalCreateEditItem>
      )}
    </Flex>
  );
}
