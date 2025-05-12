import { useState } from "react";
import { StoreModel } from "@/types/store";

export type StoreFormMode = "create" | "edit";

export function useStoreForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<StoreFormMode>("create");
  const [current, setCurrent] = useState<StoreModel | null>(null);

  function openCreate() {
    setMode("create");
    setCurrent(null);
    setIsOpen(true);
  }

  function openEdit(store: StoreModel) {
    setMode("edit");
    setCurrent(store);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return { isOpen, mode, current, openCreate, openEdit, close };
}
