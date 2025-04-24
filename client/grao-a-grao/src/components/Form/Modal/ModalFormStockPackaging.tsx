import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Skeleton, Text, Callout, Select, Flex, Box, Badge } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { ItemModel } from "@/model/item";
import { StockPackagingModel } from "@/model/stock_packaging";
import { QrCodeIcon, TagIcon, InformationCircleIcon, ScaleIcon } from "@heroicons/react/16/solid";
import { init } from "next/dist/compiled/webpack/webpack";


type ModalFormStockPackagingProps = {
    mode: "create" | "edit";
    editStockPackaging?: StockPackagingModel;
    itemOptions: ItemModel[] | [];
    onClose: () => void;
    onSubmitCreate: (data: StockPackagingModel) => void;
    onSubmitEdit: (data: StockPackagingModel) => void;
};

export default function ModalFormStockPackaging({ mode, editStockPackaging, onClose, itemOptions, onSubmitCreate, onSubmitEdit }: ModalFormStockPackagingProps) {
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
        }
    };
    const defaultItemOption = (itemOptions.length > 0 ? itemOptions[0] : defaultItem)
    const [selectedItem, setSelectedItem] = useState<ItemModel>(defaultItemOption);

    useEffect(() => {
        if (editStockPackaging) {
            setDescription(editStockPackaging.description);
            setQuantity(editStockPackaging.quantity);

            const selectedItem = itemOptions.find(
                (it) => {
                    return it.id == (
                        editStockPackaging.item ?
                            editStockPackaging.item.id
                            :
                            itemOptions[0].id
                    )
                }) ?? defaultItem;

            setSelectedItem(selectedItem);
        }
    }, [editStockPackaging]);

    const handleSubmit = () => {
        if (mode === "edit" && editStockPackaging) {

            editStockPackaging.description = description;
            editStockPackaging.quantity = quantity;
            editStockPackaging.item = selectedItem;

            onSubmitEdit(editStockPackaging);
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
            title="Stock Packaging"
            mode={mode}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <Text as="label" size="3">
                <Skeleton loading={false}>
                    <div className="mb-2">Description</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <TextField.Root
                        size="3"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Skeleton>
            </Text>

            <Text as="label" size={"3"}>
                <Skeleton loading={false}>
                    <div className="mb-2">Quantity</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <Box className="w-2/3">
                        <TextField.Root type="number" size="3" placeholder="Quantity" value={quantity} onChange={(ev) => setQuantity(parseFloat(ev.target.value))}>
                            <Flex justify={"center"} align={"center"} p="2">
                                <Badge color="purple" size="2" variant="surface">{selectedItem.unit_of_measure?.description}</Badge>
                            </Flex>
                        </TextField.Root>
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
                            <Select.Trigger style={{width: "100%"}}>
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
                                    <Flex direction={{ initial: "row" }} justify={"between"} align={"center"} gap="2">
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
