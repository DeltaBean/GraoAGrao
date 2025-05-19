"use client";

import { Badge, Button, Card, Flex, Heading, IconButton, Skeleton, Table, Tooltip } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockOutResponse, StockOutModel, StockOutResponse } from "@/types/stock_out";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import * as stock_out_api from "@/api/stock_out_api";
import { formatDateTime, getSelectedStore } from "@/util/util";
import { useLoading } from "@/hooks/useLoading";
import ModalGenericError from "@/components/Error/ModalGenericError";
import { ErrorCodes, StockOutTotalQuantityNotMatchingResponse } from "@/errors/api_error";

export default function StockOutPage() {
  const storeId = getSelectedStore()?.id

  const router = useRouter();

  type ErrorModalState =
    | { type: "finalize-total-quantity-wrong"; data: StockOutTotalQuantityNotMatchingResponse; }
    | { type: "none" };
  const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });

  const [stockOut, setStockOut] = useState<StockOutModel[]>([]);
  const { loadingData, setIsLoading, setMessage: setLoadingMessage } = useLoading();

  // Fetch stock-outs on mount
  useEffect(() => {
    fetchStockOut();
  }, [storeId]);

  const fetchStockOut = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Saídas de Estoque...");

    try {

      const response: StockOutResponse[] = await stock_out_api.fetchStockOuts();
      const models = response.map((so) => normalizeStockOutResponse(so));
      setStockOut(models ?? []);

    } catch (err) {

      console.error(err);

    } finally {
      setIsLoading(false);
    }
  };

  const handleStockInTotalQuantityNotMatchingError = (err: StockOutTotalQuantityNotMatchingResponse) => {
    setErrorModal({ type: "finalize-total-quantity-wrong", data: err });
  }

  const handleFinalize = async (id: number) => {
    setIsLoading(true);
    setLoadingMessage("Finalizando Saída de Estoque...");

    try {

      await stock_out_api.finalizeStockOut(id);

      setStockOut((prev) =>
        prev.map((so) => (so.id === id ? { ...so, status: "finalized", finalized_at: new Date().toISOString() } : so))
      );

    } catch (err) {
      console.error(err);

      const errorWithData = err as { data?: { internal_code?: string } };

      if (errorWithData?.data?.internal_code === ErrorCodes.STOCK_OUT_TOTAL_QUANTITY_WRONG) {
        const errorData: StockOutTotalQuantityNotMatchingResponse = errorWithData.data as StockOutTotalQuantityNotMatchingResponse;
        handleStockInTotalQuantityNotMatchingError(errorData);

      } else {
        alert("Unexpected error occurred while finalizing the stock out.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    setLoadingMessage("Deletando Saída de Estoque...");

    try {

      await stock_out_api.deleteStockOut(id);
      setStockOut((prev) => prev.filter((so) => so.id !== id));

    } catch (err) {

      console.error(err);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" className="min-h-screen w-full">
      <Header />
      <Flex id="main-flex" className="flex-1 w-full" direction="column" justify="center" align="center">
        <Card className="flex-1 w-8/10 sm:w-9/10 sm:my-12 flex-col" style={{ display: "flex" }}>
          <Flex className="w-full bg-[var(--accent-4)]" p="3" justify="between" align="center" style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}>
            <Heading size={{ sm: "8" }} weight="bold">Saída de Estoque</Heading>
            <Tooltip content="Criar nova saída de estoque">
              <Button size="3"><Link href="/stockout/create">Criar</Link></Button>
            </Tooltip>
          </Flex>

          <Skeleton loading={loadingData.isLoading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <Table.Root>
              <Table.Header>
                <Table.Row align="center">
                  <Table.ColumnHeaderCell>Data de Saída</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loadingData.isLoading
                  ? null
                  : stockOut.map((so) => (
                    <Table.Row key={so.id} align="center">
                      <Table.RowHeaderCell>{formatDateTime(so.created_at)}</Table.RowHeaderCell>
                      <Table.Cell>
                        {so.status === "draft" ? (
                          <Tooltip content="Ainda não finalizada, permite edição">
                            <Badge color="amber" variant="surface">Rascunho</Badge>
                          </Tooltip>
                        ) : (
                          <Tooltip content={`Finalizada em: ${formatDateTime(so.finalized_at)}`}>
                            <Badge variant="surface">Finalizada</Badge>
                          </Tooltip>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex direction="row" justify="start" align="center" gap="2">
                          <Tooltip content={so.status === "draft" ? "Editar saída de estoque" : "Saída finalizada, edição não permitida"}>
                            <IconButton disabled={so.status === "finalized"} size="1" variant="soft" onClick={() => router.push(`/stockout/edit?id=${so.id}`)}>
                              <PencilSquareIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={so.status === "draft" ? "Finalizar saída de estoque" : "Já finalizada"}>
                            <IconButton disabled={so.status === "finalized"} size="1" variant="soft" onClick={() => handleFinalize(so.id ?? 0)}>
                              <CheckCircleIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={so.status === "draft" ? "Deletar saída de estoque" : "Finalizada, exclusão não permitida"}>
                            <IconButton disabled={so.status === "finalized"} size="1" color="red" variant="soft" onClick={() => handleDelete(so.id ?? 0)}>
                              <TrashIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          {so.status === "finalized" && (
                            <Tooltip content="Visualizar saída de estoque">
                              <IconButton size="1" variant="soft" onClick={() => router.push(`/stockout/view?id=${so.id}`)}>
                                <EyeIcon height="16" width="16" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Skeleton>
        </Card>
      </Flex>
      {errorModal.type === "finalize-total-quantity-wrong" && (
        <ModalGenericError
          title="Não é possível finalizar."
          details=" Quantidade total de algum item desta saída de estoque está inconsistente com a soma de seus fracionamentos. Acesse a saída de estoque e verifique."
          onClose={() => setErrorModal({ type: "none" })}
        />
      )}
    </Flex>
  );
}
