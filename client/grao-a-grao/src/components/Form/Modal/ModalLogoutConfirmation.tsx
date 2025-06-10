import { LogOut } from "lucide-react";
import { logout } from "@/util/util";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Button, Flex, AlertDialog } from "@radix-ui/themes";

export function ModalFormLogout() {
  const router = useRouter();
  if (!router) return null;

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <SidebarMenuButton className="cursor-pointer" asChild>
          <div>
            <LogOut />
            <span>Sair</span>
          </div>
        </SidebarMenuButton>
      </AlertDialog.Trigger>

      <AlertDialog.Content style={{ zIndex:50 }}>
        <AlertDialog.Title>Deseja finalizar a sessão?</AlertDialog.Title>

        <AlertDialog.Description>
          Você será desconectado e redirecionado para a tela de login.
        </AlertDialog.Description>

        <Flex justify="end" gap="3" mt="4">
          <AlertDialog.Cancel>
            <Button color="gray" style={{cursor: "pointer"}}>
              Cancelar
            </Button>
          </AlertDialog.Cancel>

          <AlertDialog.Action>
            <Button
              color="red" style={{cursor: "pointer"}}
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
