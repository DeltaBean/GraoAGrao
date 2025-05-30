import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Skeleton, Text, Select, Flex, Box, Badge, Tooltip } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { TagIcon } from "@heroicons/react/16/solid";


type ModalFormItemPackagingProps = {
    mode: "create" | "edit";
    editItemPackaging?: ItemPackagingModel;
    itemOptions: ItemModel[] | [];
    onClose: () => void;
    onSubmitCreate: (data: ItemPackagingModel) => void;
    onSubmitEdit: (data: ItemPackagingModel) => void;
};

export default function ModalFormItemPackaging({ mode, editItemPackaging, onClose, itemOptions, onSubmitCreate, onSubmitEdit }: ModalFormItemPackagingProps) {
    const [description, setDescription] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

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
        },
        is_fractionable: true
    };
    const defaultItemOption = (itemOptions.length > 0 ? itemOptions[0] : defaultItem)
    const [selectedItem, setSelectedItem] = useState<ItemModel>(defaultItemOption);

    useEffect(() => {
        if (editItemPackaging) {
            setDescription(editItemPackaging.description);
            setQuantity(editItemPackaging.quantity);

            const selectedItem = itemOptions.find(
                (it) => {
                    return it.id == (
                        editItemPackaging.item ?
                            editItemPackaging.item.id
                            :
                            itemOptions[0].id
                    )
                }) ?? defaultItem;

            setSelectedItem(selectedItem);
        }
    }, [editItemPackaging]);

    const handleSubmit = () => {
        if (mode === "edit" && editItemPackaging) {

            editItemPackaging.description = description;
            editItemPackaging.quantity = quantity;
            editItemPackaging.item = selectedItem;

            onSubmitEdit(editItemPackaging);
        } else {
            onSubmitCreate(
                {
                    description,
                    quantity,
                    item: selectedItem
                }
            );
        }
    };

    return (
        <ModalFormShell
            title="Fracionamento"
            mode={mode}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <Text as="label" size="3">
                <Skeleton loading={false}>
                    <div className="mb-2">Descrição</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <TextField.Root
                        size="3"
                        placeholder="Descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Skeleton>
            </Text>

            <Text as="label" size={"3"}>
                <Skeleton loading={false}>
                    <div className="mb-2">Quantidade</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <Box className="w-2/3">
                        {
                            mode === "edit" ?
                                <Tooltip content="Esta quantidade é fixa por motivos de integridade das informações. Por favor, crie um novo fracionamento com a quantidade correta e arquive este.">
                                    <TextField.Root disabled type="number" size="3" placeholder="Quantidade" value={quantity} onChange={(ev) => setQuantity(parseFloat(ev.target.value))}>
                                        <Flex justify={"center"} align={"center"} p="2">
                                            <Badge color="purple" size="2" variant="surface">{selectedItem.unit_of_measure?.description}</Badge>
                                        </Flex>
                                    </TextField.Root>
                                </Tooltip>
                                :
                                <TextField.Root type="number" size="3" placeholder="Quantidade" value={quantity} onChange={(ev) => setQuantity(parseFloat(ev.target.value))}>
                                    <Flex justify={"center"} align={"center"} p="2">
                                        <Badge color="purple" size="2" variant="surface">{selectedItem.unit_of_measure?.description}</Badge>
                                    </Flex>
                                </TextField.Root>
                        }
                    </Box>
                </Skeleton>
            </Text>

            <Text as="label" size={"3"}>
                <Skeleton loading={false}>
                    <div className="mb-2">Item</div>
                </Skeleton>
                <Skeleton loading={false}>

                    <Select.Root
                        value={String(selectedItem ? selectedItem.id : (itemOptions.length > 0 ? itemOptions[0].id : undefined))}
                        onValueChange={(value) => {
                            const selectedItem = itemOptions.find((it) => String(it.id) === value);
                            if (selectedItem) {
                                setSelectedItem(selectedItem);
                            }
                        }}
                    >
                        <Flex className="w-2/3">
                            <Select.Trigger style={{ width: "100%" }}>
                                <Flex as="span" align="center" gap="2">
                                    <TagIcon height="16" width="16" />
                                    <Flex direction={{ initial: "row" }} justify={"start"} align={"center"} gap="2">
                                        <Badge color="iris" size="2" variant="surface">{selectedItem.category?.description}</Badge>
                                        {selectedItem ? selectedItem.description : (itemOptions.length > 0 ? itemOptions[0].description : undefined)}
                                    </Flex>
                                </Flex>
                            </Select.Trigger>
                            <Select.Content position="popper">
                                {itemOptions.map((it) => (
                                    <Flex key={it.id} direction={{ initial: "row" }} justify={"between"} align={"center"} gap="2">
                                        <Select.Item
                                            key={it.id}
                                            value={String(it.id)}
                                        >
                                            {it.description}
                                        </Select.Item>
                                        <Badge m="2" color="iris" size="2" variant="surface">{it.category?.description}</Badge>
                                    </Flex>
                                ))}
                            </Select.Content>
                        </Flex>
                    </Select.Root>
                </Skeleton>
            </Text>

        </ModalFormShell >
    );
}
