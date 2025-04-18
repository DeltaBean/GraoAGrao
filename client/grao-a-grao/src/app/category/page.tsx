"use client";

import Header from "@/components/Header";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/model/items_model";
import { Flex, Card, Heading, Button, Table, AlertDialog, Skeleton, IconButton } from "@radix-ui/themes";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as categories_api from "@/api/categories_api";
import ModalCreateEditCategory from "@/components/ModalCreateEditCategory";

export default function CategoryPage() {

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for the category being edited.
    const [editCategory, setEditCategory] = useState({
        id: 0,
        description: "",
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
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
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

    const handleCreate = async (newCategory: CreateCategoryInput) => {
        try {
            const created: Category = await categories_api.createCategory(newCategory);
            setCategories((prev) => [...prev, created]);
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (toUpdateCategory: UpdateCategoryInput) => {
        try {
            const updated: Category = await categories_api.updateCategory(toUpdateCategory);
            setCategories((prev) => prev.map(category => category.id === updated.id ? updated : category));
            setEditCategory({id: 0, description: "" });
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    }

    const handleDelete = async (id: number) => {

        try {
            await categories_api.deleteCategory(id);
            setCategories((prev) => prev.filter(category => category.id !== id));
        } catch (err: any) {
            setError(err.message);
        }

    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen">

            <Header></Header>

            <Card
                id="main-flex"
                className="flex-1 w-8/10 sm:w-9/10 sm:my-12 flex-col"
                style={{ display: "flex" }}
            >

                <Flex
                    className="w-full bg-[var(--accent-4)]" p={"3"}
                    style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
                    justify={"between"}
                    align={"center"}
                >

                    <Heading size={{ sm: "8" }} weight={"bold"}>Category</Heading>

                    <Button size="3" onClick={() => handleOpenModal("create")}>Create</Button>
                </Flex>

                <Skeleton loading={loading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
                    <Table.Root>

                        <Table.Header>
                            <Table.Row align={"center"}>
                                <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>

                            {loading ? (null) : (
                                categories.map((category) => (
                                    <Table.Row key={category.id} align={"center"}>
                                        <Table.RowHeaderCell>{category.description}</Table.RowHeaderCell>
                                        <Table.Cell>
                                            <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
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
                                                        <AlertDialog.Title>Delete {category.description}</AlertDialog.Title>
                                                        <AlertDialog.Description size="2">
                                                            Are you sure? This category will no longer exist.
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
                                                                            handleDelete(category.id);
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
                <ModalCreateEditCategory isModalEdit={isModalEdit}
                    isModalCreate={isModalCreate}
                    editCategory={isModalEdit ? editCategory : undefined}
                    handleCloseModal={handleCloseModal}
                    handleCreate={handleCreate}
                    handleEdit={handleEdit}
                >
                </ModalCreateEditCategory>
            )}

        </Flex>
    )
}