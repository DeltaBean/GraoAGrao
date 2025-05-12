import { getAPIUrl, getAuthToken, getSelectedStore } from "@/util/util";
import { UnitOfMeasureRequest, UnitOfMeasureResponse } from "@/types/unit_of_measure";

export async function fetchUnits(): Promise<UnitOfMeasureResponse[]> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items/units`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store.id.toString(),
      },
    });

    if (!res.ok)
      throw new Error('Error fetching units of measure');

    const data: UnitOfMeasureResponse[] = await res.json();
    return data;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function createUnit(unit: UnitOfMeasureRequest): Promise<UnitOfMeasureResponse> {
  try {
    const token = getAuthToken();
    const store = getSelectedStore();

    const res = await fetch(`${getAPIUrl()}/items/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Store-ID": store.id.toString(),
      },
      body: JSON.stringify(unit)
    });

    if (!res.ok)
      throw new Error('Error creating unit of measure');

    const created: UnitOfMeasureResponse = await res.json();
    return created;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function updateUnit(unit: UnitOfMeasureRequest): Promise<UnitOfMeasureResponse> {
  try {
    const token = getAuthToken();

    const res = await fetch(`${getAPIUrl()}/items/units`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(unit)
    });

    if (!res.ok)
      throw new Error('Error updating unit of measure');

    const updated: UnitOfMeasureResponse = await res.json();
    return updated;

  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function deleteUnit(id: number): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${getAPIUrl()}/items/units/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`,
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
  ;
}
