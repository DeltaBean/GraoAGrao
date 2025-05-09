import { TextField, Skeleton, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import ModalErrorShell from "./ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse, GenericPostgreSQLErrorResponse } from "@/errors/api_error";
import { ItemPackagingModel } from "@/types/item_packaging";

type ModalGenericErrorProps = {
  onClose: () => void;
  error: GenericPostgreSQLErrorResponse;
  title: string;
  details: string;
};

export default function ModalGenericError({onClose, error, title, details }: ModalGenericErrorProps) {
  return (
    <ModalErrorShell
      title={title}
      onClose={onClose}
    >
      <Text as="label" size="3">
        {details}
      </Text>
    </ModalErrorShell>
  );
}
