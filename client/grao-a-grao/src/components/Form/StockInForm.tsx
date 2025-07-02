// components/StockInForm.tsx
"use client";

import { useStockInForm } from "@/hooks/useStockInForm";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { StockInModel } from "@/types/stock_in";
import {
  CheckIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import {
  Button,
  Flex,
  Text,
  TextField,
  Select,
  Heading,
  Grid,
  Separator,
  DataList,
  Badge,
  Tooltip,
  Container,
  IconButton,
  Callout,
} from "@radix-ui/themes";
import { formatDateTimeLocal, formatReversedCurrencyInput } from "@/util/util";
import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";

type Props = {
  initialData?: StockInModel; // Optional if editing
  itemOptions: ItemModel[];
  itemPackagingOptions: ItemPackagingModel[]; // Your packaging select options
  onSubmit: (data: StockInModel) => void;
  viewOnly?: boolean;
};

export default function StockInForm({
  initialData,
  itemOptions,
  itemPackagingOptions,
  onSubmit,
  viewOnly = false,
}: Props) {
  const {
    stockIn,
    addItem,
    removeItem,
    addItemPackaging,
    removeItemPackaging,
    updateItemSimpleField,
    updateItemPackagingField,
    isTotalBalanced,
    updateBuyPriceInputField,
  } = useStockInForm(initialData);

  // tick state
  const [currentTime, setCurrentTime] = useState(
    formatDateTimeLocal(new Date())
  );

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
      <Flex
        id="stock-in-form-header"
        direction={{ initial: "column", sm: "row" }}
        justify="between"
        p="3"
        gap="3"
      >
        <Heading className="text-[var(--accent-11)]" size="6">
          {initialData
            ? "Editar Entrada de Estoque"
            : "Criar Entrada de Estoque"}
        </Heading>
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
          <Text size="3">Status</Text>
          {stockIn.status == "draft" ? (
            <Tooltip content="Ainda não finalizada, permite edição">
              <Badge size="3" color="amber" variant="surface">
                Rascunho
              </Badge>
            </Tooltip>
          ) : stockIn.status == "finalized" ? (
            <Tooltip content="Confirmada, não permite edição">
              <Badge variant="surface">Finalizada</Badge>
            </Tooltip>
          ) : (
            ""
          )}
        </Flex>
        {viewOnly ? (
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
        ) : (
          ""
        )}
      </Flex>

      <Separator size="4"></Separator>
      <Flex justify={"end"} gap="5">
        <Button
          disabled={viewOnly}
          size="3"
          type="button"
          onClick={addItem}
          variant="outline"
        >
          Adicionar Item
        </Button>
        <Button
          disabled={viewOnly}
          onClick={handleSubmit}
          size="3"
          type="submit"
          variant="solid"
        >
          {initialData ? "Atualizar" : "Salvar"}
        </Button>
      </Flex>
      <form onSubmit={handleSubmit}>
        <Grid
          gap={{ initial: "2", sm: "3", md: "5", lg: "7" }}
          columns={{ initial: "1", sm: "1", md: "2", xl: "4" }}
          px="3"
        >
          {stockIn.items?.map((item, index) => {
            // Conditions for showing callout:
            const qtyBalanceCalloutVisible =
              !!item.item.id && // 1) item chosen
              item.item.is_fractionable && // 2) item is fractionable
              item.total_quantity > 0 && // 3) total quantity filled
              item.packagings.length > 0 && // 4) at least one pack
              item.packagings.every((p) => p.quantity > 0); // 5) every pack has quantity

            // 1) Build a Set of all selected item IDs except this row
            const otherSelectedItemIds = new Set(
              stockIn.items.filter((_, j) => j !== index).map((i) => i.item.id)
            );

            // 2) Filter your master list so it doesn’t include those already chosen
            const optionsForThisRow = itemOptions.filter(
              (opt) => !otherSelectedItemIds.has(opt.id)
            );

            return (
              <Card key={index} className="p-6 bg-[var(--gray-1)]">
                <Flex direction="column" gap="6">
                  <Heading size="3" mb="-2">
                    Item de Entrada
                  </Heading>
                  <Card className="p-4 bg-[var(--gray-2)] gap-8">
                    <Flex direction="column" gap="5">
                      {/* Item */}
                      <Text mb="-4" size="2">
                        <Flex gap="2">Produto</Flex>
                      </Text>
                      <Select.Root
                        disabled={viewOnly}
                        value={item.item.id ? String(item.item.id) : ""}
                        onValueChange={(value) => {
                          const selected = itemOptions.find(
                            (o) => o.id === parseInt(value)
                          );
                          if (selected) {
                            updateItemSimpleField(index, "item", selected);
                          }
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {optionsForThisRow.map((opt) => (
                            <Select.Item key={opt.id} value={String(opt.id)}>
                              {opt.description}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>

                      {/* chosen Item Details */}
                      {item.item.id ? (
                        <>
                          <DataList.Root>
                            <DataList.Item>
                              <DataList.Label>Categoria</DataList.Label>
                              <DataList.Value>
                                {(() => {
                                  const itemOption = itemOptions.find(
                                    (it) => it.id == item.item.id
                                  );
                                  const category =
                                    itemOption?.category?.description;

                                  return category ? (
                                    <Badge color="blue" variant="soft">
                                      {`${category}`}
                                    </Badge>
                                  ) : (
                                    "N/A"
                                  );
                                })()}
                              </DataList.Value>
                            </DataList.Item>
                            <DataList.Item>
                              <DataList.Label>Unidade de Medida</DataList.Label>
                              <DataList.Value>
                                {(() => {
                                  const itemOption = itemOptions.find(
                                    (it) => it.id == item.item.id
                                  );
                                  const unit =
                                    itemOption?.unit_of_measure?.description;

                                  return unit ? (
                                    <Badge color="blue" variant="soft">
                                      {`${unit}`}
                                    </Badge>
                                  ) : (
                                    "N/A"
                                  );
                                })()}
                              </DataList.Value>
                            </DataList.Item>
                            <DataList.Item>
                              <DataList.Label>Fracionável</DataList.Label>
                              <DataList.Value>
                                {item.item.is_fractionable ? (
                                  <Badge color="green" variant="soft">
                                    <CheckIcon
                                      height="16"
                                      width="16"
                                    ></CheckIcon>
                                  </Badge>
                                ) : (
                                  <Badge color="red" variant="soft">
                                    <XMarkIcon
                                      height="16"
                                      width="16"
                                    ></XMarkIcon>
                                  </Badge>
                                )}
                              </DataList.Value>
                            </DataList.Item>
                          </DataList.Root>
                        </>
                      ) : (
                        ""
                      )}
                      {/* Buy Price */}
                      <Text mb="-4" size="2">
                        <Flex gap="2">Preço de Compra</Flex>
                      </Text>

                      <Tooltip
                        content={
                          item.item.id
                            ? `Preço por cada "${item.item.unit_of_measure?.description}" de "${item.item.description}"`
                            : "Selecione um item para ver o preço de compra"
                        }
                      >
                        <TextField.Root
                          disabled={viewOnly}
                          type="text"
                          placeholder="R$ 0,00"
                          inputMode="numeric"
                          value={
                            item._buy_price_input
                              ? `R$ ${item._buy_price_input}`
                              : ""
                          }
                          onChange={(e) => {
                            const masked = formatReversedCurrencyInput(
                              e.target.value
                            );
                            updateBuyPriceInputField(index, masked);
                          }}
                        />
                      </Tooltip>

                      {/* Quantity */}
                      <Text mb="-4" size="2">
                        <Flex gap="2">Quantidade Total</Flex>
                      </Text>
                      <Tooltip
                        content={
                          item.item.id
                            ? `Quantidade total medida em "${item.item.unit_of_measure?.description}"`
                            : "Selecione um item para ver a quantidade total"
                        }
                      >
                        <TextField.Root
                          disabled={viewOnly}
                          type="number"
                          placeholder="0"
                          value={
                            item.total_quantity ?? item.total_quantity != 0
                              ? item.total_quantity
                              : ""
                          }
                          onChange={(e) =>
                            updateItemSimpleField(
                              index,
                              "total_quantity",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Tooltip>
                    </Flex>
                    {/* StockIn Packaging */}
                    {item.item.is_fractionable ? (
                      <>
                        {item.item.id &&
                          (() => {
                            return (
                              <>
                                <Flex direction="column" gap="3">
                                  <Flex justify="between">
                                    <Tooltip content="Itens que compõe fracionamento obrigatoriamente entram no estoque de forma fracionada">
                                      <Heading
                                        size="3"
                                        mb="-4"
                                        weight={"regular"}
                                      >
                                        Fracionamentos
                                      </Heading>
                                    </Tooltip>
                                    <Tooltip content="Adicionar fracionamento">
                                      <IconButton
                                        type="button"
                                        disabled={viewOnly}
                                        size="1"
                                        variant="soft"
                                        radius="full"
                                        onClick={() => addItemPackaging(index)}
                                      >
                                        <PlusIcon
                                          width="16"
                                          height="16"
                                        ></PlusIcon>
                                      </IconButton>
                                    </Tooltip>
                                  </Flex>
                                  {item.packagings.map((pack, packIndex) => {
                                    // Build the set of other selected packaging IDs (exclude this row)
                                    const otherSelected = new Set(
                                      item.packagings
                                        .filter((_, j) => j !== packIndex)
                                        .map((p) => p.item_packaging.id)
                                    );

                                    // Now filter: same item, and not in the “otherSelected” set
                                    const optionsForThisRow =
                                      itemPackagingOptions.filter(
                                        (opt) =>
                                          opt.item?.id === item.item.id &&
                                          !otherSelected.has(opt.id)
                                      );

                                    return (
                                      <Card
                                        key={packIndex}
                                        className="p-4 bg-[var(--gray-2)]"
                                      >
                                        <Flex direction="column" gap="4">
                                          {/* 1) Select which packaging to use */}
                                          <Text mb="-2" size="2">
                                            <Flex gap="2">Porção</Flex>
                                          </Text>
                                          <Select.Root
                                            disabled={viewOnly}
                                            value={
                                              pack.item_packaging.id
                                                ? String(pack.item_packaging.id)
                                                : ""
                                            }
                                            onValueChange={(value) => {
                                              const selected =
                                                itemPackagingOptions.find(
                                                  (o) =>
                                                    o.id === parseInt(value)
                                                );
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
                                              {optionsForThisRow.map((opt) => (
                                                <Select.Item
                                                  key={opt.id}
                                                  value={String(opt.id)}
                                                >
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
                                                  <DataList.Label>
                                                    Fracionamento
                                                  </DataList.Label>
                                                  <DataList.Value>
                                                    {(() => {
                                                      const uom =
                                                        item.item
                                                          .unit_of_measure;
                                                      const qty =
                                                        pack.item_packaging
                                                          .quantity;
                                                      return uom?.description ? (
                                                        <Badge
                                                          color="blue"
                                                          variant="soft"
                                                        >{`${qty}x ${uom.description}`}</Badge>
                                                      ) : (
                                                        "N/A"
                                                      );
                                                    })()}
                                                  </DataList.Value>
                                                </DataList.Item>
                                              </DataList.Root>

                                              {/* Pack Quantity */}
                                              <Text mb="-4" size="2">
                                                Quantidade
                                              </Text>
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
                                                    parseInt(e.target.value) ||
                                                      0
                                                  )
                                                }
                                              />
                                            </>
                                          )}
                                          <Container>
                                            <Button
                                              type="button"
                                              disabled={viewOnly}
                                              variant="outline"
                                              color="red"
                                              size="1"
                                              onClick={() =>
                                                removeItemPackaging(
                                                  index,
                                                  packIndex
                                                )
                                              }
                                              style={{ marginTop: 8 }}
                                            >
                                              Excluir
                                            </Button>
                                          </Container>
                                        </Flex>
                                      </Card>
                                    );
                                  })}
                                </Flex>
                              </>
                            );
                          })()}
                      </>
                    ) : (
                      ""
                    )}
                  </Card>
                  {/* Remove button */}
                  {qtyBalanceCalloutVisible && !isTotalBalanced(index) && (
                    <>
                      <Callout.Root variant="soft" color="gray" size="1">
                        <Callout.Icon>
                          <InformationCircleIcon width="16" height="16" />
                        </Callout.Icon>
                        <Callout.Text>
                          A soma da quantidade dos fracionamentos não é igual a
                          quantidade total do item
                        </Callout.Text>
                      </Callout.Root>
                    </>
                  )}
                  <Button
                    variant="soft"
                    color="red"
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={viewOnly || stockIn.items?.length === 1}
                  >
                    Remover
                  </Button>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      </form>
    </Flex>
  );
}
