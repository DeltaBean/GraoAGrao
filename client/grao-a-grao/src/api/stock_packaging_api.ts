import { getAPIUrl, getAuthToken } from "@/util/util";
import { StockPackaging, CreateStockPackaging, UpdateStockPackaging } from "@/model/stock_model";

export async function fetchStockPackaging(): Promise<StockPackaging[]> {
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

    const data: StockPackaging[] = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createStockPackaging(stockPackaging: CreateStockPackaging): Promise<StockPackaging> {
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

    const created: StockPackaging = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateStockPackaging(stockPackaging: UpdateStockPackaging): Promise<StockPackaging> {
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

    const updated: StockPackaging = await res.json();
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
