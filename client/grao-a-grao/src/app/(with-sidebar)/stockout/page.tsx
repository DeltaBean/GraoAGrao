"use client";

import { Badge, Button, Card, Container, Flex, Heading, IconButton, Skeleton, Table, Tooltip } from "@radix-ui/themes";
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
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { StockOutToolbar } from "./(data-table)/toolbar";

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

      toast.success('Saída finalizada com sucesso!');
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

  const handleCreate = () => {
    router.push("/stockout/create");
  }

  const handleEdit = (stockInId: number) => {
    router.push(`/stockout/edit?id=${stockInId}`)
  }

  const handleView = (stockInId: number) => {
    router.push(`/stockout/view?id=${stockInId}`)
  }

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
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={loadingData.isLoading} className="h-2/5">
          <Container>
            <DataTable
              columns={getColumns(handleDelete, handleEdit, handleFinalize, handleView)}
              data={stockOut}
              handleCreate={handleCreate}
              title="Saída de Estoque"
              createButtonToolTip="Criar nova saída de estoque"
              renderToolbar={(table) => (<StockOutToolbar table={table} />)}
            />
          </Container>
        </Skeleton>
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
