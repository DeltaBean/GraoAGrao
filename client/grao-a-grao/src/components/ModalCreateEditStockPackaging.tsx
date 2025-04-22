"use client";

import { Box, Card, Flex, Heading, IconButton, Text, TextField, Skeleton, Button, Select } from "@radix-ui/themes";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { CreateStockPackaging, UpdateStockPackaging } from "@/model/stock_model";
import { ItemOption } from "@/model/items_model";
import { TagIcon } from "@heroicons/react/16/solid";

export type ModalCreateEditStockPackagingProps = {
    isModalEdit: boolean;
    isModalCreate: boolean;
    editPackage?: UpdateStockPackaging;
    items: ItemOption[];
    handleCloseModal: () => void;
    handleCreate: (newCategory: CreateStockPackaging) => void;
    handleEdit: (toUpdateCategory: UpdateStockPackaging) => void;
}
export default function ModalCreateEditStockPackaging({
    isModalEdit,
    isModalCreate,
    editPackage,
    items,
    handleCloseModal,
    handleCreate,
    handleEdit
}: ModalCreateEditStockPackagingProps) {

    const [description, setDescription] = useState<string>(editPackage ? editPackage.description : "");
    const [quantity, setQuantity] = useState<number>(editPackage ? editPackage.quantity : 0);
    const [item, setItem] = useState<ItemOption>(editPackage ? editPackage.item : items[0]);

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
                                    <div className="mb-2">Description</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <TextField.Root size="3" placeholder="Description" value={description} onChange={(ev) => setDescription(ev.target.value)}>
                                    </TextField.Root>
                                </Skeleton>
                            </Text>

                            <Text as="label" size={"3"}>
                                <Skeleton loading={false}>
                                    <div className="mb-2">Item</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <Select.Root
                                        value={String(item.item_id)}
                                        onValueChange={(value) => {
                                            const selectedItem = items.find((i) => String(i.item_id) === value);
                                            if (selectedItem) {
                                                setItem(selectedItem)
                                            }
                                        }}
                                    >
                                        <Select.Trigger>
                                            <Flex as="span" align="center" gap="2">
                                                <TagIcon height="16" width="16" />
                                                {item.item_description}
                                            </Flex>
                                        </Select.Trigger>
                                        <Select.Content position="popper">
                                            {items.map((item) => (
                                                <Select.Item
                                                    key={item.item_id}
                                                    value={String(item.item_description)}
                                                >
                                                    {item.item_description}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Root>
                                </Skeleton>
                            </Text>

                            <Text as="label" size={"3"}>
                                <Skeleton loading={false}>
                                    <div className="mb-2">Quantity</div>
                                </Skeleton>
                                <Skeleton loading={false}>
                                    <TextField.Root type="number" size="3" placeholder="Quantity" value={quantity} onChange={(ev) => setQuantity(parseFloat(ev.target.value))}>
                                    </TextField.Root>
                                </Skeleton>
                            </Text>

                            <Flex className="sm:mt-6 mb-4 sm:mb-0" justify={"start"} align={"center"}>
                                {isModalEdit ?
                                    (<Button size={"3"} onClick={
                                        (ev) => {
                                            ev.preventDefault();
                                            handleEdit({ id: editPackage!.id, description, quantity, item });
                                        }}>Editar</Button>)
                                    : isModalCreate ?
                                        (<Button size={"3"} onClick={
                                            (ev) => {
                                                ev.preventDefault();
                                                handleCreate({ description, quantity, item });
                                            }}>Create</Button>)
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