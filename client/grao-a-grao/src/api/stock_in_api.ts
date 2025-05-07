// api/stock_in.ts

import { getAPIUrl, getAuthToken } from "@/util/util";
import {
  CreateStockInRequest,
  UpdateStockInRequest,
  StockInResponse,
} from "@/types/stock_in";

// Fetch all stock-ins
export async function fetchStockIns(): Promise<StockInResponse[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/in`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error("Error fetching stock-ins");

    const data: StockInResponse[] = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Fetch a single stock-in by ID
export async function fetchStockInById(id: number): Promise<StockInResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/in/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error("Error fetching stock-in");

    const data: StockInResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Create a stock-in
export async function createStockIn(request: CreateStockInRequest): Promise<StockInResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok)
      throw new Error("Error creating stock-in");

    const created: StockInResponse = await res.json();
    return created;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Update a stock-in
export async function updateStockIn(request: UpdateStockInRequest): Promise<StockInResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/stock/in`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok)
      throw new Error("Error updating stock-in");

    const updated: StockInResponse = await res.json();
    return updated;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Delete a stock-in
export async function deleteStockIn(id: number): Promise<void> {
  const token = getAuthToken();

  const res = await fetch(`${getAPIUrl()}/stock/in/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
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

    throw new Error("Unknown server error while deleting stock-in.");
  }
}

export async function finalizeStockIn(id: number): Promise<void> {
  const token = getAuthToken();

  const res = await fetch(`${getAPIUrl()}/stock/in/finalize/${id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
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

    throw new Error("Unknown server error while deleting stock-in.");
  }
}