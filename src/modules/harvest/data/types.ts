export type HarvestSubmissionPayload = {
  harvestDate: string;
  weightKg: string;
  notes: string;
  photo: File;
};

export type HarvestSubmissionResult = {
  message: string;
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  status: string;
};

export type HarvestRecord = {
  id: string;
  laborerName: string;
  harvestDate: string;
  weightKg: number;
  notes: string;
  photoPath: string;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type LaborerHarvestFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type ForemanHarvestFilters = {
  laborerName?: string;
  harvestDate?: string;
};
