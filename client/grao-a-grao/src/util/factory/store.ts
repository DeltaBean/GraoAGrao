import { StoreModel } from "@/types/store";

export function createEmptyStore(): StoreModel {
  return {
    id: 0,
    name: "",
    created_at: "",
    updated_at: "",
  };
}