"use client";

import { Category, CreateItemInput, Item, UpdateItemInput } from "@/model/items_model";
import { Box, Card, Flex, Heading, IconButton, Text, Callout, TextField, Select, Skeleton, Button } from "@radix-ui/themes";
import { useState } from "react";
import { TagIcon, QrCodeIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/16/solid";

export type ModalCreateEditItemProps = {
    isModalEdit: boolean;
    isModalCreate: boolean;
    categories: Category[];
    editItem?: Item;
    handleCloseModal: () => void;
    handleCreate: (newItem: CreateItemInput) => void;
    handleEdit: (toUpdateItem: UpdateItemInput) => void;
}
export default function ModalCreateEditItem({
    isModalEdit,
    isModalCreate,
    categories,
    editItem,
    handleCloseModal,
    handleCreate,
    handleEdit
}: ModalCreateEditItemProps) {

    const [ean13Error, setEan13Error] = useState<string | null>(null);
    const [description, setDescription] = useState<string>(editItem ? editItem.item_description : "");
    const [ean13, setEan13] = useState<string>(editItem ? editItem.ean13 : "");
    const [category, setCategory] = useState<Category>(editItem ? editItem.category : categories[0]);

    const handleEan13Change = (value: string) => {
        if (value.length != 13) {
            setEan13Error("EAN-13 must be 13 digits long.");
        } else if (!/^\d+$/.test(value)) {
            setEan13Error("EAN-13 must contain only digits.");
        } else {
            setEan13Error(null);
        }
        setEan13(value);
    }
    return (
        <div className="fixed inset-0 bg-[var(--color-overlay)]">
            <Flex
                id="create-form"
                direction={"column"}
                align={"center"}
                justify={"center"}
                className="w-full h-full">
                <Card className="sm:w-4/10 sm:h-4/10 flex-col">

                    <Flex justify={"end"}>
                        <IconButton size={"1"} color="red" variant="soft" onClick={handleCloseModal}>
                            <XMarkIcon height="16" width="16" />
                        </IconButton>
                    </Flex>
                    <Box p={{ sm: "3" }} mb={{ sm: "2" }}>
                        {isModalEdit ? (<Heading>Editar</Heading>) : isModalCreate ? (<Heading>Create</Heading>) : undefined}
                    </Box>

                    <Box className="sm:pl-6 sm:pr-6 sm:pt-2 h-full">
                        <Flex className="h-full" direction={"column"} gap="4">

                            <Text as="label" size={"3"}>
                                <Skeleton loading={false}>
                                    <div className="mb-2">EAN-13</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <TextField.Root size="3" placeholder="EAN-13" value={ean13} onChange={(ev) => handleEan13Change(ev.target.value)}>
                                        <TextField.Slot>
                                            <QrCodeIcon height="16" width="16" />
                                        </TextField.Slot>
                                    </TextField.Root>

                                    <Callout.Root size={"1"} color="red" hidden={ean13Error === null} className="mt-2">
                                        <Callout.Icon>
                                            <InformationCircleIcon height={"16"} width={"16"} />
                                        </Callout.Icon>
                                        <Callout.Text>
                                            {ean13Error}
                                        </Callout.Text>
                                    </Callout.Root>

                                </Skeleton>
                            </Text>

                            <Text as="label" size={"3"}>
                                <Skeleton loading={false}>
                                    <div className="mb-2">Description</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <TextField.Root size="3" placeholder="Description" value={description} onChange={(ev) => setDescription(ev.target.value)}>
                                    </TextField.Root>
                                </Skeleton>
                            </Text>

                            <Text as="label" size={"3"}>
                                <Skeleton loading={false}>
                                    <div className="mb-2">Category</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <Select.Root
                                        value={String(category.id)}
                                        onValueChange={(value) => {
                                            const selectedCategory = categories.find((cat) => String(cat.id) === value);
                                            if (selectedCategory) {
                                                setCategory(selectedCategory)
                                            }
                                        }}
                                    >
                                        <Select.Trigger>
                                            <Flex as="span" align="center" gap="2">
                                                <TagIcon height="16" width="16" />
                                                {category.description}
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
                            <Flex className="sm:mt-6 mb-4 sm:mb-0" justify={"start"} align={"center"}>
                                {isModalEdit ?
                                    (<Button size={"3"} onClick={
                                        (ev) => {
                                            ev.stopPropagation();
                                            handleEdit({
                                                item_id: editItem!.item_id,
                                                ean13: ean13,
                                                item_description: description,
                                                category: category
                                            })
                                        }}>Editar</Button>)
                                    : isModalCreate ? (<Button size={"3"} onClick={
                                        (ev) => {
                                            ev.stopPropagation();
                                            handleCreate({
                                                ean13: ean13,
                                                item_description:
                                                    description,
                                                category: category
                                            })
                                        }}>Create</Button>
                                    )
                                        : undefined
                                }
                            </Flex>
                        </Flex>
                    </Box>
                </Card>
            </Flex>
        </div>
    );
}