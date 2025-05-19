import { Text } from "@radix-ui/themes";
import ModalErrorShell from "./ModalErrorShell";


type ModalGenericErrorProps = {
  onClose: () => void;
  title: string;
  details: string;
};

export default function ModalGenericError({onClose, title, details }: ModalGenericErrorProps) {
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
