"use client";

import { useStockOutForm } from "@/hooks/useStockOutForm";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { StockOutModel } from "@/types/stock_out";
import { InformationCircleIcon, PlusIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Button, Flex, Text, TextField, Select, Card, Heading, Grid, Separator, DataList, Badge, Tooltip, Container, IconButton, Callout } from "@radix-ui/themes";
import { formatDateTimeLocal } from "@/util/util";
import React, { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/16/solid";

type Props = {
  initialData?: StockOutModel;
  itemOptions: ItemModel[];
  itemPackagingOptions: ItemPackagingModel[];
  onSubmit: (data: StockOutModel) => void;
  viewOnly?: boolean;
};

export default function StockOutForm({ initialData, itemOptions, itemPackagingOptions, onSubmit, viewOnly = false }: Props) {
  const {
    stockOut,
    addItem,
    removeItem,
    addItemPackaging,
    removeItemPackaging,
    updateItemSimpleField,
    updateItemPackagingField,
    isTotalBalanced,
    setStockOut: setForm,
  } = useStockOutForm(initialData);

  const [currentTime, setCurrentTime] = useState(formatDateTimeLocal(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatDateTimeLocal(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (initialData) setForm(initialData); }, [initialData, setForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(stockOut);
  };

  return (
    <Flex direction="column" className="w-full" gap="4">
      <Flex direction={{ initial: "column", sm: "row" }} justify="between" p="3" gap="3">
        <Heading size="6">{initialData ? "Editar Saída de Estoque" : "Criar Saída de Estoque"}</Heading>
        <Flex gap="5">
          <Button disabled={viewOnly} size="3" type="button" onClick={addItem} variant="outline">
            Adicionar Item
          </Button>
          <Button disabled={viewOnly} onClick={handleSubmit} size="3" type="submit" variant="solid">
            {initialData ? "Atualizar" : "Salvar"}
          </Button>
        </Flex>
      </Flex>

      <Flex direction="row" justify="between" p="3">
        <Text as="label" size="3">
          Saída em
          <TextField.Root size="3" type="datetime-local" step="1" disabled value={
            stockOut.created_at ? formatDateTimeLocal(new Date(stockOut.created_at)) : currentTime
          } />
        </Text>

        <Flex direction="column" gap="2">
          <Text size="3">Status</Text>
          {stockOut.status === "draft" ? (
            <Tooltip content="Ainda não finalizada, permite edição">
              <Badge size="3" color="amber" variant="surface">Rascunho</Badge>
            </Tooltip>
          ) : (
            <Tooltip content="Confirmada, não permite edição">
              <Badge variant="surface">Finalizada</Badge>
            </Tooltip>
          )}
        </Flex>

        {viewOnly && (
          <Text as="label" size="3">
            Finalizada em
            <TextField.Root size="3" type="datetime-local" step="1" disabled value={
              stockOut.finalized_at ? formatDateTimeLocal(new Date(stockOut.finalized_at)) : currentTime
            } />
          </Text>
        )}
      </Flex>

      <Separator size="4" />

      <form onSubmit={handleSubmit}>
        <Grid gap={{ initial: "2", sm: "6" }} columns={{ initial: "1", sm: "2", md: "3" }} p="3">
          {stockOut.items.map((item, index) => {
            // Conditions for showing callout:
            const qtyBalanceCalloutVisible =
              !!item.item.id &&                               // 1) item chosen
              item.item.is_fractionable &&                  // 2) item is fractionable  
              item.total_quantity > 0 &&                    // 3) total quantity filled
              item.packagings.length > 0 &&                 // 4) at least one pack
              item.packagings.every(p => p.quantity > 0);   // 5) every pack has quantity

            const otherSelectedIds = new Set(stockOut.items.filter((_, j) => j !== index).map(i => i.item.id));
            const itemOptionsForRow = itemOptions.filter(opt => !otherSelectedIds.has(opt.id));

            return (
              <Card key={index} className="p-4">
                <Flex direction="column" gap="5">
                  <Heading size="3" mb="-4">Item</Heading>
                  <Select.Root disabled={viewOnly} value={item.item.id ? String(item.item.id) : ""}
                    onValueChange={(val) => {
                      const sel = itemOptions.find(o => o.id === parseInt(val));
                      if (sel) updateItemSimpleField(index, "item", sel);
                    }}>
                    <Select.Trigger />
                    <Select.Content>
                      {itemOptionsForRow.map(opt => (<Select.Item key={opt.id} value={String(opt.id)}>{opt.description}</Select.Item>))}
                    </Select.Content>
                  </Select.Root>

                  {item.item.id && (
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
                  )}

                  <Text mb="-4" size="2">Quantidade Total</Text>
                  <Tooltip content={
                    item.item.id ?
                      `Quantidade total medida em "${item.item.unit_of_measure?.description}"` :
                      "Selecione um item para ver a quantidade total"
                  }>
                    <TextField.Root disabled={viewOnly} type="number" placeholder="0" value={item.total_quantity || ""}
                      onChange={e => updateItemSimpleField(index, "total_quantity", parseInt(e.target.value) || 0)} />
                  </Tooltip>

                  {item.item.is_fractionable && item.item.id && (
                    <> <Separator size="4" />
                      <Flex justify="between">
                        <Heading size="3" mb="-4">Fracionamentos</Heading>
                        <IconButton type="button" disabled={viewOnly} size="1" variant="soft" radius="full" onClick={() => addItemPackaging(index)}><PlusIcon width="16" height="16" /></IconButton>
                      </Flex>
                      {item.packagings.map((pack, pi) => {
                        const otherPacks = new Set(item.packagings.filter((_, j) => j !== pi).map(p => p.item_packaging.id));
                        const packOptions = itemPackagingOptions.filter(opt => opt.item?.id === item.item.id && !otherPacks.has(opt.id));
                        return (
                          <Card key={pi} className="mt-2">
                            <Flex direction="column" gap="4">
                              <Select.Root disabled={viewOnly} value={pack.item_packaging.id ? String(pack.item_packaging.id) : ""}
                                onValueChange={val => { const sel = itemPackagingOptions.find(o => o.id === parseInt(val)); if (sel) updateItemPackagingField(index, pi, "item_packaging", sel); }}>
                                <Select.Trigger />
                                <Select.Content>
                                  {packOptions.map(opt => (<Select.Item key={opt.id} value={String(opt.id)}>{opt.description}</Select.Item>))}
                                </Select.Content>
                              </Select.Root>
                              {pack.item_packaging.id && (
                                <> <DataList.Root>
                                  <DataList.Item><DataList.Label>Fracionamento</DataList.Label><DataList.Value>{`${pack.item_packaging.quantity}x ${item.item.unit_of_measure?.description}`}</DataList.Value></DataList.Item>
                                </DataList.Root>
                                  <Text mb="-4" size="2">Quantidade</Text>
                                  <TextField.Root disabled={viewOnly} type="number" placeholder="0" value={pack.quantity || ""}
                                    onChange={e => updateItemPackagingField(index, pi, "quantity", parseInt(e.target.value) || 0)} />
                                </>
                              )}
                              <Container>
                                <Button type="button" disabled={viewOnly} variant="outline" color="red" size="1" onClick={() => removeItemPackaging(index, pi)} style={{ marginTop: 8 }}>Excluir</Button>
                              </Container>
                            </Flex>
                          </Card>
                        );
                      })}
                    </>
                  )}

                  <Separator size="4" />
                  <Button variant="soft" color="red" type="button" onClick={() => removeItem(index)} disabled={viewOnly || stockOut.items.length === 1}>Remover</Button>

                  {qtyBalanceCalloutVisible && !isTotalBalanced(index) && (
                    <Callout.Root variant="soft" color="gray" size="1">
                      <Callout.Icon><InformationCircleIcon width="16" height="16" /></Callout.Icon>
                      <Callout.Text>A soma da quantidade dos fracionamentos não é igual a quantidade total do item</Callout.Text>
                    </Callout.Root>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Grid>
      </form>
    </Flex>
  );
}
