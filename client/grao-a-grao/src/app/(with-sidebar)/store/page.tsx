"use client";

import Header from "@/components/Header";
import {
  Flex,
  Card,
  Heading,
  Button,
  Table,
  Skeleton,
  IconButton,
  Tooltip,
  AlertDialog,
  Container,
} from "@radix-ui/themes";
import ModalFormStore from "@/components/Form/Modal/ModalFormStore";
import { useStoreForm } from "@/hooks/useStoreForm";
import { toast } from "sonner";
import { useStoreContext } from "@/context/StoreContext";
import { useState } from "react";
import { DataTable } from "../../../components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { StoreToolbar } from "./(data-table)/toolbar";

export default function StorePage() {
  const {
    stores,
    createStore,
    updateStore,
    deleteStore,
  } = useStoreContext();

  const { isOpen, mode, current, openCreate, openEdit, close } =
    useStoreForm();

  const [filterValue, setFilterValue] = useState("");
  const [selectedField, setSelectedField] = useState("name");

  const [loading,] = useState(false);

  async function handleCreate(data: { name: string }) {
    try {
      await createStore(data);
      close();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar loja!");
    }
  }

  async function handleEdit(data: { store_id: number; name: string }) {
    try {
      await updateStore(data);
      close();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao editar loja!");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteStore(id);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao deletar loja!");
    }
  }

  return (
    <Flex direction="column" align="center" className="min-h-screen w-full">
      <Header />
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={loading} className="h-2/5">
          <Container>
            <DataTable
              columns={getColumns(openEdit, handleDelete, filterValue, selectedField)}
              data={stores}
              handleCreate={openCreate}
              title="Loja"
              createButtonToolTip="Criar nova loja"
              renderToolbar={(table) => (
                <StoreToolbar
                  table={table}
                  selectedField={selectedField}
                  onSelectedFieldChange={setSelectedField}
                  filterValue={filterValue}
                  onFilterValueChange={setFilterValue}
                />
              )}
            />
          </Container>
        </Skeleton>
      </Flex>

      {isOpen && (
        <ModalFormStore
          mode={mode}
          initial={mode === "edit" && current ? current : undefined}
          onClose={close}
          onCreate={handleCreate}
          onEdit={handleEdit}
        />
      )}
    </Flex>
  );
}
