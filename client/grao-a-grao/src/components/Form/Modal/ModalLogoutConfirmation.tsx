import { logout } from "@/util/util";
import { useRouter } from "next/navigation";
import { Button, Flex, AlertDialog } from "@radix-ui/themes";
import React from "react";

type ModalFormLogoutProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ModalFormLogout({ modalOpen, setModalOpen }: ModalFormLogoutProps) {
  const router = useRouter();

  return (
    <AlertDialog.Root open={modalOpen} onOpenChange={setModalOpen}>
      <AlertDialog.Content>
        <AlertDialog.Title>Deseja finalizar a sessão?</AlertDialog.Title>
        <AlertDialog.Description>
          Você será desconectado e redirecionado para a tela de login.
        </AlertDialog.Description>
        <Flex justify="end" gap="3" mt="4">
          <AlertDialog.Cancel>
            <Button color="gray">Cancelar</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              color="red"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Sair
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
