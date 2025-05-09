import { getAPIUrl, getAuthToken } from "@/util/util";
import { StockResponse } from "@/types/stock";

/**
 * Fetch all stock records from the server.
 */
export async function fetchStocks(): Promise<StockResponse[]> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/stock`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Error fetching stock data");
    }

    const data: StockResponse[] = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
