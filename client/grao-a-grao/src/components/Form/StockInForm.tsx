// components/StockInForm.tsx
"use client";

import { useStockInForm } from "@/hooks/useStockInForm";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { StockInModel } from "@/types/stock_in";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { Button, Flex, Text, TextField, Select, Card, Heading, Grid, Separator, DataList, Badge, Tooltip, Box, Section, Container, IconButton } from "@radix-ui/themes";

type Props = {
  initialData?: StockInModel; // Optional if editing
  itemOptions: ItemModel[];
  itemPackagingOptions: ItemPackagingModel[]; // Your packaging select options
  onSubmit: (data: StockInModel) => void;
};

export default function StockInForm({ initialData, itemOptions, itemPackagingOptions, onSubmit }: Props) {
  const {
    stockIn,
    addItem,
    removeItem,
    updateStockInField,
    updateItemSimpleField,
    updateItemNestedField,
  } = useStockInForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(stockIn);
  };

  return (
    <Flex direction="column" className="w-full" gap="4">

      <Flex id="stock-in-form-header" direction={{ initial: "column", sm: "row" }} justify="between" p="3" gap="3">

        <Heading size="6">{initialData ? "Editar Entrada de Estoque" : "Criar Entrada de Estoque"}</Heading>

        <Flex gap="5">
          <Button size="3" type="button" onClick={addItem} variant="outline">
            Adicionar Item
          </Button>

          <Button onClick={handleSubmit} size="3" type="submit" variant="solid">
            {initialData ? "Atualizar" : "Salvar"}
          </Button>

        </Flex>

      </Flex>
      <Flex id="stock-in-form-details" direction="row" justify="between" p="3">

        <Text as="label" size="3">Data/Hora de Entrada
          <TextField.Root
            size="3"
            type="datetime-local"
            value={stockIn.created_at || ""}
            onChange={(e) => updateStockInField("created_at", e.target.value)}
          />
        </Text>

      </Flex>

      <Separator size="4"></Separator>

      <form onSubmit={handleSubmit}>
        <Grid gap={{ initial: "2", sm: "6" }} columns={{ initial: "1", sm: "2", md: "3" }} p="3">
          {stockIn.items.map((item, index) => (
            <Card key={index} className="p-4">
              <Flex direction="column" gap="5">
                {/* Item */}
                <Text size="2" mb="-4">Item</Text>
                <Select.Root
                  value={item.item.id ? String(item.item.id) : ""}
                  onValueChange={(value) => {
                    updateItemNestedField(index, "item.id", parseInt(value));
                    updateItemNestedField(index, "item_packaging.id", 0)
                  }}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {itemOptions.map((option) => (
                      <Select.Item key={option.id} value={String(option.id)}>
                        {option.description}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                {/* chosen Item Details */}
                {item.item.id ?
                  <>
                    <DataList.Root>
                      <DataList.Item>
                        <DataList.Label>
                          Categoria
                        </DataList.Label>
                        <DataList.Value>
                          {
                            (() => {
                              const itemOption = itemOptions.find(it => it.id == item.item.id);
                              const category = itemOption?.category?.description;

                              return category ? (
                                <Badge color="blue" variant="soft">
                                  {`${category}`}
                                </Badge>
                              ) : (
                                "N/A"
                              );
                            })()
                          }
                        </DataList.Value>
                      </DataList.Item>
                      <DataList.Item>
                        <DataList.Label>
                          Unidade
                        </DataList.Label>
                        <DataList.Value>
                          {
                            (() => {
                              const itemOption = itemOptions.find(it => it.id == item.item.id);
                              const unit = itemOption?.unit_of_measure?.description;

                              return unit ? (
                                <Badge color="blue" variant="soft">
                                  {`${unit}`}
                                </Badge>
                              ) : (
                                "N/A"
                              );
                            })()
                          }
                        </DataList.Value>
                      </DataList.Item>
                    </DataList.Root>
                    <Separator size="4"></Separator>
                  </>
                  : ""}

                {/* Item Packaging */}
                {item.item.id ?
                  <>
                    <Text size="2" mb="-4">Porcionamento</Text>
                    <Select.Root
                      value={item.item_packaging.id ? String(item.item_packaging.id) : ""}
                      onValueChange={(value) => updateItemNestedField(index, "item_packaging.id", parseInt(value))}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {itemPackagingOptions.filter((option) => (option.item?.id === item.item.id)).map((option) => (
                          <Select.Item key={option.id} value={String(option.id)}>
                            {option.description}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </>
                  : ""}

                {/* chosen Item Packaging Details */}
                {item.item_packaging.id ?
                  <>
                    <DataList.Root>
                      <DataList.Item>
                        <DataList.Label>
                          Porcionamento
                        </DataList.Label>
                        <DataList.Value>
                          {
                            (() => {
                              const packaging = itemPackagingOptions.find(ipm => ipm.id == item.item_packaging.id);
                              const description = packaging?.item?.unit_of_measure?.description;
                              const quantity = packaging?.quantity

                              return description ? (
                                <Badge color="blue" variant="soft">
                                  {`${quantity} ${description}`}
                                </Badge>
                              ) : (
                                "N/A"
                              );
                            })()
                          }
                        </DataList.Value>
                      </DataList.Item>
                    </DataList.Root>
                    <Separator size="4"></Separator>
                  </>
                  : ""}
                {/* Buy Price */}
                <Text mb="-4" size="2">
                  <Flex gap="2">
                    Preço de Compra
                    <IconButton size="1" radius="full" variant="ghost" color="gray">
                      <InformationCircleIcon width="16" height="16"></InformationCircleIcon>
                    </IconButton>
                  </Flex>
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="0.00"
                  value={item.buy_price ?? item.buy_price != 0 ? item.buy_price : ""}
                  onChange={(e) => updateItemSimpleField(index, "buy_price", parseFloat(e.target.value))}
                />

                {/* Quantity */}
                <Text mb="-4" size="2">
                  Quantidade
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="0"
                  value={item.quantity ?? item.quantity != 0 ? item.quantity : ""}
                  onChange={(e) => updateItemSimpleField(index, "quantity", parseInt(e.target.value))}
                />

                {/* Remove button */}
                <Button
                  variant="soft"
                  color="red"
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={stockIn.items.length === 1}
                >
                  Remover
                </Button>
              </Flex>
            </Card>
          ))}

        </Grid>
      </form>
    </Flex>
  );
}
