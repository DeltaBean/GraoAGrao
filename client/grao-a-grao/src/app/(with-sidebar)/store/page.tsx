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
} from "@radix-ui/themes";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import * as storesApi from "@/api/stores_api";
import { StoreModel, normalizeStoreResponse } from "@/types/store";
import ModalFormStore from "@/components/Form/Modal/ModalFormStore";
import { useStoreForm } from "@/hooks/useStoreForm";
import { toast } from "sonner";

export default function StorePage() {
  const [stores, setStores] = useState<StoreModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen, mode, current, openCreate, openEdit, close } =
    useStoreForm();

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    try {
      const res = await storesApi.fetchStores();
      setStores(res.map(normalizeStoreResponse));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: { name: string }) {
    try {
      const created = normalizeStoreResponse(await storesApi.createStore(data));
      setStores((prev) => [...prev, created]);
      close();
      toast.success("Loja criada com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleEdit(data: { store_id: number; name: string }) {
    try {
      const updated = normalizeStoreResponse(await storesApi.updateStore(data));
      setStores((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      close();
      toast.success("Loja editada com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id: number) {
    try {
      await storesApi.deleteStore(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      toast.success("Loja deletada com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <Flex direction="column" align="center" className="min-h-screen w-full">

      <Card className="flex-1 w-4/5 mt-8 flex-col">
        <Flex
          justify="between"
          align="center"
          p="3"
          className="bg-[var(--accent-4)] rounded-t-lg"
        >
          <Heading size={{ sm: "8" }} weight="bold">
            Loja
          </Heading>
          <Tooltip content="Criar nova loja">
            <Button size="3" onClick={openCreate}>
              Criar
            </Button>
          </Tooltip>
        </Flex>

        <Skeleton loading={loading} className="h-2/5">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {stores.map((store) => (
                <Table.Row key={store.id}>
                  <Table.RowHeaderCell>{store.name}</Table.RowHeaderCell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Tooltip content="Editar loja">
                        <IconButton
                          size="1"
                          variant="soft"
                          onClick={() => openEdit(store)}
                        >
                          <PencilSquareIcon height={16} width={16} />
                        </IconButton>
                      </Tooltip>
                      <AlertDialog.Root>
                        <Tooltip content="Delete">
                          <AlertDialog.Trigger>
                            <IconButton size="1" color="red" variant="soft">
                              <TrashIcon height={16} width={16} />
                            </IconButton>
                          </AlertDialog.Trigger>
                        </Tooltip>
                        <AlertDialog.Content maxWidth="350px">
                          <AlertDialog.Title>Deletar {store.name}?</AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            Tem certeza? Esta loja será deletada permanentemente.
                          </AlertDialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button variant="soft" color="gray">
                                Cancelar
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                variant="solid"
                                color="red"
                                onClick={() => handleDelete(store.id)}
                              >
                                Deletar
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Skeleton>
      </Card>

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
