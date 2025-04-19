"use client";

import { UnitOfMeasure, CreateUnitOfMeasureInput, UpdateUnitOfMeasureInput } from "@/model/items_model";
import { Box, Card, Flex, Heading, IconButton, Text, TextField, Skeleton, Button } from "@radix-ui/themes";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";

export type ModalCreateEditCategoryProps = {
    isModalEdit: boolean;
    isModalCreate: boolean;
    editUnit?: UnitOfMeasure;
    handleCloseModal: () => void;
    handleCreate: (newCategory: CreateUnitOfMeasureInput) => void;
    handleEdit: (toUpdateCategory: UpdateUnitOfMeasureInput) => void;
}
export default function ModalCreateEditCategory({
    isModalEdit,
    isModalCreate,
    editUnit,
    handleCloseModal,
    handleCreate,
    handleEdit
}: ModalCreateEditCategoryProps) {

    const [description, setDescription] = useState<string>(editUnit ? editUnit.description : "");

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

                            <Flex className="sm:mt-6 mb-4 sm:mb-0" justify={"start"} align={"center"}>
                                {isModalEdit ?
                                    (<Button size={"3"} onClick={
                                        (ev) => {
                                            ev.preventDefault();
                                            handleEdit({ id: editUnit!.id, description });
                                        }}>Editar</Button>)
                                    : isModalCreate ? 
                                    (<Button size={"3"} onClick={
                                        (ev) => {
                                            ev.preventDefault();
                                            handleCreate({ description });
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