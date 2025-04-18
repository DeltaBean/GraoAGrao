import { getAPIUrl, getAuthToken } from "@/util/util";
import { Category, CreateCategoryInput } from "@/model/items_model";


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

export async function createCategory(category: CreateCategoryInput): Promise<Category> {
  try {
    console.log(category);
    const token = getAuthToken();;

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(category)
    });

    if (!res.ok)
      throw new Error('Error creating category');

    const created: Category = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateCategory(category: Category): Promise<Category> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(category)
    });

    if (!res.ok)
      throw new Error('Error updating category');

    const updated: Category = await res.json();
    return updated;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
    try {
      const token = getAuthToken();
      const res = await fetch(`${getAPIUrl()}/items/categories/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!res.ok)
        throw new Error('Error deleting category');
  
      return true;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }