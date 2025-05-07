import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Skeleton, Text, Callout, Select, Flex, Checkbox, Container } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { ItemModel } from "@/types/item";
import { CategoryModel } from "@/types/category";
import { UnitOfMeasureModel } from "@/types/unit_of_measure";
import { QrCodeIcon, TagIcon, InformationCircleIcon, ScaleIcon } from "@heroicons/react/16/solid";


type ModalFormItemProps = {
    mode: "create" | "edit";
    editItem?: ItemModel;
    categoryOptions: CategoryModel[] | [];
    unitOfMeasureOptions: UnitOfMeasureModel[] | [];
    onClose: () => void;
    onSubmitCreate: (data: ItemModel) => void;
    onSubmitEdit: (data: ItemModel) => void;
};

export default function ModalFormItem({ mode, editItem: editItem, onClose, categoryOptions, unitOfMeasureOptions, onSubmitCreate, onSubmitEdit }: ModalFormItemProps) {
    const [description, setDescription] = useState("");
    const [ean13, setEan13] = useState("");
    const [isFractionable, setIsFractionable] = useState(true);

    const defaultCategory = { id: 0, description: "" }
    const defaultCategoryOption = (categoryOptions.length > 0 ? categoryOptions[0] : defaultCategory);
    const [selectedCategory, setSelectedCategory] = useState<CategoryModel>(defaultCategoryOption);

    const defaultUnitOfMeasure = { id: 0, description: "" }
    const defaultUnitOfMeasureOption = (unitOfMeasureOptions.length > 0 ? unitOfMeasureOptions[0] : defaultUnitOfMeasure)
    const [selectedUnitOfMeasure, setSelectedUnitOfMeasure] = useState<UnitOfMeasureModel>(defaultUnitOfMeasureOption);

    const [ean13Error, setEan13Error] = useState<string | null>(null);

    useEffect(() => {
        if (editItem) {
            setDescription(editItem.description);
            setEan13(editItem.ean13 ?? "");
            setIsFractionable(editItem.is_fractionable);

            const selectedCategory = categoryOptions.find(
                (cat) => {
                    return cat.id == (
                        editItem.category ?
                            editItem.category.id
                            :
                            categoryOptions[0].id
                    )
                }) ?? defaultCategory;

            const selectedUnitOfMeasure = unitOfMeasureOptions.find(
                (uom) => {
                    return uom.id == (
                        editItem.unit_of_measure ?
                            editItem.unit_of_measure.id
                            :
                            unitOfMeasureOptions[0].id
                    )
                }) ?? defaultUnitOfMeasure;

            setSelectedCategory(selectedCategory);
            setSelectedUnitOfMeasure(selectedUnitOfMeasure);
        }
    }, [editItem]);

    const Ean13OnChange = (value: string) => {
        if (value.length != 13) {
            setEan13Error("EAN-13 deve conter 13 dígitos.");
        } else if (!/^\d+$/.test(value)) {
            setEan13Error("EAN-13 deve conter apenas dígitos numéricos.");
        } else {
            setEan13Error(null);
        }
        setEan13(value);
    }

    const handleSubmit = () => {
        if (mode === "edit" && editItem) {

            editItem.description = description;
            editItem.ean13 = ean13;
            editItem.category = selectedCategory;
            editItem.unit_of_measure = selectedUnitOfMeasure;
            editItem.is_fractionable = isFractionable;

            onSubmitEdit(editItem);
        } else {
            onSubmitCreate(
                {
                    description,
                    ean13,
                    category: selectedCategory,
                    unit_of_measure: selectedUnitOfMeasure,
                    is_fractionable: isFractionable,
                }
            );
        }
    };

    return (
        <ModalFormShell
            title="Item"
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
                    <div className="mb-2">EAN-13</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <TextField.Root size="3" placeholder="EAN-13" value={ean13} onChange={(ev) => Ean13OnChange(ev.target.value)}>
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
                    <div className="mb-2">Categoria</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <Select.Root
                        value={String(selectedCategory ? selectedCategory.id : (categoryOptions.length > 0 ? categoryOptions[0].id : undefined))}
                        onValueChange={(value) => {
                            const selectedCategory = categoryOptions.find((cat) => String(cat.id) === value);
                            if (selectedCategory) {
                                setSelectedCategory(selectedCategory);
                            }
                        }}
                    >
                        <Flex className="w-1/2">
                            <Select.Trigger style={{ width: "100%" }}>
                                <Flex as="span" align="center" gap="2">
                                    <TagIcon height="16" width="16" />
                                    {selectedCategory ? selectedCategory.description : (categoryOptions.length > 0 ? categoryOptions[0].description : undefined)}
                                </Flex>
                            </Select.Trigger>
                            <Select.Content position="popper">
                                {categoryOptions.map((category) => (
                                    <Select.Item
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.description}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Flex>
                    </Select.Root>
                </Skeleton>
            </Text>
            <Text as="label" size={"3"}>
                <Skeleton loading={false}>
                    <div className="mb-2">Unidade de Medida</div>
                </Skeleton>
                <Skeleton loading={false}>
                    <Select.Root
                        value={String(selectedUnitOfMeasure ? selectedUnitOfMeasure.id : (unitOfMeasureOptions.length > 0 ? unitOfMeasureOptions[0].id : undefined))}
                        onValueChange={(value) => {
                            const selectedUnit = unitOfMeasureOptions.find((unit) => String(unit.id) === value);
                            if (selectedUnit) {
                                setSelectedUnitOfMeasure(selectedUnit)
                            }
                        }}
                    >
                        <Flex className="w-1/2">
                            <Select.Trigger style={{ width: "100%" }}>
                                <Flex as="span" align="center" gap="2">
                                    <ScaleIcon height="16" width="16" />
                                    {selectedUnitOfMeasure ? selectedUnitOfMeasure.description : (unitOfMeasureOptions.length > 0 ? unitOfMeasureOptions[0].description : undefined)}
                                </Flex>
                            </Select.Trigger>
                            <Select.Content position="popper">
                                {unitOfMeasureOptions.map((unit) => (
                                    <Select.Item
                                        key={unit.id}
                                        value={String(unit.id)}
                                    >
                                        {unit.description}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Flex>
                    </Select.Root>
                </Skeleton>
            </Text>
            <Text as="label" size="3">
                <Flex as="span" gap="2">
                    <Checkbox
                        size="2"
                        checked={isFractionable}
                        onCheckedChange={(checked) => setIsFractionable(checked === true)}
                    /> Compõe Fracionamento
                </Flex>
            </Text>
        </ModalFormShell>
    );
}
