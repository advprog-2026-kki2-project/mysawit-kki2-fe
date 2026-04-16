import { requestEmpty, requestJson } from "@/lib/api-client";
import type { Plantation, PlantationPayload } from "@/modules/plantation/data/types";

export function getPlantations() {
  return requestJson<Plantation[]>("/api/plantations", {
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
