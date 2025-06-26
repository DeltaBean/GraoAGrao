import { logout } from "@/util/util";
import { useRouter } from "next/navigation";
import { Button, Flex, AlertDialog } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

type ModalFormLogoutProps = {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ModalFormLogout({
  modalOpen,
  setModalOpen,
}: ModalFormLogoutProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  return (
    <AlertDialog.Root open={modalOpen} onOpenChange={setModalOpen}>
      <AnimatePresence>
        {modalOpen && (
          <AlertDialog.Content
            style={{
              overflow: "hidden",
              maxHeight: "90vh", 
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
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
            </motion.div>
          </AlertDialog.Content>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
}
