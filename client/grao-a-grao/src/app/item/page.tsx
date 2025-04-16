// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Flex, Text, Table, Skeleton, Card, Box, Heading, Button, TextField, Select } from "@radix-ui/themes";
import Header from "@/components/Header";
import { TagIcon, QrCodeIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { Category, Item } from "@/model/items_model";
import * as api from "@/api/items_api";
export default function ItemPage() {

  // Items list and loading state.
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for new item form.
  const [newItem, setNewItem] = useState({
    item_description: '',
    ean13: '',
    category: {
      id: 0,
      description: "",
    },
  });

  // State for the item being edited.
  const [editItem, setEditItem] = useState<Item | null>(null);

  // State for editing modal
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isModalEdit, setIsModalEdit] = useState(false);
  const [isModalCreate, setIsModalCreate] = useState(true);

  // Handlers for open/close modal.
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Fetch items when the component mounts.
  useEffect(() => {
    fetchItems();
    fetchItemsCategories();
  }, []);

  const fetchItemsCategories = async () => {
    setLoading(true);

    try {
      const data = await api.fetchCategories()
      setCategories(data);

      if (data.length > 0)
        setNewItem((prev) => {
          return {
            ...prev, category:
            {
              id: data[0].id,
              description: data[0].description
            }
          }
        });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchItems = async () => {
    setLoading(true);

    try {
      const data = await api.fetchItems()
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

  };

  // Create a new item.
  const handleCreate = async () => {
    try {
      const created: Item = await api.createItem(newItem);
      setItems((prev) => [...prev, created]);
      setNewItem({ item_description: '', ean13: '', category: { id: 0, description: "" } });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Flex direction={"column"} justify={"center"} align={"center"} className="min-h-screen">

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

          <Button>Create</Button>
        </Flex>
        <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
          <Table.Root>

            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>EAN-13</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
                <Table.Cell>danilo@example.com</Table.Cell>
                <Table.Cell>Developer</Table.Cell>
                <Table.Cell><Button>Edit</Button></Table.Cell>
              </Table.Row>


            </Table.Body>
          </Table.Root>
        </Skeleton>
      </Card>

      {/* Modal Overlay for Create/Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--color-overlay)]">
          <Flex
            id="create-form"
            direction={"column"}
            align={"center"}
            justify={"center"}
            className="w-full h-full">
            <Card className="sm:w-4/10 sm:h-4/10 flex-col">
              <Box p={{ sm: "3" }} mb={{ sm: "2" }}>
                {isModalEdit ? (<Heading>Editar</Heading>) : isModalCreate ? (<Heading>Create</Heading>) : undefined}
              </Box>

              <Box className="sm:pl-6 sm:pr-6 sm:pt-2">
                <Flex direction={"column"} gap="4">
                  
                  <Text as="label" size={"3"}>
                    <Skeleton loading={false}>
                      <div className="mb-2">EAN-13</div>
                    </Skeleton>
                    <Skeleton loading={false}>
                      <TextField.Root size="3" placeholder="EAN-13">
                        <TextField.Slot>
                          <QrCodeIcon height="16" width="16" />
                        </TextField.Slot>
                      </TextField.Root>
                    </Skeleton>
                  </Text>

                  <Text as="label" size={"3"}>
                    <Skeleton loading={false}>
                      <div className="mb-2">Description</div>
                    </Skeleton>
                    <Skeleton loading={false}>
                      <TextField.Root size="3" placeholder="Description">
                      </TextField.Root>
                    </Skeleton>
                  </Text>

                  <Text as="label" size={"3"}>
                    <Skeleton loading={false}>
                      <div className="mb-2">Category</div>
                    </Skeleton>
                    <Skeleton loading={false}>
                      <Select.Root
                        value={String(newItem.category.id)}
                        onValueChange={(value) => {
                          const selectedCategory = categories.find((cat) => String(cat.id) === value);
                          if (selectedCategory) {
                            setNewItem((prev) => ({
                              ...prev,
                              category: {
                                id: selectedCategory.id,
                                description: selectedCategory.description,
                              },
                            }));
                          }
                        }}
                      >
                        <Select.Trigger>
                          <Flex as="span" align="center" gap="2">
                            <TagIcon height="16" width="16" />
                            {newItem.category.description}
                          </Flex>
                        </Select.Trigger>
                        <Select.Content position="popper">
                          {categories.map((category) => (
                            <Select.Item
                              key={category.id}
                              value={String(category.id)}
                            >
                              {category.description}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Skeleton>
                  </Text>
                </Flex>
              </Box>
            </Card>
          </Flex>
        </div>
      )};
    </Flex>
  );
}
