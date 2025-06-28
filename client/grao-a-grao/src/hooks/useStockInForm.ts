// hooks/useStockInForm.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import {
  StockInModel,
  StockInItemModel,
  StockInPackagingModel,
} from "@/types/stock_in";
import {
  createEmptyStockIn,
  createEmptyStockInItem,
  createEmptyStockInPackaging,
} from "@/util/factory/stock_in";
import { ItemModel } from "@/types/item";
import { isValidTwoDecimalNumber } from "@/util/util";

type InternalStockInItem = StockInItemModel & {
  _buy_price_input?: string; // temporary local state
};

export function useStockInForm(initial?: StockInModel) {
  const [stockIn, setStockIn] = useState<
    Omit<StockInModel, "items"> & { items: InternalStockInItem[] }
  >(initial ?? createEmptyStockIn());

  useEffect(() => {
    if (initial) {
      setStockIn(initial);
    }
  }, [initial]);

  // Update a top-level field on StockIn (e.g., status)
  function updateStockInField(field: keyof StockInModel, value: any) {
    setStockIn((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Add a new empty item row
  function addItem() {
    setStockIn((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyStockInItem()],
    }));
  }

  // Remove item by index
  function removeItem(index: number) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  // Add a packaging option under a specific item
  function addItemPackaging(itemIndex: number) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: [...item.packagings, createEmptyStockInPackaging()],
            }
          : item
      ),
    }));
  }

  // Remove a packaging by index under a specific item
  function removeItemPackaging(itemIndex: number, packagingIndex: number) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: item.packagings.filter(
                (_, j) => j !== packagingIndex
              ),
            }
          : item
      ),
    }));
  }

  // Update a simple field on an item (buy_price or total_quantity)
  function updateItemSimpleField(
    index: number,
    field: keyof Pick<
      StockInItemModel,
      "buy_price" | "total_quantity" | "item"
    >,
    value: any
  ) {
    setStockIn((prev) => {
      if (field === "item" && !value.is_fractionable)
        prev.items[index].packagings = [];

      return {
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      };
    });
  }

  // Update a nested field on an item (e.g., item.id)
  function updateItemNestedField(
    index: number,
    field: keyof Pick<StockInItemModel, "item">,
    nestedField: keyof Pick<ItemModel, "id">,
    value: any
  ) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: {
            ...item[field],
            [nestedField]: value,
          },
        } as StockInItemModel;
      }),
    }));
  }

  // Update a simple field on a packaging (item_packaging or quantity)
  function updateItemPackagingField(
    itemIndex: number,
    packagingIndex: number,
    field: keyof StockInPackagingModel,
    value: any
  ) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: item.packagings.map((pkg, j) =>
                j === packagingIndex ? { ...pkg, [field]: value } : pkg
              ),
            }
          : item
      ),
    }));
  }

  function updateBuyPriceInputField(index: number, inputValue: string) {
  if (!isValidTwoDecimalNumber(inputValue)) return; // block invalid input

    setStockIn((prev) => {
      const floatValue = parseFloat(inputValue.replace(/\./g, "").replace(",", "."));
      const newItems = [...prev.items];

      newItems[index] = {
        ...newItems[index],
        _buy_price_input: inputValue,
        buy_price: isNaN(floatValue) ? 0 : Math.round(floatValue * 100) / 100,
      };
      return {
        ...prev,
        items: newItems,
      };
    });
  }

  // Check if total_quantity equals the sum of pack quantities * packaging.unit
  function isTotalBalanced(itemIndex: number): boolean {
    const item = stockIn.items[itemIndex];
    if (item.total_quantity == null) return false;
    const sum = item.packagings.reduce((acc, pkg) => {
      const unitQty = pkg.item_packaging.quantity ?? 0;
      return acc + pkg.quantity * unitQty;
    }, 0);
    return sum === item.total_quantity;
  }

  // Set the whole stockIn object manually
  function setForm(newStockIn: StockInModel) {
    setStockIn(newStockIn);
  }

  // Reset the form to empty
  function resetForm() {
    setStockIn(createEmptyStockIn());
  }

  return {
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
    updateBuyPriceInputField,
  };
}
