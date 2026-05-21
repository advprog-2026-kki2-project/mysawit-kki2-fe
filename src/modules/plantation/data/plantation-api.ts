import { requestEmpty, requestJson } from "@/lib/api-client";
import type {
  Driver,
  Foreman,
  Plantation,
  PlantationPayload,
} from "@/modules/plantation/data/types";

export function getPlantations() {
  return requestJson<Plantation[]>("/api/plantations", {
    method: "GET",
  });
}

export function searchPlantations(filters: { name?: string; code?: string; foremanId?: string }) {
  const params = new URLSearchParams();
  if (filters.name?.trim()) params.set("name", filters.name.trim());
  if (filters.code?.trim()) params.set("code", filters.code.trim());
  if (filters.foremanId?.trim()) params.set("foremanId", filters.foremanId.trim());
  const query = params.toString();

  return requestJson<Plantation[]>(`/api/plantations${query ? `?${query}` : ""}`, {
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

export function getForemen() {
  return requestJson<Foreman[]>("/api/foremen", {
    method: "GET",
  });
}

export function createForeman(payload: { foremanName: string; employeeCode: string }) {
  return requestJson<Foreman>("/api/foremen", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteForeman(foremanId: string) {
  return requestEmpty(`/api/foremen/${foremanId}`, {
    method: "DELETE",
  });
}

export function assignForemanToPlantation(foremanId: string, plantationId: string) {
  return requestEmpty(`/api/foremen/${foremanId}/plantations/${plantationId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unassignForemanFromPlantation(foremanId: string, plantationId: string) {
  return requestEmpty(`/api/foremen/${foremanId}/plantations/${plantationId}`, {
    method: "DELETE",
  });
}

export function getDrivers() {
  return requestJson<Driver[]>("/api/drivers", {
    method: "GET",
  });
}

export function createDriver(payload: { driverName: string; licenseNumber: string }) {
  return requestJson<Driver>("/api/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteDriver(driverId: string) {
  return requestEmpty(`/api/drivers/${driverId}`, {
    method: "DELETE",
  });
}

export function assignDriverToPlantation(driverId: string, plantationId: string) {
  return requestEmpty(`/api/drivers/${driverId}/plantations/${plantationId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unassignDriverFromPlantation(driverId: string, plantationId: string) {
  return requestEmpty(`/api/drivers/${driverId}/plantations/${plantationId}`, {
    method: "DELETE",
  });
}
