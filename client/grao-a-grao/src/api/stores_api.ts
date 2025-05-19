// src/api/stores_api.ts

import { getAPIUrl, getAuthToken } from "@/util/util";
import { CreateStoreRequest, UpdateStoreRequest, StoreResponse } from "@/types/store";

export async function fetchStores(): Promise<StoreResponse[]> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/stores`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error("Error fetching stores");

    const data: StoreResponse[] = await res.json();
    return data ?? [];
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createStore(store: CreateStoreRequest): Promise<StoreResponse> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(store),
    });

    if (!res.ok)
      throw new Error("Error creating store");

    const created: StoreResponse = await res.json();
    return created;
  } catch (err: any) {
    throw err;
  }
}

export async function updateStore(store: UpdateStoreRequest): Promise<StoreResponse> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/stores`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(store),
    });

    if (!res.ok)
      throw new Error("Error updating store");

    const updated: StoreResponse = await res.json();
    return updated;
  } catch (err: any) {
    throw err;
  }
}

export async function deleteStore(id: number): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${getAPIUrl()}/stores/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      // Throw structured error with status & payload
      throw {
        status: res.status,
        data,
      };
    }
    throw new Error("Unknown server error while deleting store.");
  }
}
