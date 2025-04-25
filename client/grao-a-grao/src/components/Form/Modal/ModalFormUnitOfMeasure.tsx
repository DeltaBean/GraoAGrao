import ModalFormShell from "@/components/Form/Modal/ModalFormShell";
import { TextField, Skeleton, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { UnitOfMeasureModel } from "@/types/unit_of_measure";

type ModalFormUnitOfMeasureProps = {
  mode: "create" | "edit";
  editUnitOfMeasure?: UnitOfMeasureModel;
  onClose: () => void;
  onSubmitCreate: (data: UnitOfMeasureModel) => void;
  onSubmitEdit: (data: UnitOfMeasureModel) => void;
};

export default function ModalFormUnitOfMeasure({ mode, editUnitOfMeasure, onClose, onSubmitCreate, onSubmitEdit }: ModalFormUnitOfMeasureProps) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editUnitOfMeasure) {
      setDescription(editUnitOfMeasure.description);
    }
  }, [editUnitOfMeasure]);

  const handleSubmit = () => {
    if (mode === "edit" && editUnitOfMeasure) {
        editUnitOfMeasure.description = description;
      onSubmitEdit(editUnitOfMeasure);
    } else {
      onSubmitCreate({ description });
    }
  };

  return (
    <ModalFormShell
      title="Unit Of Measure"
      mode={mode}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Text as="label" size="3">
        <Skeleton loading={false}>
          <div className="mb-2">Description</div>
        </Skeleton>
        <Skeleton loading={false}>
          <TextField.Root
            size="3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Skeleton>
      </Text>
      
    </ModalFormShell>
  );
}
