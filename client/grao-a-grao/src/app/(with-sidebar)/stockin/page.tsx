// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Badge, Button, Card, Flex, Heading, IconButton, Skeleton, Table, Tooltip } from "@radix-ui/themes";
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
      <Flex
        id="main-flex"
        className="flex-1 w-full"
        direction={"column"}
        justify={"center"}
        align={"center"}
      >
        <Card
          id="main-flex"
          className="flex-1 my-3 w-14/16 sm:w-9/10 sm:my-12 flex-col"
          style={{ display: "flex" }}
        >

          <Flex
            className="w-full bg-[var(--accent-4)]" p={"3"}
            style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }}
            justify={"between"}
            align={"center"}
          >

            <Heading size={{ sm: "8" }} weight={"bold"}>Entrada de Estoque</Heading>
            <Tooltip content="Criar nova entrada de estoque">
              <Button size="3"> <Link href="/stockin/create">Criar</Link></Button>
            </Tooltip>
          </Flex>

          <Skeleton loading={loadingData.isLoading} className="h-2/5 flex-1" style={{ borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
            <Table.Root>

              <Table.Header>

                <Table.Row align={"center"}>
                  <Table.ColumnHeaderCell>Data de Entrada</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Ações</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>

                {loadingData.isLoading ? (null) : (
                  stockIn.map((si) => (
                    <Table.Row key={si.id} align={"center"}>
                      <Table.RowHeaderCell>{formatDateTime(si.created_at)}</Table.RowHeaderCell>
                      <Table.Cell>
                        {
                          si.status == "draft" ?
                            (
                              <Tooltip content="Ainda não finalizada, permite edição">
                                <Badge color="amber" variant="surface">Rascunho</Badge>
                              </Tooltip>
                            )
                            : si.status == "finalized" ?
                              (
                                <Tooltip
                                  content={
                                    <>
                                      Confirmada e integrada ao estoque, não permite edição.
                                      <br />
                                      Finalizada em: {formatDateTime(si.finalized_at)}
                                    </>
                                  }
                                >
                                  <Badge variant="surface">Finalizada</Badge>
                                </Tooltip>
                              )
                              : ""
                        }
                      </Table.Cell>
                      <Table.Cell>
                        <Flex direction={"row"} justify={"start"} align={"center"} gap={"2"}>
                          <Tooltip content={si.status == "draft" ? "Editar entrada de estoque" : "Finalizada, edição não permitida."}>
                            <IconButton
                              disabled={si.status === "finalized"}
                              size={"1"}
                              about="Edit"
                              variant="soft"
                              onClick={
                                (ev) => {
                                  ev.stopPropagation();
                                  router.push(`/stockin/edit?id=${si.id}`)
                                }
                              }>
                              <PencilSquareIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={si.status == "draft" ? "Finalizar entrada de estoque. Após finalizada será integrada ao estoque e não poderá mais ser editada." : "Já finalizada."}>
                            <IconButton
                              disabled={si.status === "finalized"}
                              size={"1"}
                              about="Finalize"
                              variant="soft"
                              onClick={() => { handleFinalize(si.id ?? 0); }}>
                              <CheckCircleIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content={si.status == "draft" ? "Deletar entrada de estoque." : "Finalizada, deleção não permitida."}>
                            <IconButton
                              disabled={si.status === "finalized"}
                              color="red"
                              size={"1"}
                              about="Finalize"
                              variant="soft"
                              onClick={() => { handleDelete(si.id ?? 0); }}>
                              <TrashIcon height="16" width="16" />
                            </IconButton>
                          </Tooltip>
                          {si.status == "finalized" ?
                            (
                              <Tooltip content="Visualizar entrada de estoque.">
                                <IconButton
                                  size={"1"}
                                  about="Visualize"
                                  variant="soft"
                                  onClick={
                                    (ev) => {
                                      ev.stopPropagation();
                                      router.push(`/stockin/view?id=${si.id}`)
                                    }
                                  }>
                                  <EyeIcon height="16" width="16" />
                                </IconButton>
                              </Tooltip>
                            )
                            : ""
                          }
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}

              </Table.Body>
            </Table.Root>
          </Skeleton>
        </Card>
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
