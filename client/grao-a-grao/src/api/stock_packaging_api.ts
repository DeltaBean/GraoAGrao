import { getAPIUrl, getAuthToken } from "@/util/util";
import { StockPackagingRequest, StockPackagingResponse } from "@/model/stock_packaging";

export async function fetchStockPackaging(): Promise<StockPackagingResponse[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/packaging`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error fetching stock packaging');

    const data: StockPackagingResponse[] = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createStockPackaging(stockPackaging: StockPackagingRequest): Promise<StockPackagingResponse> {
  try {
    const token = getAuthToken();;

    const res = await fetch(`${getAPIUrl()}/stock/packaging`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(stockPackaging)
    });

    if (!res.ok)
      throw new Error('Error creating stock packaging');

    const created: StockPackagingResponse = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateStockPackaging(stockPackaging: StockPackagingRequest): Promise<StockPackagingResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/packaging`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(stockPackaging)
    });

    if (!res.ok)
      throw new Error('Error updating stock packaging');

    const updated: StockPackagingResponse = await res.json();
    return updated;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function deleteStockPackaging(id: number): Promise<boolean> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/stock/packaging/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error deleting stock packaging');

    return true;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
