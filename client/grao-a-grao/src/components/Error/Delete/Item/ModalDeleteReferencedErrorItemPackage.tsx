import { Text, ScrollArea, Box, Flex } from "@radix-ui/themes";
import ModalErrorShell from "../../ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse } from "@/types/api_error";
import { ItemPackagingModel } from "@/types/item_packaging";
import { ItemModel } from "@/types/item";

type ModalDeleteReferencedErrorItemPackageProps = {
  onClose: () => void;
  item: ItemModel;
  error: ForeignKeyDeleteReferencedErrorResponse<ItemPackagingModel>;
};

export default function ModalDeleteReferencedErrorItemPackage({ onClose, item, error }: ModalDeleteReferencedErrorItemPackageProps) {
  return (
    <ModalErrorShell
      title={"Error deleting referenced item"}
      onClose={onClose}
    >
      <Text as="label" size="3">
        {`${item.description} cannot be deleted. The following Item Packagings depends on it.`}
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
