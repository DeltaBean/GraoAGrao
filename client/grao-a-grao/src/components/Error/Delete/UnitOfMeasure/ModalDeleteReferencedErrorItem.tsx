import { Text, ScrollArea, Box, Flex } from "@radix-ui/themes";
import ModalErrorShell from "../../ModalErrorShell";
import { ForeignKeyDeleteReferencedErrorResponse } from "@/errors/api_error";
import { ItemModel } from "@/types/item";
import { UnitOfMeasureModel } from "@/types/unit_of_measure";

type ModalDeleteReferencedErrorItemProps = {
  onClose: () => void;
  unit: UnitOfMeasureModel;
  error: ForeignKeyDeleteReferencedErrorResponse<ItemModel>;
};

export default function ModalDeleteReferencedErrorItem({ onClose, unit, error }: ModalDeleteReferencedErrorItemProps) {
  return (
    <ModalErrorShell
      title={"Não é possível deletar."}
      onClose={onClose}
    >
      <Text as="label" size="3">
      {`Os itens abaixo dependem dela.`}
      </Text>
      <ScrollArea type="always" scrollbars="vertical" style={{ height: "10vh" }}>
        <Box>
          <Flex direction="column" gap="4">
            {error.referencingEntities.map((it) => {

              return (

                <Text>{it.description}</Text>

              )
            })}
          </Flex>
        </Box>
      </ScrollArea>
    </ModalErrorShell>
  );
}
