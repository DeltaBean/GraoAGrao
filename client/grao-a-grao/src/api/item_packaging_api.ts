import { getAPIUrl, getAuthToken } from "@/util/util";
import { ItemPackagingRequest, ItemPackagingResponse } from "@/types/item_packaging";

export async function fetchItemPackaging(): Promise<ItemPackagingResponse[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items/packaging`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error fetching item packaging');

    const data: ItemPackagingResponse[] = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createItemPackaging(itemPackaging: ItemPackagingRequest): Promise<ItemPackagingResponse> {
  try {
    const token = getAuthToken();;

    const res = await fetch(`${getAPIUrl()}/items/packaging`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(itemPackaging)
    });

    if (!res.ok)
      throw new Error('Error creating item packaging');

    const created: ItemPackagingResponse = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateItemPackaging(itemPackaging: ItemPackagingRequest): Promise<ItemPackagingResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items/packaging`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(itemPackaging)
    });

    if (!res.ok)
      throw new Error('Error updating item packaging');

    const updated: ItemPackagingResponse = await res.json();
    return updated;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function deleteItemPackaging(id: number): Promise<boolean> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/items/packaging/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error deleting item packaging');

    return true;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
