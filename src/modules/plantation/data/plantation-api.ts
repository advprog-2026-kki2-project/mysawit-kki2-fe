import { requestEmpty, requestJson } from "@/lib/api-client";
import type { Plantation, PlantationPayload, Foreman, Driver } from "@/modules/plantation/data/types";

export function getPlantations(filters?: { name?: string; code?: string; foremanId?: string }) {
  const params = new URLSearchParams();
  if (filters?.name) params.append("name", filters.name);
  if (filters?.code) params.append("code", filters.code);
  if (filters?.foremanId) params.append("foremanId", filters.foremanId);

  const queryString = params.toString();
  const url = queryString ? `/api/plantations?${queryString}` : "/api/plantations";

  return requestJson<Plantation[]>(url, {
    method: "GET",
  });
}

export function getForemen() {
  return requestJson<Foreman[]>("/api/plantations/foremen", {
    method: "GET",
  });
}

export function getDrivers() {
  return requestJson<Driver[]>("/api/plantations/drivers", {
    method: "GET",
  });
}

export function createPlantation(payload: PlantationPayload) {
  return requestJson<Plantation>("/api/plantations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePlantation(plantationId: string, payload: PlantationPayload) {
  return requestJson<Plantation>(`/api/plantations/${plantationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePlantation(plantationId: string) {
  return requestEmpty(`/api/plantations/${plantationId}`, {
    method: "DELETE",
  });
}
