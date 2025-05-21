import { getAPIUrl, getAuthToken, getSelectedStore } from "@/util/util";
import { CategoryRequest, CategoryResponse } from "@/types/category";


export async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },
    });

    if (!res.ok)
      throw new Error('Error fetching categories');

    const data: CategoryResponse[] = await res.json();
    return data;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createCategory(category: CategoryRequest): Promise<CategoryResponse> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },

      body: JSON.stringify(category)
    });

    if (!res.ok)
      throw new Error('Error creating category');

    const created: CategoryResponse = await res.json();
    return created;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateCategory(category: CategoryRequest): Promise<CategoryResponse> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store?.id?.toString() ?? "0",
      },
      body: JSON.stringify(category)
    });

    if (!res.ok)
      throw new Error('Error updating category');

    const updated: CategoryResponse = await res.json();
    return updated;

  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteCategory(id: number): Promise<void> {

  const token = getAuthToken();
  const store = getSelectedStore();

  const res = await fetch(`${getAPIUrl()}/items/categories/${id}`, {
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