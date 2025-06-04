import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LogOut } from "lucide-react";
import { logout } from "@/util/util";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ModalFormLogout() {
  const router = useRouter();
  if (!router) return null;

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <SidebarMenuButton className="cursor-pointer" asChild>
          <div>
            <LogOut />
            <span>Sair</span>
          </div>
        </SidebarMenuButton>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 backdrop-blur-sm z-40" />
        <AlertDialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-card p-6 rounded-xl shadow-xl w-[90vw] max-w-sm">
          <AlertDialog.Title className="text-lg font-semibold">
            Deseja finalizar a sessão?
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-muted mt-2">
            Você será desconectado e redirecionado para a tela de login.
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 rounded bg-muted text-foreground hover:brightness-110 transition cursor-pointer">
                Cancelar
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 rounded bg-destructive text-white hover:brightness-110 transition cursor-pointer"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Sair
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
