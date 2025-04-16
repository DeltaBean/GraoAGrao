import { getAPIUrl, getAuthToken } from "@/util/util";
import { Category, CreateItemInput, Item } from "@/model/items_model";

export async function fetchItems(): Promise<Item[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error fetching items');

    const data = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createItem(item: CreateItemInput): Promise<Item> {
  try {
    const token = getAuthToken();;

    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(item)
    });

    if (!res.ok)
      throw new Error('Error creating item');

    const created: Item = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateItem(item: Item): Promise<Item> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(item)
    });

    if (!res.ok)
      throw new Error('Error updating item');

    const updated: Item = await res.json();
    return updated;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function deleteItem(id: number): Promise<boolean> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${getAPIUrl()}/items/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error deleting item');

    return true;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok)
      throw new Error('Error fetching categories');

    const data = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}