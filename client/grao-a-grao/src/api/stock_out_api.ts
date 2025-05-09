// api/stock_out.ts

import { getAPIUrl, getAuthToken } from "@/util/util";
import {
  CreateStockOutRequest,
  UpdateStockOutRequest,
  StockOutResponse,
} from "@/types/stock_out";

// Fetch all stock-outs
export async function fetchStockOuts(): Promise<StockOutResponse[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/out`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error fetching stock-outs");

    const data: StockOutResponse[] = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Fetch a single stock-out by ID
export async function fetchStockOutById(id: number): Promise<StockOutResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/out/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error fetching stock-out");

    const data: StockOutResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Create a stock-out
export async function createStockOut(
  request: CreateStockOutRequest,
): Promise<StockOutResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error("Error creating stock-out");

    const created: StockOutResponse = await res.json();
    return created;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Update a stock-out
export async function updateStockOut(
  request: UpdateStockOutRequest,
): Promise<StockOutResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/out`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error("Error updating stock-out");

    const updated: StockOutResponse = await res.json();
    return updated;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Delete a stock-out
export async function deleteStockOut(id: number): Promise<void> {
  const token = getAuthToken();

  const res = await fetch(`${getAPIUrl()}/stock/out/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw {
        status: res.status,
        data,
      };
    }

    throw new Error(
      "Unknown server error while deleting stock-out.",
    );
  }
}

// Finalize a stock-out
export async function finalizeStockOut(id: number): Promise<void> {
  const token = getAuthToken();

  const res = await fetch(`${getAPIUrl()}/stock/out/finalize/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      throw {
        status: res.status,
        data,
      };
    }

    throw new Error(
      "Unknown server error while finalizing stock-out.",
    );
  }
}
