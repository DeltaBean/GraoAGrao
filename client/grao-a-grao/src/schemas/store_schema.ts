import { z } from "zod";

// schema for Create
export const CreateStoreSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});
export type CreateStoreData = z.infer<typeof CreateStoreSchema>;

// schema for Update (includes store_id)
export const UpdateStoreSchema = z.object({
  store_id: z.number().int().positive("ID inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
});
export type UpdateStoreData = z.infer<typeof UpdateStoreSchema>;
