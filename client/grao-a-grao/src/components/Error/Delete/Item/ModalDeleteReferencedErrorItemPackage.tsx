import { Text, ScrollArea, Box, Flex } from "@radix-ui/themes";
import ModalErrorShell from "../../ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse } from "@/errors/api_error";
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
      title={"Não é possível deletar."}
      onClose={onClose}
    >
      <Text as="label" size="3">
        {`Os fracionamentos abaixo dependem dele.`}
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
