export type HarvestSubmissionPayload = {
  harvestDate: string;
  weightKg: string;
  notes: string;
  photos: File[];
};

export type HarvestSubmissionResult = {
  message: string;
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  status: string;
  photoUrls: string[];
};

export type DailyHarvest = {
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  photoUrls: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type RejectHarvestPayload = {
  reason: string;
};

export type ActionResponse = {
  message?: string;
  error?: string;
};