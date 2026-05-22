import { requestJson } from "@/lib/api-client";
import type {
  ApprovedHarvestPickup,
  PickupPayload,
  Transport,
  TransportStatus,
} from "@/modules/transport/data/types";

export function assignPickup(payload: PickupPayload) {
  return requestJson<Transport>("/api/transport/assign-pickup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAvailablePickups(filters?: { laborerName?: string }) {
  const params = new URLSearchParams();
  if (filters?.laborerName?.trim()) params.set("laborerName", filters.laborerName.trim());
  const query = params.toString();

  return requestJson<ApprovedHarvestPickup[]>(
    `/api/transport/available-pickups${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

export function getDriverDeliveries(driverId: string) {
  return requestJson<Transport[]>(`/api/transport/driver/${driverId}`, {
    method: "GET",
  });
}

export function updateTransportStatus(transportId: number, status: TransportStatus) {
  return requestJson<Transport>(
    `/api/transport/${transportId}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}

export function getOngoingDeliveries() {
  return requestJson<Transport[]>("/api/transport/ongoing", {
    method: "GET",
  });
}

export function getForemanApprovedDeliveries() {
  return requestJson<Transport[]>("/api/transport/foreman-approved", {
    method: "GET",
  });
}

export function verifyTransportByForeman(
  transportId: number,
  approved: boolean,
  rejectionReason?: string,
) {
  return requestJson<Transport>(`/api/transport/${transportId}/foreman-verify`, {
    method: "POST",
    body: JSON.stringify({ approved, rejectionReason }),
  });
}

export function verifyTransportByAdmin(
  transportId: number,
  payload: { approved: boolean; recognizedWeight?: number; rejectionReason?: string },
) {
  return requestJson<Transport>(`/api/transport/${transportId}/admin-verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
