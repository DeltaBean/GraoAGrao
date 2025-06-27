// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Badge, Button, Card, Container, Flex, Heading, IconButton, Skeleton, Table, Tooltip } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockInResponse, StockInModel, StockInResponse } from "@/types/stock_in";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import * as stock_in_api from "@/api/stock_in_api";
import { formatDateTime, getSelectedStore } from "@/util/util";
import { useLoading } from "@/hooks/useLoading";
import { ErrorCodes, StockInTotalQuantityNotMatchingResponse } from "@/errors/api_error";
import ModalGenericError from "@/components/Error/ModalGenericError";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { StockInToolbar } from "./(data-table)/toolbar";

export default function StockInPage() {
  const router = useRouter();


  const storeId = getSelectedStore()?.id

  type ErrorModalState =
    | { type: "finalize-total-quantity-wrong"; data: StockInTotalQuantityNotMatchingResponse; }
    | { type: "none" };

  const [errorModal, setErrorModal] = useState<ErrorModalState>({ type: "none" });

  const [stockIn, setStockIn] = useState<StockInModel[]>([]);
  const [, setError] = useState<string | null>(null);
  const {
    loadingData,
    setIsLoading,
    setMessage: setLoadingMessage,
  } = useLoading();

  // Fetch stock_in when the component mounts.
  useEffect(() => {
    fetchStockIn();
  }, [storeId]);

  const fetchStockIn = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Entradas de Estoque...");

    try {

      const stockInResponse: StockInResponse[] = await stock_in_api.fetchStockIns();
      const stockInModel: StockInModel[] = stockInResponse.map((si) => normalizeStockInResponse(si));

      setStockIn(stockInModel ?? []);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        setError(err.message);
      } else {
        console.error(String(err));
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleStockInTotalQuantityNotMatchingError = (err: StockInTotalQuantityNotMatchingResponse) => {
    setErrorModal({ type: "finalize-total-quantity-wrong", data: err });
  }

  const handleCreate = () => {
    router.push("/stockin/create");
  }

  const handleEdit = (stockInId: number) => {
    router.push(`/stockin/edit?id=${stockInId}`)
  }
  
  const handleView = (stockInId: number) => {
    router.push(`/stockin/view?id=${stockInId}`)
  }

  const handleFinalize = async (stockInId: number) => {
    setIsLoading(true);
    setLoadingMessage("Finalizando Entrada de Estoque...");

    try {

      await stock_in_api.finalizeStockIn(stockInId);

      setStockIn(prev =>
        prev.map(si =>
          si.id === stockInId
            ? { ...si, status: "finalized", finalized_at: new Date().toISOString() }
            : si
        )
      );

      toast.success('Entrada finalizada com sucesso!');
    } catch (err) {
      console.error(err);

      const errorWithData = err as { data?: { internal_code?: string } };

      if (errorWithData?.data?.internal_code === ErrorCodes.STOCK_IN_TOTAL_QUANTITY_WRONG) {

        const errorData: StockInTotalQuantityNotMatchingResponse = errorWithData.data as StockInTotalQuantityNotMatchingResponse;
        handleStockInTotalQuantityNotMatchingError(errorData);

      } else {
        alert("Ocorreu um erro não esperado ao tentar finalizar a entrada de estoque.");
        console.error(err);
      }

    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (stockInId: number) => {
    setIsLoading(true);
    setLoadingMessage("Deletando Entrada de Estoque...");

    try {

      await stock_in_api.deleteStockIn(stockInId);

      setStockIn(prev =>
        prev.filter(si => si.id !== stockInId)
      );
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        setError(err.message);
      } else {
        console.error(String(err));
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Flex direction={"column"} className="min-h-screen w-full">
      <Header />
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={loadingData.isLoading} className="h-2/5">
          <Container>
            <DataTable
              columns={getColumns(handleDelete, handleEdit, handleFinalize, handleView)}
              data={stockIn}
              handleCreate={handleCreate}
              title="Entrada de Estoque"
              createButtonToolTip="Criar nova entrada de estoque"
              renderToolbar={(table) => (<StockInToolbar table={table}/>)}
            />
          </Container>
        </Skeleton>
      </Flex>
      {errorModal.type === "finalize-total-quantity-wrong" && (
        <ModalGenericError
          title="Não é possível finalizar."
          details=" Quantidade total de algum item desta entrada de estoque está inconsistente com a soma de seus fracionamentos. Acesse a entrada de estoque e verifique."
          onClose={() => setErrorModal({ type: "none" })}
        />
      )}
    </Flex>
  );
}
