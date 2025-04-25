import { TextField, Skeleton, Text, ScrollArea, Box, Flex } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import ModalErrorShell from "../../ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse } from "@/types/api_error";
import { StockPackagingModel } from "@/types/stock_packaging";
import { ItemModel } from "@/types/item";

type ModalDeleteReferencedErrorStockPackageProps = {
  onClose: () => void;
  item: ItemModel;
  error: ForeignKeyDeleteReferencedErrorResponse<StockPackagingModel>;
};

export default function ModalDeleteReferencedErrorStockPackage({ onClose, item, error }: ModalDeleteReferencedErrorStockPackageProps) {
  return (
    <ModalErrorShell
      title={"Error deleting referenced item"}
      onClose={onClose}
    >
      <Text as="label" size="3">
        {`${item.description} cannot be deleted. The following Stock Packagings depends on it.`}
      </Text>
      <ScrollArea type="always" scrollbars="vertical" style={{ height: "10vh" }}>
        <Box>
          <Flex direction="column" gap="4">
            {error.referencingEntities.map((stp, idx, entities) => {

              return (

                <Text>{stp.description}</Text>

              )
            })}
          </Flex>
        </Box>
      </ScrollArea>
    </ModalErrorShell>
  );
}
