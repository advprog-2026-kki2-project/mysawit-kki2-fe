import { requestFormData, requestJson } from "@/lib/api-client";
import type {
  ForemanHarvestFilters,
  HarvestRecord,
  HarvestSubmissionPayload,
  HarvestSubmissionResult,
  LaborerHarvestFilters,
} from "@/modules/harvest/data/types";

export function submitHarvest(payload: HarvestSubmissionPayload) {
  const formData = new FormData();
  formData.append("harvestDate", payload.harvestDate);
  formData.append("weightKg", payload.weightKg);
  formData.append("notes", payload.notes);
  formData.append("photo", payload.photo);

  return requestFormData<HarvestSubmissionResult>("/api/harvests", formData, {
    method: "POST",
  });
}

function buildQuery(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getLaborerHarvestHistory(filters: LaborerHarvestFilters) {
  return requestJson<HarvestRecord[]>(
    `/api/harvests/history${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export function getForemanHarvests(filters: ForemanHarvestFilters) {
  return requestJson<HarvestRecord[]>(
    `/api/foreman/harvests${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export function approveHarvest(harvestId: string) {
  return requestJson<{ message: string }>(`/api/foreman/harvests/${harvestId}/approve`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function rejectHarvest(harvestId: string, reason: string) {
  return requestJson<{ message: string }>(`/api/foreman/harvests/${harvestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
