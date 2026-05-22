export const transportStatusOptions = [
  "LOADING",
  "TRANSPORTING",
  "ARRIVED",
  "FOREMAN_APPROVED",
  "FOREMAN_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
] as const;

export type TransportStatus = (typeof transportStatusOptions)[number];

export const transportStatusLabels: Record<TransportStatus, string> = {
  LOADING: "Memuat",
  TRANSPORTING: "Mengirim",
  ARRIVED: "Tiba di Tujuan",
  FOREMAN_APPROVED: "Disetujui Mandor",
  FOREMAN_REJECTED: "Ditolak Mandor",
  ADMIN_APPROVED: "Disetujui Admin",
  ADMIN_REJECTED: "Ditolak Admin",
};

export type Transport = {
  id: number;
  driverId: string;
  foremanName: string;
  harvestIds: string[];
  totalWeight: number;
  status: TransportStatus;
  createdAt: string | null;
  rejectionReason: string | null;
  foremanApproved: boolean | null;
  foremanRejectionReason: string | null;
  adminApproved: boolean | null;
  adminRejectionReason: string | null;
  recognizedWeight: number | null;
};

export type PickupPayload = {
  driverId: string;
  foremanName: string;
  harvestIds: string[];
};

export type ApprovedHarvestPickup = {
  harvestId: string;
  laborerName: string;
  weightKg: number;
};
