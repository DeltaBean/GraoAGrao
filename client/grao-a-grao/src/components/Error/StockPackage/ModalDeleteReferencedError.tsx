import { TextField, Skeleton, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import ModalErrorShell from "../ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse } from "@/types/api_error";

type ModalDeleteReferencedErrorProps = {
  onClose: () => void;
  error: ForeignKeyDeleteReferencedErrorResponse<T>;
};

export default function ModalDeleteReferencedError({onClose, error }: ModalDeleteReferencedErrorProps) {
  return (
    <ModalErrorShell
      title={"Error deleting referenced entity."}
      onClose={onClose}
    >
      <Text as="label" size="3">
        {error.details}
      </Text>
      
    </ModalErrorShell>
  );
}
