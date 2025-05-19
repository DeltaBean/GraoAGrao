/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import {
  StockOutModel,
  StockOutItemModel,
  StockOutPackagingModel,
} from "@/types/stock_out";
import {
  createEmptyStockOut,
  createEmptyStockOutItem,
  createEmptyStockOutPackaging,
} from "@/util/factory/stock_out";
import { ItemModel } from "@/types/item";

export function useStockOutForm(initial?: StockOutModel) {
  const [stockOut, setStockOut] = useState<StockOutModel>(
    initial ?? createEmptyStockOut()
  );

  useEffect(() => {
    if (initial) {
      setStockOut(initial);
    }
  }, [initial]);

  // Update a top-level field on StockOut (e.g., status)
  function updateStockOutField(field: keyof StockOutModel, value: any) {
    setStockOut((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Add a new empty item row
  function addItem() {
    setStockOut((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyStockOutItem()],
    }));
  }

  // Remove item by index
  function removeItem(index: number) {
    setStockOut((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  // Add a packaging option under a specific item
  function addItemPackaging(itemIndex: number) {
    setStockOut((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: [...item.packagings, createEmptyStockOutPackaging()],
            }
          : item
      ),
    }));
  }

  // Remove a packaging by index under a specific item
  function removeItemPackaging(itemIndex: number, packagingIndex: number) {
    setStockOut((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: item.packagings.filter((_, j) => j !== packagingIndex),
            }
          : item
      ),
    }));
  }

  // Update a simple field on an item (total_quantity or item)
  function updateItemSimpleField(
    index: number,
    field: keyof Pick<StockOutItemModel, "total_quantity" | "item">,
    value: any
  ) {
    setStockOut((prev) => {
      if (field === "item" && !value.is_fractionable) {
        prev.items[index].packagings = [];
      }
      return {
        ...prev,
        items: prev.items.map((item, i) =>
          i === index
            ? { ...item, [field]: value }
            : item
        ),
      };
    });
  }

  // Update a nested field on an item (e.g., item.id)
  function updateItemNestedField(
    index: number,
    field: keyof Pick<StockOutItemModel, "item">,
    nestedField: keyof Pick<ItemModel, "id">,
    value: any
  ) {
    setStockOut((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: {
            ...item[field],
            [nestedField]: value,
          },
        } as StockOutItemModel;
      }),
    }));
  }

  // Update a simple field on a packaging (item_packaging or quantity)
  function updateItemPackagingField(
    itemIndex: number,
    packagingIndex: number,
    field: keyof StockOutPackagingModel,
    value: any
  ) {
    setStockOut((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              packagings: item.packagings.map((pkg, j) =>
                j === packagingIndex
                  ? { ...pkg, [field]: value }
                  : pkg
              ),
            }
          : item
      ),
    }));
  }

  // Check if total_quantity equals the sum of pack quantities * packaging.unit
  function isTotalBalanced(itemIndex: number): boolean {
    const item = stockOut.items[itemIndex];
    if (item.total_quantity == null) return false;
    const sum = item.packagings.reduce((acc, pkg) => {
      const unitQty = pkg.item_packaging.quantity ?? 0;
      return acc + pkg.quantity * unitQty;
    }, 0);
    return sum === item.total_quantity;
  }

  // Set the whole stockOut object manually
  function setForm(newStockOut: StockOutModel) {
    setStockOut(newStockOut);
  }

  // Reset the form to empty
  function resetForm() {
    setStockOut(createEmptyStockOut());
  }

  return {
    stockOut,
    setStockOut: setForm,
    resetForm,
    updateStockOutField,
    addItem,
    removeItem,
    addItemPackaging,
    removeItemPackaging,
    updateItemSimpleField,
    updateItemNestedField,
    updateItemPackagingField,
    isTotalBalanced,
  };
}
