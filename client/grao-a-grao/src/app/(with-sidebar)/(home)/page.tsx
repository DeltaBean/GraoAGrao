// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Card, Container, Flex, Skeleton } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockResponse, StockModel, StockResponse } from "@/types/stock";
import * as stock_api from "@/api/stock_api";
import * as categories_api from "@/api/categories_api";
import * as units_api from "@/api/units_api";
import { getSelectedStore } from "@/util/util";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";
import { normalizeUnitOfMeasureResponse, UnitOfMeasureModel, UnitOfMeasureResponse } from "@/types/unit_of_measure";
import { CategoryModel, CategoryResponse, normalizeCategoryResponse } from "@/types/category";
import { StockToolbar } from "./(data-table)/toolbar";
import { useLoading } from "@/hooks/useLoading";
import LoadingModal from "@/components/LoadingModal";

export default function HomePage() {
  const storeId = getSelectedStore()?.id

  const [stock, setStock] = useState<StockModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasureModel[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedField, setSelectedField] = useState("item-description");

  const {
    loadingData,
    setIsLoading,
    setMessage: setLoadingMessage,
  } = useLoading();

  // Fetch items when the component mounts.
  useEffect(() => {
    fetchStock();
    fetchUnitsOfMeasure();
    fetchCategories();
  }, [storeId]);

  const fetchStock = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando estoque...");

    try {
      const stockResponse: StockResponse[] = await stock_api.fetchStocks();
      const stockModel: StockModel[] = stockResponse.map(
        (st) => { return normalizeStockResponse(st) }
      );

      setStock(stockModel ?? []);

    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }
  const fetchUnitsOfMeasure = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando unidades de medida...");

    try {
      const unitOfMeasureResponse: UnitOfMeasureResponse[] = await units_api.fetchUnits();
      const unitOfMeasureModel: UnitOfMeasureModel[] = unitOfMeasureResponse.map(
        (unit) => { return normalizeUnitOfMeasureResponse(unit) }
      );

      setUnitsOfMeasure(unitOfMeasureModel ?? []);

    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  const fetchCategories = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando categorias...");

    try {
      const categoryResponse: CategoryResponse[] = await categories_api.fetchCategories();
      const categoryModel: CategoryModel[] = categoryResponse.map(
        (cat) => { return normalizeCategoryResponse(cat) }
      );

      setCategories(categoryModel ?? []);

    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Flex direction={"column"} align={"center"} className="min-h-screen w-full">
      <Header />
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={false} className="h-2/5">
          <Container>
            <DataTable
              columns={getColumns(filterValue, selectedField)}
              data={stock}
              title="Estoque"
              renderToolbar={(table) => (
                <StockToolbar
                  table={table}
                  categories={categories}
                  units={unitsOfMeasure}
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
      <LoadingModal isOpen={loadingData.isLoading} message={loadingData.message} />
    </Flex>
  );
}
