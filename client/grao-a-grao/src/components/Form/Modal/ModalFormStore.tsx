"use client";

import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Text, Skeleton, Button, Callout } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CreateStoreSchema,
    CreateStoreData,
    UpdateStoreSchema,
    UpdateStoreData,
} from "@/schemas/store_schema";
import { useEffect } from "react";
import { StoreModel } from "@/types/store";
import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

type Props = {
    mode: "create" | "edit";
    initial?: StoreModel;
    onClose: () => void;
    onCreate: (data: CreateStoreData) => void;
    onEdit: (data: UpdateStoreData) => void;
};

export default function ModalFormStore({
    mode,
    initial,
    onClose,
    onCreate,
    onEdit,
}: Props) {
    // choose schema based on mode
    const isEdit = mode === "edit";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateStoreData | UpdateStoreData>({
        resolver: zodResolver(isEdit ? UpdateStoreSchema : CreateStoreSchema),
        defaultValues: isEdit
            ? { store_id: initial?.id ?? 0, name: initial?.name ?? "" }
            : { name: "" },
    });

    // whenever initial changes (i.e. on edit open), reset form
    // so that the fields populate correctly
    useEffect(() => {
        reset(
            isEdit
                ? { store_id: initial?.id ?? 0, name: initial?.name ?? "" }
                : { name: "" }
        );
    }, [initial, isEdit, reset]);

    const onSubmit = (data: CreateStoreData | UpdateStoreData) => {
        if (isEdit) {
            onEdit(data as UpdateStoreData);
        } else {
            onCreate(data as CreateStoreData);
        }
    };

    return (
        <ModalFormShell
            title="Loja"
            mode={mode}
            onClose={onClose}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Text as="label" size="3" className="mb-1">
                Nome
            </Text>
            <TextField.Root
                size="3"
                placeholder="Nome da loja"
                {...register("name")}>
            </TextField.Root>
            {errors.name && (
                <Callout.Root size={"1"} color="red" className="mt-2">
                    <Callout.Icon>
                        <ExclamationCircleIcon height={"16"} width={"16"} />
                    </Callout.Icon>
                    <Callout.Text>
                        {errors.name.message}
                    </Callout.Text>
                </Callout.Root>
            )}
        </ModalFormShell>
    );
}
