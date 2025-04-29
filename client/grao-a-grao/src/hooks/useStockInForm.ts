// hooks/useStockInForm.ts
"use client";

import { useState } from "react";
import { StockInModel, StockInItemModel } from "@/types/stock_in";
import { createEmptyStockInItem, createEmptyStockIn } from "@/util/factory/stock_in";
import { ItemModel } from "@/types/item";
import { ItemPackagingModel } from "@/types/item_packaging";
import { UnitOfMeasureModel } from "@/types/unit_of_measure";

export function useStockInForm(initial?: StockInModel) {
  const [stockIn, setStockIn] = useState<StockInModel>(initial ?? createEmptyStockIn());

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

  function updateStockInField(field: keyof StockInModel, value: any) {
    setStockIn((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateItemSimpleField(index: number, field: keyof StockInItemModel, value: any) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  }

  function updateItemNestedField(index: number, fieldPath: string, value: any) {
    setStockIn((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
  
        const keys = fieldPath.split(".");
        const updated = { ...item };
        let ref: any = updated;
  
        for (let j = 0; j < keys.length - 1; j++) {
          const key = keys[j];
  
          // Ensure each layer exists to avoid mutation of undefined
          ref[key] = { ...ref[key] };
          ref = ref[key];
        }
  
        ref[keys[keys.length - 1]] = value;
        return updated;
      }),
    }));
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
    addItem,
    removeItem,
    updateStockInField,
    updateItemSimpleField,
    updateItemNestedField,
  };
}
