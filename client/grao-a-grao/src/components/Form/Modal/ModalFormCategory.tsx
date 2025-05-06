import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Skeleton, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { CategoryModel } from "@/types/category";

type ModalFormCategoryProps = {
  mode: "create" | "edit";
  editCategory?: CategoryModel;
  onClose: () => void;
  onSubmitCreate: (data: CategoryModel) => void;
  onSubmitEdit: (data: CategoryModel) => void;
};

export default function ModalFormCategory({ mode, editCategory, onClose, onSubmitCreate, onSubmitEdit }: ModalFormCategoryProps) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editCategory) {
      setDescription(editCategory.description);
    }
  }, [editCategory]);

  const handleSubmit = () => {
    if (mode === "edit" && editCategory) {
      editCategory.description = description;
      onSubmitEdit(editCategory);
    } else {
      onSubmitCreate({ description });
    }
  };

  return (
    <ModalFormShell
      title="Categoria"
      mode={mode}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Text as="label" size="3">
        <Skeleton loading={false}>
          <div className="mb-2">Descrição</div>
        </Skeleton>
        <Skeleton loading={false}>
          <TextField.Root
            size="3"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Skeleton>
      </Text>
      
    </ModalFormShell>
  );
}
