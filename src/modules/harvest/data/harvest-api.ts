import { requestFormData } from "@/lib/api-client";
import type {
  ActionResponse,
  DailyHarvest,
  HarvestSubmissionPayload,
  HarvestSubmissionResult,
  RejectHarvestPayload,
} from "@/modules/harvest/data/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function submitHarvest(payload: HarvestSubmissionPayload) {
  const formData = new FormData();
  formData.append("harvestDate", payload.harvestDate);
  formData.append("weightKg", payload.weightKg);
  formData.append("notes", payload.notes);

  payload.photos.forEach((photo) => {
    formData.append("photos", photo);
  });

  return requestFormData<HarvestSubmissionResult>("/api/harvests", formData, {
    method: "POST",
  });
}

export async function getLaborerHistory(
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<DailyHarvest[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const url = `/api/harvests/history?${params.toString()}`;

  const response = await fetch(API_BASE_URL + url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json();
}

export async function getForemanQueue(
  laborerName?: string,
  harvestDate?: string
): Promise<DailyHarvest[]> {
  const params = new URLSearchParams();
  if (laborerName) params.append("laborerName", laborerName);
  if (harvestDate) params.append("harvestDate", harvestDate);

  const url = `/api/foreman/harvests?${params.toString()}`;

  const response = await fetch(API_BASE_URL + url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch queue");
  }

  return response.json();
}

export async function approveHarvest(id: string): Promise<ActionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/foreman/harvests/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to approve harvest");
  return response.json();
}

export async function rejectHarvest(
  id: string,
  payload: RejectHarvestPayload
): Promise<ActionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/foreman/harvests/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to reject harvest");
  }

  return response.json();
}