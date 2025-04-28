import { TextField, Skeleton, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import ModalErrorShell from "./ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/types/api_error";
import { ItemPackagingModel } from "@/types/item_packaging";

type ModalGenericErrorProps = {
  onClose: () => void;
  error: GenericPostgreSQLErrorResponse;
};

export default function ModalGenericError({onClose, error }: ModalGenericErrorProps) {
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
