// components/StockInForm.tsx
"use client";

import { useStockInForm } from "@/hooks/useStockInForm";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { StockInModel } from "@/types/stock_in";
import { CheckIcon, InformationCircleIcon, PlusIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Button, Flex, Text, TextField, Select, Card, Heading, Grid, Separator, DataList, Badge, Tooltip, Box, Section, Container, IconButton, Callout } from "@radix-ui/themes";
import { formatDateTimeLocal } from "@/util/util"
import React, { useEffect, useState } from "react";
import LoadingModal from "../LoadingModal";

type Props = {
  initialData?: StockInModel; // Optional if editing
  itemOptions: ItemModel[];
  itemPackagingOptions: ItemPackagingModel[]; // Your packaging select options
  onSubmit: (data: StockInModel) => void;
  viewOnly?: boolean;
};

export default function StockInForm({ initialData, itemOptions, itemPackagingOptions, onSubmit, viewOnly = false }: Props) {
  const {
    stockIn,
    setStockIn: setForm,
    resetForm,
    updateStockInField,
    addItem,
    removeItem,
    addItemPackaging,
    removeItemPackaging,
    updateItemSimpleField,
    updateItemPackagingField,
    updateItemNestedField,
    isTotalBalanced,
  } = useStockInForm(initialData);

  // tick state
  const [currentTime, setCurrentTime] = useState(formatDateTimeLocal(new Date()));

  // update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTimeLocal(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(stockIn);
  };

  return (
    <Flex direction="column" className="w-full" gap="4">

      <Flex id="stock-in-form-header" direction={{ initial: "column", sm: "row" }} justify="between" p="3" gap="3">

        <Heading size="6">{initialData ? "Editar Entrada de Estoque" : "Criar Entrada de Estoque"}</Heading>

        <Flex gap="5">
          <Button disabled={viewOnly} size="3" type="button" onClick={addItem} variant="outline">
            Adicionar Item
          </Button>

          <Button disabled={viewOnly} onClick={handleSubmit} size="3" type="submit" variant="solid">
            {initialData ? "Atualizar" : "Salvar"}
          </Button>

        </Flex>

      </Flex>
      <Flex id="stock-in-form-details" direction="row" justify="between" p="3">

        <Text as="label" size="3">
          Entrada em
          <TextField.Root
            size="3"
            type="datetime-local"
            step="1"
            disabled
            value={
              stockIn.created_at
                ? formatDateTimeLocal(new Date(stockIn.created_at))
                : currentTime
            }
          />
        </Text>

        <Flex direction="column" gap="2">
          <Text size="3">
            Status
          </Text>
          {
            stockIn.status == "draft" ?
              <Tooltip content="Ainda não finalizada, permite edição">
                <Badge size="3" color="amber" variant="surface">Rascunho</Badge>
              </Tooltip>
              : stockIn.status == "finalized" ?
                <Tooltip content="Confirmada, não permite edição">
                  <Badge variant="surface">Finalizada</Badge>
                </Tooltip>
                : ""
          }

        </Flex>
        {
          viewOnly ?
            (
              <Text as="label" size="3">
                Finalizada em
                <TextField.Root
                  size="3"
                  type="datetime-local"
                  step="1"
                  disabled
                  value={
                    stockIn.finalized_at
                      ? formatDateTimeLocal(new Date(stockIn.finalized_at))
                      : currentTime
                  }
                />
              </Text>
            )
            : ""
        }
      </Flex>

      <Separator size="4"></Separator>

      <form onSubmit={handleSubmit}>
        <Grid gap={{ initial: "2", sm: "6" }} columns={{ initial: "1", sm: "2", md: "3" }} p="3">
          {stockIn.items?.map((item, index) => {

            // Conditions for showing callout:
            const qtyBalanceCalloutVisible =
              !!item.item.id &&                               // 1) item chosen
              item.item.is_fractionable &&                  // 2) item is fractionable  
              item.total_quantity > 0 &&                    // 3) total quantity filled
              item.packagings.length > 0 &&                 // 4) at least one pack
              item.packagings.every(p => p.quantity > 0);   // 5) every pack has quantity

            // 1) Build a Set of all selected item IDs except this row
            const otherSelectedItemIds = new Set(
              stockIn.items
                .filter((_, j) => j !== index)
                .map(i => i.item.id)
            );

            // 2) Filter your master list so it doesn’t include those already chosen
            const optionsForThisRow = itemOptions.filter(
              opt => !otherSelectedItemIds.has(opt.id)
            );


            return (
              <Card key={index} className="p-4">
                <Flex direction="column" gap="5">
                  <Heading size="3" mb="-4">Item</Heading>
                  <Card>
                    <Flex direction="column" gap="5">
                      {/* Item */}
                      <Select.Root
                        disabled={viewOnly}
                        value={item.item.id ? String(item.item.id) : ""}
                        onValueChange={(value) => {
                          const selected = itemOptions.find(o => o.id === parseInt(value));
                          if (selected) {
                            updateItemSimpleField(
                              index,
                              "item",
                              selected
                            );
                          }
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {optionsForThisRow.map(opt => (
                            <Select.Item key={opt.id} value={String(opt.id)}>
                              {opt.description}
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
                                Unidade de Medida
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
                            <DataList.Item>
                              <DataList.Label>
                                Fracionável
                              </DataList.Label>
                              <DataList.Value>

                                {
                                  item.item.is_fractionable ?
                                    <Badge color="green" variant="soft"><CheckIcon height="16" width="16"></CheckIcon></Badge>
                                    :
                                    <Badge color="red" variant="soft"><XMarkIcon height="16" width="16"></XMarkIcon></Badge>
                                }

                              </DataList.Value>
                            </DataList.Item>
                          </DataList.Root>
                        </>
                        : ""}
                      {/* Buy Price */}
                      <Text mb="-4" size="2">
                        <Flex gap="2">
                          Preço de Compra
                        </Flex>
                      </Text>
                      <Tooltip content={`Preço por cada "${item.item.unit_of_measure?.description}" de "${item.item.description}"`}>
                        <TextField.Root
                          disabled={viewOnly}
                          type="number"
                          placeholder="0.00"
                          value={item.buy_price ?? item.buy_price != 0 ? item.buy_price : ""}
                          onChange={(e) => updateItemSimpleField(index, "buy_price", parseFloat(e.target.value))}
                        />
                      </Tooltip>

                      {/* Quantity */}
                      <Text mb="-4" size="2">
                        <Flex gap="2">
                          Quantidade Total
                        </Flex>
                      </Text>
                      <Tooltip content={`Quantidade total medida em "${item.item.unit_of_measure?.description}"`}>
                        <TextField.Root
                          disabled={viewOnly}
                          type="number"
                          placeholder="0"
                          value={item.total_quantity ?? item.total_quantity != 0 ? item.total_quantity : ""}
                          onChange={(e) => updateItemSimpleField(index, "total_quantity", parseInt(e.target.value))}
                        />
                      </Tooltip>
                    </Flex>
                  </Card>
                  {/* StockIn Packaging */}
                  {
                    item.item.is_fractionable ?
                      <>
                        {
                          item.item.id && (() => {
                            // 1) Build a Set of the already-picked packaging IDs
                            const selectedPackIds = new Set(
                              item.packagings.map(p => p.item_packaging.id)
                            );

                            // 2) Derive the dropdown options by filtering out those IDs
                            const availablePackOptions = itemPackagingOptions
                              .filter(opt =>
                                opt.item?.id === item.item.id &&      // only for this item
                                !selectedPackIds.has(opt.id)          // and not already chosen
                              );

                            return (
                              <>
                                <Separator size="4" />
                                <Flex justify="between">
                                  <Tooltip content="Itens que compõe fracionamento obrigatoriamente entram no estoque de forma fracionada">
                                    <Heading size="3" mb="-4">Fracionamentos</Heading>
                                  </Tooltip>
                                  <Tooltip content="Adicionar fracionamento">
                                    <IconButton disabled={viewOnly} size="1" variant="soft" radius="full" onClick={() => addItemPackaging(index)}>
                                      <PlusIcon width="16" height="16">
                                      </PlusIcon>
                                    </IconButton>
                                  </Tooltip>
                                </Flex>
                                {item.packagings.map((pack, packIndex) => {

                                  // Build the set of other selected packaging IDs (exclude this row)
                                  const otherSelected = new Set(
                                    item.packagings
                                      .filter((_, j) => j !== packIndex)
                                      .map(p => p.item_packaging.id)
                                  );

                                  // Now filter: same item, and not in the “otherSelected” set
                                  const optionsForThisRow = itemPackagingOptions.filter(
                                    opt =>
                                      opt.item?.id === item.item.id &&
                                      !otherSelected.has(opt.id)
                                  );

                                  return (
                                    <Card key={packIndex}>
                                      <Flex direction="column" gap="4">
                                        {/* 1) Select which packaging to use */}
                                        <Select.Root
                                          disabled={viewOnly}
                                          value={pack.item_packaging.id ? String(pack.item_packaging.id) : ""}
                                          onValueChange={(value) => {
                                            const selected = itemPackagingOptions.find(o => o.id === parseInt(value));
                                            if (selected) {
                                              updateItemPackagingField(
                                                index,
                                                packIndex,
                                                "item_packaging",
                                                selected
                                              );
                                            }
                                          }}
                                        >
                                          <Select.Trigger />
                                          <Select.Content>
                                            {optionsForThisRow.map(opt => (
                                              <Select.Item key={opt.id} value={String(opt.id)}>
                                                {opt.description}
                                              </Select.Item>
                                            ))}
                                          </Select.Content>
                                        </Select.Root>

                                        {/* 2) Show the details once a packaging is chosen */}
                                        {pack.item_packaging.id && (
                                          <>
                                            <DataList.Root>
                                              <DataList.Item>
                                                <DataList.Label>Fracionamento</DataList.Label>
                                                <DataList.Value>
                                                  {(() => {
                                                    const uom = item.item.unit_of_measure;
                                                    const qty = pack.item_packaging.quantity;
                                                    return uom?.description
                                                      ? <Badge color="blue" variant="soft">{`${qty}x ${uom.description}`}</Badge>
                                                      : "N/A";
                                                  })()}
                                                </DataList.Value>
                                              </DataList.Item>
                                            </DataList.Root>

                                            {/* Pack Quantity */}
                                            <Text mb="-4" size="2">Quantidade</Text>
                                            <TextField.Root
                                              disabled={viewOnly}
                                              type="number"
                                              placeholder="0"
                                              value={pack.quantity ?? ""}
                                              onChange={(e) =>
                                                updateItemPackagingField(
                                                  index,
                                                  packIndex,
                                                  "quantity",
                                                  parseInt(e.target.value) || 0
                                                )}
                                            />
                                          </>
                                        )}
                                        <Container>
                                          <Button
                                            disabled={viewOnly}
                                            variant="outline"
                                            color="red"
                                            size="1"
                                            onClick={() => removeItemPackaging(index, packIndex)}
                                            style={{ marginTop: 8 }}
                                          >
                                            Excluir
                                          </Button>
                                        </Container>
                                      </Flex>
                                    </Card>
                                  )
                                })}
                              </>
                            );
                          })()
                        }
                      </>
                      : ""}
                  < Separator size="4"></Separator>
                  {/* Remove button */}
                  <Button
                    variant="soft"
                    color="red"
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={viewOnly || stockIn.items?.length === 1}
                  >
                    Remover
                  </Button>

                  {(qtyBalanceCalloutVisible && !isTotalBalanced(index)) && (
                    <>
                      <Callout.Root variant="soft" color="gray" size="1">
                        <Callout.Icon>
                          <InformationCircleIcon width="16" height="16" />
                        </Callout.Icon>
                        <Callout.Text>
                          A soma da quantidade dos fracionamentos não é igual a quantidade total do item
                        </Callout.Text>
                      </Callout.Root>
                    </>
                  )}
                </Flex>
              </Card>
            )
          })}

        </Grid>
      </form>
    </Flex >
  );
}
