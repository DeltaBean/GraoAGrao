import { getAPIUrl, getAuthToken, getSelectedStore } from "@/util/util";
import { ItemRequest, ItemResponse } from "@/types/item";

export async function fetchItems(): Promise<ItemResponse[]> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();
    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },
    });

    if (!res.ok)
      throw new Error('Error fetching items');

    const data: ItemResponse[] = await res.json();
    return data;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createItem(item: ItemRequest): Promise<ItemResponse> {
  try {
    const token = getAuthToken();;
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },
      body: JSON.stringify(item)
    });

    if (!res.ok)
      throw new Error('Error creating item');

    const created: ItemResponse = await res.json();
    return created;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateItem(item: ItemRequest): Promise<ItemResponse> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },
      body: JSON.stringify(item)
    });

    if (!res.ok)
      throw new Error('Error updating item');

    const updated: ItemResponse = await res.json();
    return updated;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteItem(id: number): Promise<void> {
  const token = getAuthToken();
  const store = getSelectedStore();
  
  const res = await fetch(`${getAPIUrl()}/items/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Store-ID": store?.id?.toString() ?? "0",
    },
  });

  if (!res.ok) {
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();

      // throw structured error with type attached
      throw {
        status: res.status,
        data,
      };
    }

    throw new Error('Unknown server error while deleting item.');
  }
}
