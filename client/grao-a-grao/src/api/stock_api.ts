import { getAPIUrl, getAuthToken, getSelectedStore } from "@/util/util";
import { StockResponse } from "@/types/stock";

/**
 * Fetch all stock records from the server.
 */
export async function fetchStocks(): Promise<StockResponse[]> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/stock`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "",
      },
    });

    if (!res.ok) {
      throw new Error("Error fetching stock data");
    }

    const data: StockResponse[] = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
